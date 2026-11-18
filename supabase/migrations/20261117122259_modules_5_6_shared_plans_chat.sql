-- Shared plans, private one-to-one chat, and in-app notices for authenticated pilot users.
-- Apply after public.restaurants exists. Match rows are written by a trusted administrator
-- until the Dúo Sabores module supplies its own verified-match workflow.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references auth.users (id) on delete cascade,
  user_b uuid not null references auth.users (id) on delete cascade,
  restaurant_id text not null references public.restaurants (id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint matches_two_different_users check (user_a <> user_b)
);

create unique index matches_pair_restaurant_unique
  on public.matches (least(user_a, user_b), greatest(user_a, user_b), restaurant_id);

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null unique references public.matches (id) on delete cascade,
  restaurant_id text not null references public.restaurants (id) on delete restrict,
  participant_a uuid not null references auth.users (id) on delete cascade,
  participant_b uuid not null references auth.users (id) on delete cascade,
  created_by uuid not null references auth.users (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'visited', 'cancelled')),
  planned_for timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint plans_two_different_users check (participant_a <> participant_b)
);

create table public.plan_messages (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.plans (id) on delete cascade,
  sender_id uuid not null references auth.users (id) on delete cascade,
  client_nonce uuid not null,
  body text not null check (char_length(body) between 1 and 500 and body = btrim(body)),
  created_at timestamptz not null default now(),
  constraint plan_messages_retry_unique unique (plan_id, sender_id, client_nonce)
);

create table public.plan_notifications (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.plans (id) on delete cascade,
  recipient_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('new_plan', 'date_updated', 'cancelled', 'new_message')),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index plans_participant_a_updated_idx on public.plans (participant_a, updated_at desc);
create index plans_participant_b_updated_idx on public.plans (participant_b, updated_at desc);
create index matches_user_a_created_idx on public.matches (user_a, created_at desc);
create index matches_user_b_created_idx on public.matches (user_b, created_at desc);
create index plan_messages_plan_created_idx on public.plan_messages (plan_id, created_at);
create index plan_notifications_recipient_unread_idx
  on public.plan_notifications (recipient_id, created_at desc) where not is_read;

create or replace function private.is_plan_participant(p_plan_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.plans p
    where p.id = p_plan_id
      and auth.uid() is not null
      and auth.uid() in (p.participant_a, p.participant_b)
  );
$$;

alter table public.matches enable row level security;
alter table public.plans enable row level security;
alter table public.plan_messages enable row level security;
alter table public.plan_notifications enable row level security;

revoke all on table public.matches, public.plans, public.plan_messages, public.plan_notifications
  from public, anon, authenticated;
grant select on table public.matches, public.plans, public.plan_messages, public.plan_notifications
  to authenticated;

create policy matches_participants_can_read
  on public.matches for select to authenticated
  using (user_a = (select auth.uid()) or user_b = (select auth.uid()));

create policy plans_participants_can_read
  on public.plans for select to authenticated
  using (participant_a = (select auth.uid()) or participant_b = (select auth.uid()));

create policy plan_messages_participants_can_read
  on public.plan_messages for select to authenticated
  using ((select private.is_plan_participant(plan_id)));

create policy plan_notifications_recipient_can_read
  on public.plan_notifications for select to authenticated
  using (recipient_id = (select auth.uid()));

create or replace function private.create_shared_plan(p_match_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_match public.matches%rowtype;
  v_plan_id uuid;
  v_actor uuid := auth.uid();
begin
  if v_actor is null then
    raise exception using errcode = '42501', message = 'Authentication required';
  end if;

  select * into v_match
  from public.matches m
  where m.id = p_match_id and v_actor in (m.user_a, m.user_b)
  for share;

  if not found then
    raise exception using errcode = '42501', message = 'Match is not available';
  end if;

  if not exists (
    select 1 from public.restaurants r
    where r.id = v_match.restaurant_id and r.published
  ) then
    raise exception using errcode = 'P0001', message = 'Restaurant is not available';
  end if;

  insert into public.plans (match_id, restaurant_id, participant_a, participant_b, created_by)
  values (v_match.id, v_match.restaurant_id, v_match.user_a, v_match.user_b, v_actor)
  on conflict (match_id) do nothing
  returning id into v_plan_id;

  if v_plan_id is null then
    select p.id into v_plan_id from public.plans p where p.match_id = v_match.id;
  else
    insert into public.plan_notifications (plan_id, recipient_id, kind)
    values
      (v_plan_id, v_match.user_a, 'new_plan'),
      (v_plan_id, v_match.user_b, 'new_plan');
  end if;

  return v_plan_id;
end;
$$;

create or replace function public.create_shared_plan(p_match_id uuid)
returns uuid
language sql
security invoker
set search_path = ''
as $$ select private.create_shared_plan(p_match_id); $$;

create or replace function private.schedule_shared_plan(p_plan_id uuid, p_planned_for timestamptz)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_plan public.plans%rowtype;
  v_actor uuid := auth.uid();
  v_recipient uuid;
begin
  if v_actor is null then
    raise exception using errcode = '42501', message = 'Authentication required';
  end if;
  if p_planned_for is null or p_planned_for <= now() then
    raise exception using errcode = '22023', message = 'Choose a future date and time';
  end if;

  select * into v_plan from public.plans p
  where p.id = p_plan_id and v_actor in (p.participant_a, p.participant_b)
  for update;
  if not found then
    raise exception using errcode = '42501', message = 'Plan is not available';
  end if;
  if v_plan.status <> 'pending' then
    raise exception using errcode = 'P0001', message = 'This plan is closed';
  end if;
  if v_plan.planned_for is not distinct from p_planned_for then
    return;
  end if;

  update public.plans set planned_for = p_planned_for, updated_at = now() where id = p_plan_id;
  v_recipient := case when v_actor = v_plan.participant_a then v_plan.participant_b else v_plan.participant_a end;
  insert into public.plan_notifications (plan_id, recipient_id, kind)
  values (p_plan_id, v_recipient, 'date_updated');
end;
$$;

create or replace function public.schedule_shared_plan(p_plan_id uuid, p_planned_for timestamptz)
returns void
language sql
security invoker
set search_path = ''
as $$ select private.schedule_shared_plan(p_plan_id, p_planned_for); $$;

create or replace function private.transition_shared_plan(p_plan_id uuid, p_status text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_plan public.plans%rowtype;
  v_actor uuid := auth.uid();
  v_recipient uuid;
begin
  if v_actor is null then
    raise exception using errcode = '42501', message = 'Authentication required';
  end if;
  if p_status not in ('visited', 'cancelled') then
    raise exception using errcode = '22023', message = 'Invalid plan status';
  end if;

  select * into v_plan from public.plans p
  where p.id = p_plan_id and v_actor in (p.participant_a, p.participant_b)
  for update;
  if not found then
    raise exception using errcode = '42501', message = 'Plan is not available';
  end if;
  if v_plan.status <> 'pending' then
    raise exception using errcode = 'P0001', message = 'This plan is already closed';
  end if;

  update public.plans set status = p_status, updated_at = now() where id = p_plan_id;
  if p_status = 'cancelled' then
    v_recipient := case when v_actor = v_plan.participant_a then v_plan.participant_b else v_plan.participant_a end;
    insert into public.plan_notifications (plan_id, recipient_id, kind)
    values (p_plan_id, v_recipient, 'cancelled');
  end if;
end;
$$;

create or replace function public.transition_shared_plan(p_plan_id uuid, p_status text)
returns void
language sql
security invoker
set search_path = ''
as $$ select private.transition_shared_plan(p_plan_id, p_status); $$;

create or replace function private.send_plan_message(p_plan_id uuid, p_body text, p_client_nonce uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_plan public.plans%rowtype;
  v_actor uuid := auth.uid();
  v_recipient uuid;
  v_message_id uuid;
  v_body text := btrim(coalesce(p_body, ''));
begin
  if v_actor is null then
    raise exception using errcode = '42501', message = 'Authentication required';
  end if;
  if p_client_nonce is null or char_length(v_body) not between 1 and 500 then
    raise exception using errcode = '22023', message = 'Message must contain 1 to 500 characters';
  end if;

  select * into v_plan from public.plans p
  where p.id = p_plan_id and v_actor in (p.participant_a, p.participant_b)
  for update;
  if not found then
    raise exception using errcode = '42501', message = 'Plan is not available';
  end if;
  if v_plan.status <> 'pending' then
    raise exception using errcode = 'P0001', message = 'Chat is closed for this plan';
  end if;

  insert into public.plan_messages (plan_id, sender_id, client_nonce, body)
  values (p_plan_id, v_actor, p_client_nonce, v_body)
  on conflict (plan_id, sender_id, client_nonce) do nothing
  returning id into v_message_id;

  if v_message_id is null then
    select m.id into v_message_id
    from public.plan_messages m
    where m.plan_id = p_plan_id and m.sender_id = v_actor and m.client_nonce = p_client_nonce;
  else
    v_recipient := case when v_actor = v_plan.participant_a then v_plan.participant_b else v_plan.participant_a end;
    insert into public.plan_notifications (plan_id, recipient_id, kind)
    values (p_plan_id, v_recipient, 'new_message');
  end if;

  return v_message_id;
end;
$$;

create or replace function public.send_plan_message(p_plan_id uuid, p_body text, p_client_nonce uuid)
returns uuid
language sql
security invoker
set search_path = ''
as $$ select private.send_plan_message(p_plan_id, p_body, p_client_nonce); $$;

create or replace function private.mark_plan_notifications_read(p_plan_id uuid default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception using errcode = '42501', message = 'Authentication required';
  end if;
  update public.plan_notifications
  set is_read = true
  where recipient_id = auth.uid()
    and not is_read
    and (p_plan_id is null or plan_id = p_plan_id);
end;
$$;

create or replace function public.mark_plan_notifications_read(p_plan_id uuid default null)
returns void
language sql
security invoker
set search_path = ''
as $$ select private.mark_plan_notifications_read(p_plan_id); $$;

revoke all on function private.is_plan_participant(uuid),
  private.create_shared_plan(uuid), private.schedule_shared_plan(uuid, timestamptz),
  private.transition_shared_plan(uuid, text), private.send_plan_message(uuid, text, uuid),
  private.mark_plan_notifications_read(uuid)
  from public, anon, authenticated;
grant usage on schema private to authenticated;
grant execute on function private.is_plan_participant(uuid),
  private.create_shared_plan(uuid), private.schedule_shared_plan(uuid, timestamptz),
  private.transition_shared_plan(uuid, text), private.send_plan_message(uuid, text, uuid),
  private.mark_plan_notifications_read(uuid)
  to authenticated;

revoke all on function public.create_shared_plan(uuid),
  public.schedule_shared_plan(uuid, timestamptz), public.transition_shared_plan(uuid, text),
  public.send_plan_message(uuid, text, uuid), public.mark_plan_notifications_read(uuid)
  from public, anon, authenticated;
grant execute on function public.create_shared_plan(uuid),
  public.schedule_shared_plan(uuid, timestamptz), public.transition_shared_plan(uuid, text),
  public.send_plan_message(uuid, text, uuid), public.mark_plan_notifications_read(uuid)
  to authenticated;

do $$
declare
  v_table text;
begin
  if exists (
    select 1 from pg_catalog.pg_publication
    where pubname = 'supabase_realtime' and not puballtables
  ) then
    foreach v_table in array array['plans', 'plan_messages', 'plan_notifications'] loop
      if not exists (
        select 1 from pg_catalog.pg_publication_tables
        where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = v_table
      ) then
        execute format('alter publication supabase_realtime add table public.%I', v_table);
      end if;
    end loop;
  end if;
end;
$$;
