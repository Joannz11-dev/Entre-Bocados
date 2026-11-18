import { router } from 'expo-router';

/**
 * Retroceso seguro: si no hay pantalla a la que volver (pantalla raíz,
 * deep link de correo o replace con pila vacía), lleva a un destino de
 * respaldo en lugar de lanzar "GO_BACK not handled".
 */
export function goBackOrHome(fallback: '/' | '/explore' = '/') {
  if (router.canGoBack?.()) router.back();
  else router.replace(fallback);
}
