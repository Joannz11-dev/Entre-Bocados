import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts, Baloo2_600SemiBold, Baloo2_700Bold, Baloo2_800ExtraBold } from '@expo-google-fonts/baloo-2';
import { Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import * as SplashScreen from 'expo-splash-screen';
import { DemoProvider } from '../state/demo';
import { AuthProvider } from '../state/auth';
import { AuthProvider as PilotAuthProvider, useAuth as usePilotAuth } from '../state/pilot-auth';
import { manageSessionRefresh } from '../services/supabase';
import { Colors } from '../constants/theme';

SplashScreen.preventAutoHideAsync().catch(() => {
  /* el splash ya se ocultó */
});

/** Registra las rutas del piloto del equipo, protegidas por su propia sesión. */
function PilotRoutes() {
  useEffect(() => manageSessionRefresh(), []);
  const { ready, session } = usePilotAuth();
  return (
    <>
      <Stack.Protected guard={!ready || !!session}>
        <Stack.Screen name="pilot" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Screen name="pilot-login" options={{ presentation: 'modal' }} />
      <Stack.Screen name="local-plans" options={{ headerShown: false }} />
    </>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Baloo2_600SemiBold,
    Baloo2_700Bold,
    Baloo2_800ExtraBold,
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync().catch(() => {
      /* sin splash activo */
    });
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.cream }}>
      <DemoProvider>
        <AuthProvider>
          <PilotAuthProvider>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.cream }, animation: 'slide_from_right' }}>
              <Stack.Screen name="match" options={{ animation: 'fade_from_bottom', gestureEnabled: false }} />
              <Stack.Screen name="chat" options={{ animation: 'slide_from_bottom' }} />
              <Stack.Screen name="ruta" options={{ animation: 'slide_from_bottom' }} />
              <Stack.Screen name="restablecer" options={{ gestureEnabled: false }} />
              <PilotRoutes />
            </Stack>
          </PilotAuthProvider>
        </AuthProvider>
      </DemoProvider>
    </GestureHandlerRootView>
  );
}
