import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { authErrorMessage, useAuth } from '../state/auth';
import { Colors, Radius, Shadow, Spacing, Type, MaxContentWidth } from '../constants/theme';
import { Field, PasswordInput, PrimaryButton, Rise, TextButton } from '../components/kit/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Restablecer() {
  const { user, initializing, updatePassword } = useAuth();
  const { top } = useSafeAreaInsets();
  const [password, setPassword] = useState('');
  const [repeat, setRepeat] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (initializing) return null;
  if (!user) return <Redirect href="/login" />;

  const MIN = 8;
  const canSave = password.length >= MIN && password === repeat && !saving;

  const submit = async () => {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      await updatePassword(password);
      setDone(true);
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[styles.content, { maxWidth: MaxContentWidth, alignSelf: 'center', width: '100%', paddingTop: Math.max(top, 12) + Spacing.l }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {done ? (
          <Rise>
            <View style={styles.card}>
              <Text style={[Type.display, { fontSize: 28 }]}>Contraseña actualizada</Text>
              <Text style={Type.body}>Tu nueva contraseña ya está activa para este correo.</Text>
              <PrimaryButton title="Ir a la app" icon="arrow-right" onPress={() => router.replace('/explore')} />
            </View>
          </Rise>
        ) : (
          <>
            <Rise>
              <Text style={[Type.display, { fontSize: 28 }]}>Crear contraseña nueva</Text>
              <Text style={Type.body}>Sesión validada para {user.email}. Define tu nueva contraseña.</Text>
            </Rise>
            <Rise delay={120}>
              <View style={styles.card}>
                <Field label="Nueva contraseña" hint={`Mínimo ${MIN} caracteres.`}>
                  <PasswordInput
                    accessibilityLabel="Nueva contraseña"
                    autoComplete="new-password"
                    placeholder="Contraseña nueva"
                    value={password}
                    onChangeText={setPassword}
                    onSubmitEditing={submit}
                  />
                </Field>
                <Field label="Repetir contraseña">
                  <PasswordInput
                    accessibilityLabel="Repetir contraseña"
                    autoComplete="new-password"
                    placeholder="Repite la contraseña"
                    value={repeat}
                    onChangeText={setRepeat}
                    onSubmitEditing={submit}
                  />
                </Field>
                {error ? <Text style={styles.error}>{error}</Text> : null}
                {password.length > 0 && repeat.length > 0 && password !== repeat ? (
                  <Text style={styles.error}>Las contraseñas no coinciden.</Text>
                ) : null}
                <PrimaryButton title="Guardar contraseña" icon="check" disabled={!canSave} onPress={submit} />
              </View>
            </Rise>
          </>
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
