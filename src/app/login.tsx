import React from 'react';
import { router } from 'expo-router';
import { Alert, Text, View } from 'react-native';
import { Button, Screen, styles } from '../components/demo-ui';
import { useDemo } from '../state/demo';

export default function Login() {
  const { data } = useDemo();
  return <Screen navigation={false}>
    <Text style={styles.title}>Iniciar sesión</Text>
    <Text style={styles.body}>Acceso de demostración</Text>
    <View style={styles.box}>
      <Text style={styles.subtitle}>{data.alias || 'Invitado'}</Text>
      <Text style={styles.body}>{data.started ? 'Perfil guardado en este dispositivo.' : 'Entrarás como invitado en este dispositivo.'}</Text>
    </View>
    <Text style={styles.note}>No se verifica ninguna cuenta. No se solicitan ni almacenan correos o contraseñas.</Text>
    <Button title="Entrar a la demo" onPress={() => router.replace(data.started ? '/explore' : '/preferences')} />
    <Button title="Recuperar contraseña (simulación)" secondary onPress={() => Alert.alert('Recuperación simulada', 'No existe una cuenta ni se enviará ningún correo.')} />
    <Button title="Volver" secondary onPress={() => router.back()} />
  </Screen>;
}
