/* eslint-disable react-hooks/immutability -- las SharedValues de Reanimated son mutables por dise�o; la regla no las modela */
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withSpring } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useDemo } from '../state/demo';
import { useAuth } from '../state/auth';
import { Colors, FontNames, Radius, Shadow, Spacing, Type, MaxContentWidth } from '../constants/theme';
import { Logo, Mascot, Sparkle } from '../components/kit/mascot';
import { BlobField, GhostButton, HonestNote, PrimaryButton, Rise } from '../components/kit/ui';
import { haptic } from '../lib/haptics';

const FEATURES = [
  { icon: 'compass' as const, tone: Colors.greenSoft, fg: Colors.greenDeep, title: 'Explorar', body: 'Descubre nuevos restaurantes y platos en tu ciudad.', href: '/explore' as const },
  { icon: 'heart' as const, tone: Colors.pinkSoft, fg: Colors.pinkDeep, title: 'Dúo Sabores', body: 'Arma planes con tu gente o con tu pareja.', href: '/plans' as const },
  { icon: 'users' as const, tone: Colors.violetSoft, fg: Colors.violetDeep, title: 'Conectar', body: 'Encuentra personas con gustos parecidos.', href: '/connect' as const },
  { icon: 'disc' as const, tone: Colors.orangeSoft, fg: Colors.orangeDeep, title: 'Rutas', body: 'Gira la ruleta y deja que el antojo decida.', href: '/ruta' as const },
  { icon: 'coffee' as const, tone: Colors.amberSoft, fg: Colors.amberDeep, title: 'Grupos', body: 'Encuentra tu grupito para salir a comer.', href: '/grupo' as const },
];

export default function Welcome() {
  const { ready } = useDemo();
  const { user, initializing, signOut } = useAuth();
  const bounce = useSharedValue(0);
  React.useEffect(() => {
    bounce.value = withRepeat(withSpring(1, { damping: 6, stiffness: 120 }), -1, true);
  }, [bounce]);
  const mascotStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounce.value * -7 }, { rotate: `${bounce.value * 2.5}deg` }],
  }));

  if (!ready || initializing) {
    return (
      <View style={styles.screen}>
        <BlobField tint={1} />
        <View style={styles.center}><Text style={Type.body}>Preparando tu mesa…</Text></View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <BlobField tint={1} />
      <ScrollView contentContainerStyle={[styles.content, { maxWidth: MaxContentWidth, alignSelf: 'center', width: '100%' }]} showsVerticalScrollIndicator={false}>
        <SafeAreaTop />
        <Animated.View entering={FadeInDown.springify().damping(12)} style={styles.mascotWrap}>
          <Animated.View style={mascotStyle}>
            <Mascot size={196} />
            <Sparkle size={26} color={Colors.amber} style={styles.spark1} />
            <Sparkle size={18} color={Colors.violet} style={styles.spark2} />
          </Animated.View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).duration(500)} style={styles.logoWrap}>
          <Logo showMascot={false} titleSize={38} />
          <Text style={styles.tagline}>Descubre · comparte · disfruta</Text>
        </Animated.View>

        <Rise delay={240}>
          <View style={styles.heroCard}>
            <Text style={Type.title}>¿Dónde comemos hoy?</Text>
            <Text style={Type.body}>
              Desliza, guarda los lugares que te antojen y arma el plan con tu gente. Bogotá, bocado a bocado.
            </Text>
            <View style={{ gap: 10 }}>
              {user ? (
                <>
                  <PrimaryButton
                    title={`Entrar como ${(user.email || '').split('@')[0] || 'usuario'}`}
                    icon="arrow-right"
                    onPress={() => { haptic.medium(); router.replace('/explore'); }}
                  />
                  <GhostButton
                    title="Cerrar sesión y usar otra cuenta"
                    icon="log-out"
                    onPress={() => signOut().catch(() => {})}
                  />
                </>
              ) : (
                <>
                  <PrimaryButton title="Crear cuenta" icon="arrow-right" onPress={() => { haptic.medium(); router.push('/register'); }} />
                  <GhostButton title="Iniciar sesión" icon="user" onPress={() => router.push('/login')} />
                </>
              )}
            </View>
            {!user ? (
              <HonestNote>
                Te enviaremos un correo para activar tu cuenta. Todo lo que guardes queda en este dispositivo.
              </HonestNote>
            ) : null}
          </View>
        </Rise>

        {user ? (
          <Rise delay={360} style={{ marginTop: Spacing.l }}>
            <View style={styles.featureHeader}>
              <Text style={Type.heading}>Una app, muchas formas de disfrutarla</Text>
            </View>
            <View style={styles.featureGrid}>
              {FEATURES.map((f, i) => (
                <Rise key={f.title} delay={420 + i * 70}>
                  <FeatureCard {...f} />
                </Rise>
              ))}
            </View>
          </Rise>
        ) : null}
      </ScrollView>
    </View>
  );
}

function FeatureCard({ icon, tone, fg, title, body, href }: (typeof FEATURES)[number]) {
  return (
    <PressableCard href={href}>
      <View style={[styles.featureIcon, { backgroundColor: tone }]}>
        <Feather name={icon} size={19} color={fg} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[Type.bodyStrong, { fontFamily: FontNames.label }]}>{title}</Text>
        <Text style={[Type.note, { lineHeight: 17 }]}>{body}</Text>
      </View>
      <Feather name="chevron-right" size={16} color={Colors.inkSoft} />
    </PressableCard>
  );
}

function PressableCard({ href, children }: { href: '/explore' | '/plans' | '/connect' | '/ruta' | '/grupo'; children: React.ReactNode }) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={style}>
      <Pressable
        accessibilityRole="button"
        onPressIn={() => { scale.value = withSpring(0.97, { damping: 100 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 14 }); }}
        onPress={() => { haptic.light(); router.push(href); }}
        style={styles.featureCard}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

function SafeAreaTop() {
  const { top } = useSafeAreaInsets();
  return <View style={{ height: Math.max(top, 12) + Spacing.l }} />;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.cream },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { gap: Spacing.l, paddingHorizontal: Spacing.l, paddingBottom: 56 },
  mascotWrap: { alignSelf: 'center', marginTop: Spacing.s },
  spark1: { position: 'absolute', top: 6, right: 34 },
  spark2: { position: 'absolute', bottom: 30, left: 26 },
  logoWrap: { alignItems: 'center', gap: 6, marginTop: -8 },
  tagline: { ...Type.micro, letterSpacing: 2.4, textTransform: 'uppercase', color: Colors.inkSoft },
  heroCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.sheet,
    padding: Spacing.l,
    gap: 12,
    ...Shadow.card,
  },
  featureHeader: { marginBottom: Spacing.s },
  featureGrid: { gap: 10 },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    padding: 14,
    ...Shadow.card,
  },
  featureIcon: { width: 42, height: 42, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
});
