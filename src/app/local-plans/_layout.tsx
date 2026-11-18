import { Stack } from 'expo-router';
import { LocalPlansProvider } from '../../features/plans/workspace';

export default function LocalPlansLayout() {
  return <LocalPlansProvider><Stack screenOptions={{ headerShown: false }} /></LocalPlansProvider>;
}
