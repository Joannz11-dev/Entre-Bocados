import * as Location from 'expo-location';
import type { Coords } from '../types/restaurant';

/** Centro de Usaquén: fallback cuando no hay permiso ni posición (demo web). */
export const FALLBACK_CENTER: Coords = { latitude: 4.70623, longitude: -74.03453 };

export type LocationResult = {
  coords: Coords;
  granted: boolean;
  /** 'gps' = posición real del teléfono; 'fallback' = centro de Usaquén. */
  source: 'gps' | 'last' | 'fallback';
};

/**
 * Pide permiso de ubicación al usuario (una vez) y devuelve la posición
 * actual. Sin permiso sigue con el centro de Usaquén para que la app
 * nunca se quede sin catálogo.
 */
export async function requestCurrentLocation(): Promise<LocationResult> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return { coords: FALLBACK_CENTER, granted: false, source: 'fallback' };
    }
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      coords: { latitude: position.coords.latitude, longitude: position.coords.longitude },
      granted: true,
      source: 'gps',
    };
  } catch {
    return { coords: FALLBACK_CENTER, granted: false, source: 'fallback' };
  }
}

/** Última posición conocida (sin prompt) para distancias de perfiles. */
export async function lastKnownLocation(): Promise<LocationResult> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== 'granted') return { coords: FALLBACK_CENTER, granted: false, source: 'fallback' };
    const last = await Location.getLastKnownPositionAsync();
    if (!last) return { coords: FALLBACK_CENTER, granted: true, source: 'fallback' };
    return {
      coords: { latitude: last.coords.latitude, longitude: last.coords.longitude },
      granted: true,
      source: 'last',
    };
  } catch {
    return { coords: FALLBACK_CENTER, granted: false, source: 'fallback' };
  }
}

/** Distancia en kilómetros entre dos puntos (haversine). */
export function distanceKmBetween(a: Coords, b: Coords): number {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLng = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return Math.round(2 * R * Math.asin(Math.sqrt(h)) * 10) / 10;
}
