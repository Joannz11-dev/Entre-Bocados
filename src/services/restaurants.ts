import { distanceKmBetween } from '../lib/location';
import type { Coords, Restaurant } from '../types/restaurant';

// The publishable key is public by design; RLS and grants protect the database.
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_KEY;

type Row = Omit<Restaurant, 'geo'> & { latitude?: number | null; longitude?: number | null };

export async function getRestaurants(): Promise<Restaurant[]> {
  if (!url || !key) throw new Error('Falta configurar la URL o la clave publicable de Supabase.');
  const endpoint = `${url.replace(/\/$/, '')}/rest/v1/restaurants?select=id,name,cuisine,city,zone,address,description,price_min,price_max,image_url,menu_url,maps_url,latitude,longitude&order=name.asc`;
  const response = await fetch(endpoint, { headers: { apikey: key } });
  if (!response.ok) throw new Error(`No se pudo consultar el catálogo (${response.status}). Revisa el SQL y la Data API.`);
  const data = (await response.json()) as Row[];
  if (!Array.isArray(data)) throw new Error('La respuesta del catálogo no es válida.');
  return data.map(row => ({
    ...row,
    geo: row.latitude != null && row.longitude != null ? { latitude: row.latitude, longitude: row.longitude } : null,
  }));
}

/** Distancia desde el usuario para cada lugar que tenga coordenadas. */
export function withDistances(places: Restaurant[], center: Coords): Restaurant[] {
  return places.map(place =>
    place.geo ? { ...place, distance_km: distanceKmBetween(center, place.geo) } : place,
  );
}
