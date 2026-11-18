import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../state/auth';
import { manageSessionRefresh } from '../services/supabase';
import { DemoProvider } from '../state/demo';

function AppNavigator() {
  const { ready, session } = useAuth();

  useEffect(() => manageSessionRefresh(), []);

  return <Stack screenOptions={{ headerShown: false }}>
    <Stack.Protected guard={!ready || !!session}>
      <Stack.Screen name="pilot" />
    </Stack.Protected>
    <Stack.Screen name="pilot-login" />
  </Stack>;
}

export default function RootLayout() {
  return <AuthProvider><DemoProvider><AppNavigator /></DemoProvider></AuthProvider>;
}
