import React from 'react';
import { router } from 'expo-router';
import { Alert, Text, TextInput, View } from 'react-native';
import { Button, Chips, Screen, styles } from '../components/demo-ui';
import { useDemo } from '../state/demo';

export default function Profile() {
  const { data, update, reset } = useDemo();
  return <Screen>
    <View style={styles.profileHero}><Text style={styles.avatar}>{data.avatar}</Text><Text style={styles.heroEyebrow}>TU ESPACIO · DEMO</Text><Text style={styles.heroTitle}>{data.alias || 'Hola, comensal'}</Text><Text style={styles.heroBody}>{data.zone}, Bogotá</Text></View>
    <Text style={styles.subtitle}>Un poco de ti</Text><Text style={styles.note}>Perfil simulado guardado solo en este dispositivo.</Text>
    <Text style={styles.label}>Nombre o alias</Text><TextInput accessibilityLabel="Alias" value={data.alias} onChangeText={alias => update({ alias })} placeholder="Tu nombre" style={styles.input} />
    <Text style={styles.label}>Avatar simulado</Text><Chips items={['🙂', '🧑', '👩', '👨']} value={data.avatar} onChange={avatar => update({ avatar })} />
    <Text style={styles.label}>Descripción</Text><TextInput accessibilityLabel="Descripción" value={data.description} onChangeText={description => update({ description })} placeholder="Cuéntanos un poco de ti" multiline style={styles.input} />
    <View style={styles.box}><Text style={styles.subtitle}>Tus preferencias</Text>
      <Text style={styles.body}>📍 {data.zone} · 🍽 {data.cuisine}</Text>
      <Text style={styles.body}>Presupuesto: {data.budget ? `Hasta $${Number(data.budget).toLocaleString('es-CO')}` : 'Sin límite'}</Text>
      <Text style={styles.body}>Disponibilidad: {data.availability || 'Sin definir'}</Text>
      <Text style={styles.note}>Modo social: {data.social ? 'simulado activo' : 'desactivado'}</Text></View>
    <Button title="Editar preferencias" onPress={() => router.push('/preferences')} />
    <Button title="Ver pantallas de acceso (demo)" secondary onPress={() => router.push('/')} />
    <Button title="Reiniciar datos de esta demo" secondary onPress={() => Alert.alert('Reiniciar demo', 'Se borrarán los datos locales de perfil y favoritos.', [{ text: 'Cancelar', style: 'cancel' }, { text: 'Reiniciar', style: 'destructive', onPress: () => { reset(); router.replace('/'); } }])} />
  </Screen>;
}
