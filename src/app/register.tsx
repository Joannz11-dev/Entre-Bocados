import React, { useState } from 'react';
import { router } from 'expo-router';
import { Text, TextInput, View } from 'react-native';
import { Button, Screen, styles } from '../components/demo-ui';
import { useDemo } from '../state/demo';

export default function Register() {
  const { data, update } = useDemo();
  const [alias, setAlias] = useState(data.alias);
  return <Screen navigation={false}>
    <Text style={styles.title}>Crea tu perfil de demo</Text>
    <Text style={styles.body}>Elige cómo quieres que te llamemos y después configura tus preferencias.</Text>
    <View style={styles.box}>
      <Text style={styles.label}>Nombre o alias</Text>
      <TextInput accessibilityLabel="Nombre o alias" autoCapitalize="words" maxLength={60} placeholder="Tu nombre (opcional)" value={alias} onChangeText={setAlias} style={styles.input} />
    </View>
    <Text style={styles.note}>Esto no crea una cuenta. Tu alias y preferencias solo se guardan en este dispositivo. No introduzcas contraseñas ni datos sensibles.</Text>
    {data.started && <Text style={styles.note}>Continuar mantiene los favoritos y demás datos de esta demo.</Text>}
    <Button title="Continuar a preferencias" onPress={() => { update({ alias: alias.trim() }); router.push('/preferences'); }} />
    <Button title="Volver" secondary onPress={() => router.back()} />
  </Screen>;
}
