import { Stack } from 'expo-router';
import { DemoProvider } from '../state/demo';
export default function RootLayout() { return <DemoProvider><Stack screenOptions={{ headerShown: false }} /></DemoProvider>; }
