-- Restaurantes adicionales consultados en las páginas oficiales.
-- No sobrescribe registros existentes. Ejecutar después de 001_catalog.sql.
-- Las fotos y los precios quedan pendientes de permiso/verificación.
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
