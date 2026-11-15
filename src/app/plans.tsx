import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Button, Screen, styles } from '../components/demo-ui';

const oldPlaces: Record<number, string> = {
  1: 'Casa Tomillo', 2: 'La Mesa Verde', 3: 'Patio Criollo', 4: 'Miga y Sal',
  5: 'Nori', 6: 'La Esquina', 7: 'Oliva', 8: 'Brasa Sur',
};
const demoKey = 'entre-bocados-simulated-plans-v2';

export default function Plans() {
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
  const save = (name: string) => {
    const next = saved.includes(name) ? saved : [...saved, name];
    setSaved(next);
    void AsyncStorage.setItem(demoKey, JSON.stringify(next));
  };
  return <Screen><Text style={styles.title}>Planes de demostración</Text>
    <Text style={styles.body}>Sofía y las coincidencias son ficticias. No son reservas ni planes compartidos.</Text>
    <View style={styles.box}><Text style={styles.subtitle}>Simular un match</Text><Text style={styles.body}>A ti y a Sofía les gusta Casa Tomillo, un restaurante ficticio.</Text><Button title="Guardar plan simulado" onPress={() => save('Casa Tomillo')} /></View>
    {!ready ? <Text style={styles.body}>Cargando planes...</Text> : [...new Set([...legacy.map(id => oldPlaces[id]).filter(Boolean), ...saved])].map(name =>
      <View key={name} style={styles.box}><Text style={styles.subtitle}>{name}</Text><Text style={styles.body}>Con Sofía · Fecha por acordar</Text><Text style={styles.note}>Restaurante ficticio · guardado solo en este dispositivo.</Text></View>)}
  </Screen>;
}
