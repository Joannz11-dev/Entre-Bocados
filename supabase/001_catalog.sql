-- Ejecutar una sola vez en el SQL Editor de un proyecto nuevo.
-- Los datos son públicos; no guardar aquí información personal.
create table public.restaurants (
  id text primary key,
  name text not null,
  cuisine text not null,
  city text not null default 'Bogotá',
  zone text not null default 'Usaquén',
  address text not null,
  description text,
  price_min integer check (price_min >= 0),
  price_max integer check (price_max >= price_min),
  image_url text,
  menu_url text,
  maps_url text,
  source_url text not null,
  verified_on date,
  published boolean not null default false
);

alter table public.restaurants enable row level security;
revoke all on table public.restaurants from anon, authenticated;
grant select on table public.restaurants to anon, authenticated;
create policy "Public can read published restaurants"
  on public.restaurants for select to anon, authenticated
  using (published = true);

-- Datos obtenidos de sitios oficiales. Precios y fotografías quedan pendientes
-- de verificación y autorización, respectivamente.
insert into public.restaurants
  (id, name, cuisine, address, description, menu_url, maps_url, source_url, verified_on, published)
values
  ('santa-costilla-usaquen', 'Santa Costilla', 'Carnes', 'Calle 120 con carrera 6A, esquina',
   'Restaurante especializado en costillas y carnes.',
   'https://santacostilla.co/qr-menu-santa.costilla-usaquen/',
   'https://waze.com/ul/hd2g6erhc8', 'https://santacostilla.co/reservas/usaquen/', '2026-11-14', true),
  ('julia-usaquen', 'Julia Pizzería', 'Italiana', 'Calle 119B # 6-31',
   'Pizzería en Usaquén.', 'https://juliapizzeria.com/menus/menu.pdf',
   'https://www.google.com/maps/search/?api=1&query=Julia+Pizzeria+Calle+119B+6-31+Bogota',
   'https://juliapizzeria.com/', '2026-11-14', true),
  ('abasto-usaquen', 'Abasto', 'Colombiana', 'Calle 118 # 5-41',
   'Restaurante de cocina colombiana.', 'https://abasto.com.co/wp-content/uploads/2026/06/Abasto-Menu-2026-DIGITAL-1.pdf',
   'https://www.google.com/maps/search/?api=1&query=Abasto+Calle+118+5-41+Bogota',
   'https://abasto.com.co/', '2026-11-14', true);
