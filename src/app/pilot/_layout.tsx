import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, Text } from 'react-native';
import { Screen, styles } from '../../components/demo-ui';
import { useAuth } from '../../state/pilot-auth';

export default function PilotLayout() {
  const { ready, session } = useAuth();
  if (!ready) return <Screen navigation={false}><ActivityIndicator color="#9A3412" /><Text style={styles.body}>Preparando tu sesión…</Text></Screen>;
  if (!session) return <Redirect href="/pilot-login" />;
  return <Stack screenOptions={{ headerShown: false }}>
    <Stack.Screen name="shared-plans" />
    <Stack.Screen name="notifications" />
    <Stack.Screen name="plan/[id]" />
  </Stack>;
}
