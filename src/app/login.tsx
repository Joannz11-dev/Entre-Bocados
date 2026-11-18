import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { authErrorMessage, useAuth } from '../state/auth';
import { Colors, Radius, Shadow, Spacing, Type, MaxContentWidth } from '../constants/theme';
import { Field, Input, PasswordInput, PrimaryButton, Rise, TextButton } from '../components/kit/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { goBackOrHome } from '../lib/nav';

export default function Login() {
  const { signIn, user } = useAuth();
  const { top } = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Si la sesión ya está activa (p. ej. el correo acaba de confirmar), continúa sola.
  React.useEffect(() => {
    if (user) router.replace('/explore');
  }, [user]);

  const submit = async () => {
    if (submitting || !email.trim() || !password) return;
    setSubmitting(true);
    setError(null);
    try {
      await signIn(email, password);
      router.replace('/explore');
    } catch (err) {
      setError(authErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[styles.content, { maxWidth: MaxContentWidth, alignSelf: 'center', width: '100%', paddingTop: Math.max(top, 12) + Spacing.xl }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Rise>
          <Text style={[Type.display, { fontSize: 30 }]}>Iniciar sesión</Text>
          <Text style={Type.body}>Ingresa con tu cuenta de Entre Bocados.</Text>
        </Rise>

        <Rise delay={120}>
          <View style={styles.card}>
            <Field label="Correo electrónico">
              <Input
                accessibilityLabel="Correo electrónico"
                autoComplete="email"
                autoCapitalize="none"
                keyboardType="email-address"
                inputMode="email"
                textContentType="emailAddress"
                placeholder="tu@correo.com"
                value={email}
                onChangeText={setEmail}
                onSubmitEditing={submit}
              />
            </Field>
            <Field label="Contraseña">
              <PasswordInput
                accessibilityLabel="Contraseña"
                autoComplete="password"
                textContentType="password"
                placeholder="Tu contraseña"
                value={password}
                onChangeText={setPassword}
                onSubmitEditing={submit}
              />
            </Field>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <PrimaryButton title="Iniciar sesión" icon="arrow-right" disabled={submitting} onPress={submit} />
            <TextButton title="¿Olvidaste tu contraseña?" color={Colors.inkSoft} onPress={() => router.push('/recuperar')} />
          </View>
        </Rise>

        <Rise delay={200}>
          <View style={styles.footerRow}>
            <Text style={Type.body}>¿Aún no tienes cuenta?</Text>
            <TextButton title="Crear cuenta" onPress={() => router.push('/register')} />
          </View>
          <TextButton title="Volver" color={Colors.inkSoft} onPress={() => goBackOrHome()} />
        </Rise>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.cream },
  content: { gap: Spacing.l, paddingHorizontal: Spacing.l, paddingBottom: 48 },
  card: { backgroundColor: Colors.white, borderRadius: Radius.sheet, padding: Spacing.l, gap: Spacing.m, ...Shadow.card },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap' },
  error: { ...Type.body, color: Colors.pinkDeep },
});
