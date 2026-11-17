import type { Restaurant } from '../types/restaurant';

// The publishable key is public by design; RLS and grants protect the database.
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_KEY;

export async function getRestaurants(): Promise<Restaurant[]> {
  if (!url || !key) throw new Error('Falta configurar la URL o la clave publicable de Supabase.');
  const endpoint = `${url.replace(/\/$/, '')}/rest/v1/restaurants?select=id,name,cuisine,city,zone,address,description,price_min,price_max,image_url,menu_url,maps_url&order=name.asc`;
  const response = await fetch(endpoint, { headers: { apikey: key } });
  if (!response.ok) throw new Error(`No se pudo consultar el catálogo (${response.status}). Revisa el SQL y la Data API.`);
  const data: unknown = await response.json();
  if (!Array.isArray(data)) throw new Error('La respuesta del catálogo no es válida.');
  return data as Restaurant[];
}
