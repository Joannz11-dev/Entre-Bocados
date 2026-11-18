import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { authErrorMessage, useAuth } from '../state/auth';
import { Colors, Radius, Shadow, Spacing, Type, MaxContentWidth } from '../constants/theme';
import { Field, Input, PasswordInput, PrimaryButton, Rise, TextButton } from '../components/kit/ui';
import { goBackOrHome } from '../lib/nav';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MIN_PASSWORD = 8;
const RESEND_COOLDOWN = 60;

export default function Register() {
  const { signUp, signIn, resendConfirmation } = useAuth();
  const { top } = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeat, setRepeat] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [pendingError, setPendingError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown(c => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const submit = async () => {
    if (submitting) return;
    if (password !== repeat) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const { needsConfirmation } = await signUp(email, password);
      if (needsConfirmation) {
        setPendingEmail(email.trim());
        setCooldown(RESEND_COOLDOWN);
      } else {
        router.replace('/explore');
      }
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  /** El usuario dice que ya confirmó: intentamos entrar de una vez. */
  const checkConfirmed = async () => {
    if (!pendingEmail) return;
    setSubmitting(true);
    setPendingError(null);
    try {
      await signIn(pendingEmail, password);
      router.replace('/explore');
    } catch (err) {
      setPendingError(authErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (pendingEmail) {
    return (
      <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[styles.content, { maxWidth: MaxContentWidth, alignSelf: 'center', width: '100%', paddingTop: Math.max(top, 12) + Spacing.l }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Rise>
            <Text style={[Type.display, { fontSize: 28 }]}>Confirma tu correo</Text>
            <Text style={Type.body}>
              Enviamos un enlace de confirmación a {pendingEmail}. Tócalo desde este teléfono y la app abrirá tu sesión
              automáticamente.
            </Text>
          </Rise>
          <Rise delay={120}>
            <View style={styles.card}>
              <Text style={Type.heading}>¿Ya confirmaste?</Text>
              <Text style={Type.note}>Verifica que la cuenta esté activa entrando con tus datos.</Text>
              {pendingError ? <Text style={styles.error}>{pendingError}</Text> : null}
              <PrimaryButton title="Iniciar sesión" icon="check" disabled={submitting} onPress={checkConfirmed} />
              <TextButton
                title={cooldown > 0 ? `Reenviar correo (${cooldown}s)` : 'Reenviar correo de confirmación'}
                color={cooldown > 0 ? Colors.inkSoft : Colors.violet}
                onPress={() => {
                  if (cooldown > 0) return;
                  resendConfirmation(pendingEmail).catch(err => setPendingError(authErrorMessage(err)));
                  setCooldown(RESEND_COOLDOWN);
                }}
              />
            </View>
          </Rise>
          <Rise delay={200}>
            <TextButton title="Volver a iniciar sesión" color={Colors.inkSoft} onPress={() => router.replace('/login')} />
          </Rise>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[styles.content, { maxWidth: MaxContentWidth, alignSelf: 'center', width: '100%', paddingTop: Math.max(top, 12) + Spacing.l }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Rise>
          <Text style={[Type.display, { fontSize: 30 }]}>Crear cuenta</Text>
          <Text style={Type.body}>Registra tu correo y contraseña. Recibirás un enlace de confirmación.</Text>
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
            <Field label="Contraseña" hint={`Mínimo ${MIN_PASSWORD} caracteres.`}>
              <PasswordInput
                accessibilityLabel="Contraseña"
                autoComplete="new-password"
                textContentType="newPassword"
                placeholder="Crea una contraseña"
                value={password}
                onChangeText={setPassword}
                onSubmitEditing={submit}
              />
            </Field>
            <Field label="Repetir contraseña">
              <PasswordInput
                accessibilityLabel="Repetir contraseña"
                autoComplete="new-password"
                textContentType="newPassword"
                placeholder="Repite la contraseña"
                value={repeat}
                onChangeText={setRepeat}
                onSubmitEditing={submit}
              />
            </Field>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <PrimaryButton
              title="Crear cuenta"
              icon="arrow-right"
              disabled={submitting || !email.trim() || password.length < MIN_PASSWORD || repeat.length < MIN_PASSWORD}
              onPress={submit}
            />
          </View>
        </Rise>

        <Rise delay={200}>
          <View style={styles.footerRow}>
            <Text style={Type.body}>¿Ya tienes cuenta?</Text>
            <TextButton title="Iniciar sesión" onPress={() => router.replace('/login')} />
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
