import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_KEY;

if (!url || !key) {
  throw new Error('Falta la configuración de Supabase: define EXPO_PUBLIC_SUPABASE_URL y la clave publicable en .env.local.');
}

/**
 * Cliente de Supabase con sesión persistente y cifrada en el dispositivo.
 * El flujo de correo es "implicit": el enlace del correo abre la app con los
 * tokens en el fragmento de la URL y la pantalla /auth/callback los usa.
 */
export const supabase = createClient(url, key, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
    flowType: 'implicit',
  },
});

/**
 * URL de retorno para los correos de confirmación y recuperación.
 * En Expo Go con túnel es exp://<túnel>/--/auth/callback (permitida en Supabase).
 * En web es http://localhost:8081/auth/callback.
 */
export function authRedirectUri(): string {
  return Linking.createURL('/auth/callback');
}

/** Extrae access_token/refresh_token/type de un deep link del correo de Supabase. */
export function parseAuthUrl(link: string | null): { accessToken: string; refreshToken: string; type: string } | null {
  if (!link) return null;
  const hashIndex = link.indexOf('#');
  if (hashIndex === -1) return null;
  const params = new URLSearchParams(link.slice(hashIndex + 1));
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  if (!accessToken || !refreshToken) return null;
  return { accessToken, refreshToken, type: params.get('type') || 'signup' };
}