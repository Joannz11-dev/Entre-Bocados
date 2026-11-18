import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { authErrorMessage, useAuth } from '../state/auth';
import { Colors, Radius, Shadow, Spacing, Type, MaxContentWidth } from '../constants/theme';
import { Field, Input, PrimaryButton, Rise, TextButton } from '../components/kit/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Recuperar() {
  const { sendRecovery } = useAuth();
  const { top } = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    if (!email.trim() || sending) return;
    setSending(true);
    setError(null);
    try {
      await sendRecovery(email);
      setSent(true);
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[styles.content, { maxWidth: MaxContentWidth, alignSelf: 'center', width: '100%', paddingTop: Math.max(top, 12) + Spacing.l }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Rise>
          <Text style={[Type.display, { fontSize: 28 }]}>Recuperar contraseña</Text>
          <Text style={Type.body}>
            {sent
              ? `Enviamos un enlace a ${email.trim()}. Ábrelo desde este teléfono para continuar: la app se encarga del resto.`
              : 'Escribe el correo con el que te registraste y te enviaremos un enlace para crear una contraseña nueva.'}
          </Text>
        </Rise>

        {sent ? (
          <Rise delay={120}>
            <View style={styles.card}>
              <Text style={Type.heading}>Revisa tu correo</Text>
              <Text style={Type.note}>
                El enlace se usa una sola vez y devuelve la sesión a la app. Si no aparece, revisa la carpeta de spam
                (el servicio de demo envía pocos correos por hora).
              </Text>
              <PrimaryButton title="Volver a iniciar sesión" onPress={() => router.replace('/login')} />
              <TextButton title="Enviar el enlace de nuevo" color={Colors.inkSoft} onPress={submit} />
            </View>
          </Rise>
        ) : (
          <Rise delay={120}>
            <View style={styles.card}>
              <Field label="Correo electrónico">
                <Input
                  accessibilityLabel="Correo electrónico"
                  autoComplete="email"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  inputMode="email"
                  placeholder="tu@correo.com"
                  value={email}
                  onChangeText={setEmail}
                  onSubmitEditing={submit}
                />
              </Field>
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <PrimaryButton title="Enviar enlace" icon="send" disabled={sending || !email.trim()} onPress={submit} />
            </View>
          </Rise>
        )}

        <Rise delay={200}>
          <TextButton title="Volver a iniciar sesión" color={Colors.inkSoft} onPress={() => router.replace('/login')} />
        </Rise>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.cream },
  content: { gap: Spacing.l, paddingHorizontal: Spacing.l, paddingBottom: 48 },
  card: { backgroundColor: Colors.white, borderRadius: Radius.sheet, padding: Spacing.l, gap: Spacing.m, ...Shadow.card },
  error: { ...Type.body, color: Colors.pinkDeep },
});
