-- Coordenadas de los restaurantes para calcular distancias con el GPS del
-- teléfono. Ejecutar después de 001_catalog.sql y 002_catalog_chapinero.sql
-- (este script ya incluye los inserts de 002 con "on conflict do nothing",
-- así que puede correr una sola vez sobre un proyecto nuevo).
--
-- Nota de honestidad: Santa Costilla y Mini-Mal provienen de OpenStreetMap;
-- las demás son aproximaciones por malla vial de Bogotá (±300 m). Cuando la
-- app use Google Maps, las distancias salen de la ficha exacta del lugar.
alter table public.restaurants add column if not exists latitude double precision;
alter table public.restaurants add column if not exists longitude double precision;

insert into public.restaurants
  (id, name, cuisine, city, zone, address, description, menu_url, maps_url, source_url, verified_on, published)
values
  ('flora-chapinero', 'Flora', 'Por confirmar', 'Bogotá', 'Chapinero',
   'Carrera 5 # 58-45', null, null,
   'https://maps.app.goo.gl/pVP22tPJbyu6zKnSA', 'https://florachapinero.com/', '2026-11-15', true),
  ('rio-chapinero', 'Río Restaurante', 'Por confirmar', 'Bogotá', 'Chapinero',
   'Calle 61 # 5-20', null, null,
   'https://maps.app.goo.gl/VFpyUjRkA8Y1NKEV9', 'https://restauranterio.co/', '2026-11-15', true),
  ('santa-maria-chapinero', 'Santa María Chapinero', 'Por confirmar', 'Bogotá', 'Chapinero',
   'Calle 59A Bis # 5-10', null, 'https://www.restaurantesantamaria.com.co/menu',
   'https://www.google.com/maps/search/?api=1&query=Santa+Maria+Calle+59A+Bis+5-10+Bogota',
   'https://www.restaurantesantamaria.com.co/menu', '2026-11-15', true),
  ('mini-mal-chapinero', 'Mini-Mal', 'Colombiana', 'Bogotá', 'Chapinero',
   'Transversal 4 Bis # 56A-52', null, null,
   'https://www.google.com/maps/search/?api=1&query=Mini-Mal+Transversal+4bis+56A-52+Bogota',
   'https://mini-mal.org/', '2026-11-15', true)
on conflict (id) do nothing;

update public.restaurants set latitude =  4.6968827, longitude = -74.0303392 where id = 'santa-costilla-usaquen';
update public.restaurants set latitude =  4.6960000, longitude = -74.0311000 where id = 'julia-usaquen';
update public.restaurants set latitude =  4.6953000, longitude = -74.0322000 where id = 'abasto-usaquen';
update public.restaurants set latitude =  4.6447000, longitude = -74.0595000 where id = 'flora-chapinero';
update public.restaurants set latitude =  4.6477000, longitude = -74.0595000 where id = 'rio-chapinero';
update public.restaurants set latitude =  4.6460000, longitude = -74.0598000 where id = 'santa-maria-chapinero';
update public.restaurants set latitude =  4.6424862, longitude = -74.0603931 where id = 'mini-mal-chapinero';
