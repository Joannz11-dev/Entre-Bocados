import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TextInput, View } from 'react-native';
import { Button, Screen, styles } from '../components/demo-ui';
import { useAuth } from '../state/auth';

export default function PilotLogin() {
  const { ready, session, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session) router.replace('/pilot/shared-plans');
  }, [session]);

  const submit = async () => {
    if (!ready || busy) return;
    if (!email.trim() || !password) {
      setError('Escribe el correo y la contraseña de tu cuenta de prueba.');
      return;
    }
    setError('');
    setBusy(true);
    try {
      const message = await signIn(email, password);
      if (message) setError('No pudimos iniciar sesión. Revisa tus datos e inténtalo de nuevo.');
    } catch {
      setError('No fue posible conectar con Supabase. Revisa tu conexión e inténtalo de nuevo.');
    } finally {
      setBusy(false);
    }
  };

  return <Screen navigation={false} brand="ENTRE BOCADOS · PILOTO" avoidKeyboard>
    <Text style={styles.title}>Planes compartidos</Text>
    <Text style={styles.body}>Inicia sesión para coordinar una salida y conversar con tu coincidencia.</Text>
    <View style={styles.box}>
      <Text style={styles.label}>Correo electrónico</Text>
      <TextInput
        accessibilityLabel="Correo electrónico"
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        keyboardType="email-address"
        onChangeText={setEmail}
        placeholder="tu@correo.com"
        style={styles.input}
        textContentType="emailAddress"
        value={email}
      />
      <Text style={styles.label}>Contraseña</Text>
      <TextInput
        accessibilityLabel="Contraseña"
        autoCapitalize="none"
        autoComplete="current-password"
        onChangeText={setPassword}
        onSubmitEditing={() => void submit()}
        placeholder="Contraseña de la cuenta de prueba"
        returnKeyType="go"
        secureTextEntry
        style={styles.input}
        textContentType="password"
        value={password}
      />
    </View>
    {!!error && <Text accessibilityRole="alert" style={{ color: '#9B1C1C', fontSize: 15, lineHeight: 22 }}>{error}</Text>}
    {busy && <View accessibilityLiveRegion="polite" style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><ActivityIndicator color="#9A3412" /><Text style={styles.note}>Verificando la cuenta…</Text></View>}
    <Button disabled={!ready || busy} title={!ready ? 'Preparando sesión…' : busy ? 'Ingresando…' : 'Iniciar sesión'} onPress={() => void submit()} />
    <View style={styles.box}><Text style={styles.subtitle}>Acceso piloto</Text><Text style={styles.note}>Usa una cuenta de prueba que el equipo haya creado en Supabase. Aquí no se habilitan registros ni recuperación de contraseña.</Text></View>
    <Button secondary title="Volver a la demostración" onPress={() => router.replace('/plans')} />
  </Screen>;
}
