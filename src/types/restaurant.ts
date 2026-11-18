export type Restaurant = {
  id: string;
  name: string;
  cuisine: string;
  city: string;
  zone: string;
  address: string;
  description: string | null;
  price_min: number | null;
  price_max: number | null;
  image_url: string | null;
  menu_url: string | null;
  maps_url: string | null;
  /** Datos enriquecidos cuando el lugar viene de Google Maps. */
  rating?: number | null;
  rating_count?: number | null;
  distance_km?: number | null;
  geo?: { latitude: number; longitude: number } | null;
};

export type Coords = { latitude: number; longitude: number };

export function formatPrice(place: Restaurant): string {
  if (place.price_min == null) return 'Precio por confirmar';
  const money = (value: number) => `$${value.toLocaleString('es-CO')}`;
  return place.price_max == null || place.price_max === place.price_min
    ? `Desde ${money(place.price_min)} por plato`
    : `${money(place.price_min)} – ${money(place.price_max)} por plato`;
}
