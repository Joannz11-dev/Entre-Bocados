import React from 'react';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { Button, Screen, styles } from '../components/demo-ui';
import { useDemo } from '../state/demo';

export default function Welcome() {
  const { data, ready } = useDemo();
  if (!ready) return <Screen navigation={false}><Text style={styles.body}>Preparando tu mesa...</Text></Screen>;
  return <Screen navigation={false}>
    <View style={styles.hero}>
      <Text style={styles.heroIcon}>✳</Text>
      <Text style={styles.heroEyebrow}>DESCUBRE · COMPARTE · DISFRUTA</Text>
      <Text style={styles.heroTitle}>La próxima buena historia empieza en la mesa.</Text>
      <Text style={styles.heroBody}>Encuentra lugares para comer en Bogotá, a tu ritmo y a tu gusto.</Text>
    </View>
    <View style={styles.intro}><Text style={styles.subtitle}>¿Dónde comemos hoy?</Text>
      <Text style={styles.body}>Descubre restaurantes, desliza y guarda los que te encanten.</Text></View>
    {data.started && <Button title="Continuar con mi demo" onPress={() => router.replace('/explore')} />}
    <Button title="Crear perfil de demostración" onPress={() => router.push('/register')} />
    <Button title="Iniciar sesión (demo)" secondary onPress={() => router.push('/login')} />
    <Text style={styles.note}>Acceso y registro simulados. Sin contraseñas ni cuentas reales.</Text>
  </Screen>;
}
