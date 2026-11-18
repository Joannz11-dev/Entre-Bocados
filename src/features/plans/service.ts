import type { Restaurant } from '../../types/restaurant';
import { supabase } from '../../services/supabase';

export type PlanStatus = 'pending' | 'visited' | 'cancelled';
export type PlanRow = {
  id: string;
  match_id: string;
  restaurant_id: string;
  participant_a: string;
  participant_b: string;
  created_by: string;
  status: PlanStatus;
  planned_for: string | null;
  created_at: string;
  updated_at: string;
};
export type PlanMessage = { id: string; plan_id: string; sender_id: string; client_nonce: string; body: string; created_at: string };
export type PlanNotification = { id: string; plan_id: string; kind: 'new_plan' | 'date_updated' | 'cancelled' | 'new_message'; is_read: boolean; created_at: string; restaurant_name: string };
export type SharedPlan = PlanRow & { restaurant: Restaurant | null };
export type MatchOption = { id: string; created_at: string; restaurant: Restaurant | null; hasPlan: boolean };

function client() {
  if (!supabase) throw new Error('Falta configurar la conexión con Supabase en .env.local.');
  return supabase;
}

async function restaurantsById(ids: string[]) {
  if (!ids.length) return new Map<string, Restaurant>();
  const { data, error } = await client().from('restaurants').select('*').in('id', ids);
  if (error) throw error;
  return new Map(((data ?? []) as Restaurant[]).map(restaurant => [restaurant.id, restaurant]));
}

export async function getPilotData(userId: string) {
  const db = client();
  const [matchResult, planResult, unreadResult] = await Promise.all([
    db.from('matches').select('id, restaurant_id, created_at').order('created_at', { ascending: false }),
    db.from('plans').select('*').order('updated_at', { ascending: false }),
    db.from('plan_notifications').select('id', { count: 'exact', head: true }).eq('recipient_id', userId).eq('is_read', false),
  ]);
  if (matchResult.error) throw matchResult.error;
  if (planResult.error) throw planResult.error;
  if (unreadResult.error) throw unreadResult.error;

  const matches = (matchResult.data ?? []) as { id: string; restaurant_id: string; created_at: string }[];
  const plans = (planResult.data ?? []) as PlanRow[];
  const restaurants = await restaurantsById([...new Set([...matches.map(row => row.restaurant_id), ...plans.map(row => row.restaurant_id)])]);

  return {
    matches: matches.map(match => ({ id: match.id, created_at: match.created_at, restaurant: restaurants.get(match.restaurant_id) ?? null, hasPlan: plans.some(plan => plan.match_id === match.id) })) as MatchOption[],
    plans: plans.map(plan => ({ ...plan, restaurant: restaurants.get(plan.restaurant_id) ?? null })) as SharedPlan[],
    unreadCount: unreadResult.count ?? 0,
  };
}

export async function getPlan(id: string): Promise<SharedPlan | null> {
  const { data, error } = await client().from('plans').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const plan = data as PlanRow;
  const restaurants = await restaurantsById([plan.restaurant_id]);
  return { ...plan, restaurant: restaurants.get(plan.restaurant_id) ?? null };
}

export async function getPlanMessages(planId: string, before?: PlanMessage) {
  let query = client().from('plan_messages').select('*').eq('plan_id', planId).order('created_at', { ascending: false }).limit(50);
  if (before) query = query.lt('created_at', before.created_at);
  const { data, error } = await query;
  if (error) throw error;
  return ((data ?? []) as PlanMessage[]).reverse();
}

export async function getPlanNotifications(): Promise<PlanNotification[]> {
  const { data, error } = await client().from('plan_notifications').select('*').order('created_at', { ascending: false }).limit(100);
  if (error) throw error;
  const notices = (data ?? []) as Omit<PlanNotification, 'restaurant_name'>[];
  const planIds = [...new Set(notices.map(notice => notice.plan_id))];
  const { data: plans, error: planError } = planIds.length
    ? await client().from('plans').select('id, restaurant_id').in('id', planIds)
    : { data: [], error: null };
  if (planError) throw planError;
  const planRows = (plans ?? []) as { id: string; restaurant_id: string }[];
  const restaurants = await restaurantsById([...new Set(planRows.map(plan => plan.restaurant_id))]);
  const restaurantForPlan = new Map(planRows.map(plan => [plan.id, restaurants.get(plan.restaurant_id)?.name ?? 'Restaurante']));
  return notices.map(notice => ({ ...notice, restaurant_name: restaurantForPlan.get(notice.plan_id) ?? 'Restaurante' }));
}

export async function createPlan(matchId: string) {
  const { data, error } = await client().rpc('create_shared_plan', { p_match_id: matchId });
  if (error) throw error;
  return data as string;
}

export async function schedulePlan(planId: string, plannedFor: string) {
  const { error } = await client().rpc('schedule_shared_plan', { p_plan_id: planId, p_planned_for: plannedFor });
  if (error) throw error;
}

export async function transitionPlan(planId: string, status: Exclude<PlanStatus, 'pending'>) {
  const { error } = await client().rpc('transition_shared_plan', { p_plan_id: planId, p_status: status });
  if (error) throw error;
}

export async function sendPlanMessage(planId: string, body: string, clientNonce: string) {
  const { error } = await client().rpc('send_plan_message', { p_plan_id: planId, p_body: body, p_client_nonce: clientNonce });
  if (error) throw error;
}

export async function markPlanNotificationsRead(planId?: string) {
  const { error } = await client().rpc('mark_plan_notifications_read', { p_plan_id: planId ?? null });
  if (error) throw error;
}
