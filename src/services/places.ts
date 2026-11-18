import type { Coords, Restaurant } from '../types/restaurant';
import { distanceKmBetween } from '../lib/location';

/**
 * Catálogo en vivo desde Google Maps (Places API - New).
 * La clave va en .env.local como EXPO_PUBLIC_GOOGLE_MAPS_KEY.
 * Sin clave, la app usa el catálogo de Supabase como respaldo.
 */
const key = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY;
const BASE = 'https://places.googleapis.com/v1/places';

const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.rating',
  'places.userRatingCount',
  'places.priceLevel',
  'places.primaryType',
  'places.types',
  'places.websiteUri',
  'places.googleMapsUri',
  'places.location',
  'places.photos',
].join(',');

export function hasGoogleMapsKey(): boolean {
  return Boolean(key);
}

const CUISINE_BY_TYPE: Record<string, string> = {
  italian_restaurant: 'Italiana',
  pizza_restaurant: 'Pizza',
  hamburger_restaurant: 'Hamburguesas',
  mexican_restaurant: 'Mexicana',
  japanese_restaurant: 'Japonesa',
  sushi_restaurant: 'Japonesa',
  chinese_restaurant: 'China',
  indian_restaurant: 'India',
  korean_restaurant: 'Coreana',
  thai_restaurant: 'Tailandesa',
  french_restaurant: 'Francesa',
  spanish_restaurant: 'Española',
  brazilian_restaurant: 'Brasileña',
  peruvian_restaurant: 'Peruana',
  colombian_restaurant: 'Colombiana',
  american_restaurant: 'Americana',
  steak_house: 'Carnes',
  barbecue_restaurant: 'Asados',
  seafood_restaurant: 'Mariscos',
  vegetarian_restaurant: 'Vegetariana',
  vegan_restaurant: 'Vegana',
  cafe: 'Café',
  coffee_shop: 'Café',
  bakery: 'Panadería',
  bar: 'Bar',
  pub: 'Bar',
  meal_takeaway: 'Comida rápida',
  meal_delivery: 'Comida rápida',
  fast_food_restaurant: 'Comida rápida',
  ramen_restaurant: 'Ramen',
  noodle_shop: 'Fideos',
  greek_restaurant: 'Griega',
  turkish_restaurant: 'Turca',
  middle_eastern_restaurant: 'Oriente Medio',
};

const PRICE_RANGES: Record<string, [number, number]> = {
  PRICE_LEVEL_INEXPENSIVE: [8000, 20000],
  PRICE_LEVEL_MODERATE: [20000, 45000],
  PRICE_LEVEL_EXPENSIVE: [45000, 90000],
  PRICE_LEVEL_VERY_EXPENSIVE: [90000, 180000],
};

function cuisineOf(primaryType: string | undefined, types: string[] | undefined): string {
  for (const t of [primaryType, ...(types ?? [])]) {
    const label = t ? CUISINE_BY_TYPE[t] : undefined;
    if (label) return label;
  }
  return 'Restaurante';
}

/** URL de la foto del lugar (endpoint de media de Places). */
export function photoUrl(photoName: string | undefined, heightPx = 720): string | null {
  if (!photoName || !key) return null;
  return `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=${heightPx}&key=${key}`;
}

function mapPlace(place: any, center: Coords): Restaurant {
  const coords = place.location
    ? { latitude: place.location.latitude, longitude: place.location.longitude }
    : null;
  const price = PRICE_RANGES[place.priceLevel as string] ?? null;
  return {
    id: `g-${place.id}`,
    name: place.displayName?.text ?? 'Lugar sin nombre',
    cuisine: cuisineOf(place.primaryType, place.types),
    city: 'Bogotá',
    zone: 'Cerca de ti',
    address: place.formattedAddress ?? 'Dirección en Google Maps',
    description:
      place.rating != null
        ? `Calificación de ${place.rating} de 5 según ${place.userRatingCount ?? 0} reseñas.`
        : 'Lugar registrado con datos actualizados.',
    price_min: price ? price[0] : null,
    price_max: price ? price[1] : null,
    image_url: photoUrl(place.photos?.[0]?.name),
    menu_url: place.websiteUri ?? null,
    maps_url:
      place.googleMapsUri ??
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.displayName?.text ?? ''} ${place.formattedAddress ?? ''}`)}`,
    rating: place.rating ?? null,
    rating_count: place.userRatingCount ?? null,
    distance_km: coords ? distanceKmBetween(center, coords) : null,
    geo: coords,
  };
}

/** Solo lugares para comer: la API a veces devuelve supermercados u hoteles. */
const FOOD_PRIMARY = /restaurant|cafe|bakery|^bar$|meal|food|coffee|dessert|ice_cream|bistro|pizzeria|pub|steak|sushi|noodle|taco|pizza|burger|sandwich|deli|tea|wine/i;

function onlyFoodPlaces(places: any[]): any[] {
  const food = places.filter(place => FOOD_PRIMARY.test(place.primaryType ?? ''));
  return food.length ? food : places;
}

async function placesRequest(endpoint: string, body: Record<string, unknown>): Promise<any[]> {
  if (!key) throw new Error('Falta la clave de Google Maps (EXPO_PUBLIC_GOOGLE_MAPS_KEY).');
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': key,
      'X-Goog-FieldMask': FIELD_MASK,
    },
    body: JSON.stringify(body),
  });
  const data = (await response.json()) as { places?: any[]; error?: { message?: string } };
  if (!response.ok) {
    throw new Error(`Google Maps no respondió (${response.status}): ${data.error?.message ?? 'inténtalo de nuevo'}`);
  }
  return Array.isArray(data.places) ? data.places : [];
}

/**
 * Restaurantes reales alrededor del usuario (como Tinder, con comida).
 * `radiusMeters` máx. 50000 según la API.
 */
export async function nearbyRestaurants(center: Coords, radiusMeters = 5000): Promise<Restaurant[]> {
  const places = await placesRequest(`${BASE}:searchNearby`, {
    includedTypes: [
      'restaurant',
      'cafe',
      'bakery',
      'bar',
      'meal_takeaway',
      'pizza_restaurant',
      'hamburger_restaurant',
    ],
    maxResultCount: 20,
    rankPreference: 'DISTANCE',
    locationRestriction: {
      circle: { center: { latitude: center.latitude, longitude: center.longitude }, radius: Math.min(radiusMeters, 50000) },
    },
  });
  return onlyFoodPlaces(places)
    .map(place => mapPlace(place, center))
    .sort((a, b) => (a.distance_km ?? 99) - (b.distance_km ?? 99));
}

/** Búsqueda por texto (para el filtro de gastronomía) con sesgo al radio del usuario. */
export async function searchRestaurants(query: string, center: Coords, radiusMeters = 5000): Promise<Restaurant[]> {
  const places = await placesRequest(`${BASE}:searchText`, {
    textQuery: `${query} restaurante`,
    pageSize: 20,
    locationBias: {
      circle: { center: { latitude: center.latitude, longitude: center.longitude }, radius: Math.min(radiusMeters, 50000) },
    },
  });
  return onlyFoodPlaces(places)
    .map(place => mapPlace(place, center))
    .sort((a, b) => (a.distance_km ?? 99) - (b.distance_km ?? 99));
}
