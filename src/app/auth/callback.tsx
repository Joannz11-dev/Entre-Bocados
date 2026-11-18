import React, { useEffect, useState } from 'react';
import { Linking, Platform, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { supabase, parseAuthUrl } from '../../lib/supabase';
import { Colors, Spacing, Type } from '../../constants/theme';
import { PrimaryButton, TextButton } from '../../components/kit/ui';

/**
 * Pantalla que completa el flujo de correo: el enlace de confirmación o
 * recuperación abre la app aquí con los tokens en el fragmento de la URL,
 * se establece la sesión y se redirige según el tipo de correo.
 */
export default function AuthCallback() {
  const [status, setStatus] = useState<'working' | 'fail'>('working');

  useEffect(() => {
    (async () => {
      try {
        const link =
          Platform.OS === 'web'
            ? (typeof window !== 'undefined' ? window.location.href : null)
            : await Linking.getInitialURL();
        const tokens = parseAuthUrl(link);
        if (!tokens) throw new Error('El enlace no contiene credenciales.');
        const { error } = await supabase.auth.setSession({
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken,
        });
        if (error) throw error;
        // La bienvenida es el centro: desde ahí "Entrar como {cuenta}" abre la app.
        router.replace('/');
      } catch {
        setStatus('fail');
      }
    })();
  }, []);

  return (
    <View style={styles.screen}>
      <View style={styles.box}>
        {status === 'working' ? (
          <>
            <Text style={Type.heading}>Validando tu cuenta</Text>
            <Text style={Type.body}>Un momento, estamos abriendo tu sesión.</Text>
          </>
        ) : (
          <>
            <Text style={Type.heading}>El enlace no es válido o expiró</Text>
            <Text style={Type.body}>
              Los enlaces de confirmación y recuperación se usan una sola vez. Solicita otro desde la pantalla de acceso.
            </Text>
            <PrimaryButton title="Ir a la bienvenida" onPress={() => router.replace('/')} />
            <TextButton title="Volver a iniciar sesión" color={Colors.inkSoft} onPress={() => router.replace('/login')} />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.cream, alignItems: 'center', justifyContent: 'center' },
  box: { paddingHorizontal: Spacing.l, gap: Spacing.s, maxWidth: 480 },
});
