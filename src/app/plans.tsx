import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Button, Screen, styles } from '../components/demo-ui';
import { useAuth } from '../state/auth';

const oldPlaces: Record<number, string> = {
  1: 'Casa Tomillo', 2: 'La Mesa Verde', 3: 'Patio Criollo', 4: 'Miga y Sal',
  5: 'Nori', 6: 'La Esquina', 7: 'Oliva', 8: 'Brasa Sur',
};
const demoKey = 'entre-bocados-simulated-plans-v2';

export default function Plans() {
  const { session } = useAuth();
  const [saved, setSaved] = useState<string[]>([]);
  const [legacy, setLegacy] = useState<number[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    Promise.all([AsyncStorage.getItem(demoKey), AsyncStorage.getItem('entre-bocados-demo-v1')])
      .then(([current, previous]) => {
        if (current) setSaved(JSON.parse(current));
        if (previous) setLegacy(JSON.parse(previous).plans || []);
      }).catch(() => {}).finally(() => setReady(true));
  }, []);
  return <Screen><Text style={styles.title}>Planes</Text>
    <Text style={styles.body}>Organiza una salida y conversa con tu coincidencia.</Text>
    <View style={styles.hero}><Text style={styles.heroEyebrow}>PRUEBA SIN CONEXIÓN</Text><Text style={styles.heroTitle}>Una mesa para dos</Text><Text style={styles.heroBody}>Crea un plan y prueba el chat como Alex o Sofía. Todo queda en este dispositivo.</Text><Button title="Probar demo local" onPress={() => router.push('/local-plans/shared-plans')} /></View>
    <View style={styles.box}><Text style={styles.subtitle}>Piloto conectado</Text><Text style={styles.note}>Los planes reales se sincronizan con Supabase y usan cuentas de prueba; no se mezclan con los datos locales de esta demo.</Text><Button title={session ? 'Abrir mis planes compartidos' : 'Iniciar sesión en el piloto'} onPress={() => router.push(session ? '/pilot/shared-plans' : '/pilot-login')} /></View>
    {ready && (legacy.length > 0 || saved.length > 0) && <Text style={styles.subtitle}>Planes de la demo anterior</Text>}
    {!ready ? <Text style={styles.body}>Cargando planes...</Text> : [...new Set([...legacy.map(id => oldPlaces[id]).filter(Boolean), ...saved])].map(name =>
      <View key={name} style={styles.box}><Text style={styles.subtitle}>{name}</Text><Text style={styles.body}>Con Sofía · Fecha por acordar</Text><Text style={styles.note}>Restaurante ficticio · guardado solo en este dispositivo.</Text></View>)}
  </Screen>;
}
