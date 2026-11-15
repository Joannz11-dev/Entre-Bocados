import React from 'react';
import { router } from 'expo-router';
import { Switch, Text, TextInput, View } from 'react-native';
import { Button, Chips, Screen, styles } from '../components/demo-ui';
import { useDemo } from '../state/demo';
import { LOCALITIES } from '../constants/localities';

export default function Preferences() {
  const { data, update, restaurants } = useDemo();
  const cuisines = ['Todas', ...Array.from(new Set(restaurants.map(p => p.cuisine))).sort()];
  return <Screen navigation={false}>
    <Text style={styles.title}>Tus preferencias</Text>
    <Text style={styles.body}>Se guardan solo en este dispositivo.</Text>
    <Text style={styles.label}>Localidad en Bogotá</Text>
    <Text style={styles.note}>El catálogo todavía se está ampliando; algunas localidades pueden estar vacías.</Text>
    <Chips items={LOCALITIES} value={data.zone} onChange={zone => update({ zone })} />
    <Text style={styles.label}>Tipo de cocina</Text><Chips items={cuisines} value={data.cuisine} onChange={cuisine => update({ cuisine })} />
    <Text style={styles.label}>Presupuesto máximo por plato (COP)</Text>
    <TextInput accessibilityLabel="Presupuesto máximo por plato" keyboardType="numeric" placeholder="Sin límite" value={data.budget} onChangeText={budget => update({ budget: budget.replace(/\D/g, '') })} style={styles.input} />
    <Text style={styles.note}>Con un presupuesto activo se excluyen restaurantes cuyo precio no está confirmado.</Text>
    <Text style={styles.label}>Disponibilidad</Text><TextInput accessibilityLabel="Disponibilidad" placeholder="Ej. viernes después de las 6 p. m." value={data.availability} onChangeText={availability => update({ availability })} style={styles.input} />
    <View style={styles.row}><Text style={styles.label}>Modo social simulado</Text><Switch accessibilityLabel="Modo social simulado" value={data.social} onValueChange={social => update({ social })} /></View>
    <Text style={styles.note}>Esta opción no publica tu perfil ni conecta con otras personas.</Text>
    <Button title="Guardar y explorar" onPress={() => { update({ started: true }); router.replace('/explore'); }} />
    <Button title="Volver" secondary onPress={() => router.back()} />
  </Screen>;
}
