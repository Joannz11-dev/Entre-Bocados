import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSpring } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useDemo } from '../state/demo';
import { Colors, FontNames, Radius, Shadow, Spacing, Type, MaxContentWidth } from '../constants/theme';
import { PERSONAS } from '../data/social';
import { Mascot } from '../components/kit/mascot';
import { GhostButton, PrimaryButton, Rise, TopInset } from '../components/kit/ui';
import { Confetti } from '../components/kit/confetti';
import { haptic } from '../lib/haptics';

export default function Match() {
  const { persona: personaId } = useLocalSearchParams<{ persona: string }>();
  const { data, update } = useDemo();
  const persona = PERSONAS.find(p => p.id === personaId);
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (persona && !data.matches.includes(persona.id)) {
      update({ matches: [...data.matches, persona.id] });
    }
    haptic.success();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    pulse.value = withDelay(500, withRepeat(withSpring(1, { damping: 5, stiffness: 140 }), -1, true));
  }, [pulse]);

  const heartStyle = useAnimatedStyle(() => ({ transform: [{ scale: 1 + pulse.value * 0.18 }] }));

  if (!persona) {
    return (
      <View style={styles.screen}>
        <View style={styles.center}>
          <Text style={Type.body}>Este match no existe (todavía). ¡A deslizar!</Text>
          <GhostButton title="Volver a Conectar" icon="users" onPress={() => router.replace('/connect')} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.inner, { maxWidth: MaxContentWidth, alignSelf: 'center', width: '100%' }]}>
        <TopInset />
        <Rise>
          <View style={styles.titleWrap}>
            <Text style={styles.title}>¡Es un Match!</Text>
            <Text style={Type.body}>Ambos aprobaron este plan (demo)</Text>
          </View>
        </Rise>

        <Rise delay={140}>
          <View style={styles.matchRow}>
            <View style={styles.avatarCard}>
              <View style={styles.avatarBubble}>
                <Text style={[styles.avatarInitial, { color: Colors.pinkDeep }]}>{(data.alias || 'TÚ').trim().slice(0, 2).toUpperCase() || 'EB'}</Text>
              </View>
              <Text style={styles.avatarName}>{data.alias || 'Tú'}</Text>
            </View>
            <Animated.View style={[styles.heartBubble, heartStyle]}>
              <Feather name="heart" size={26} color={Colors.white} />
            </Animated.View>
            <View style={styles.avatarCard}>
              <View style={[styles.avatarBubble, { borderColor: persona.color }]}>
                <Text style={[styles.avatarInitial, { color: persona.color }]}>{persona.name[0]}</Text>
              </View>
              <Text style={styles.avatarName}>{persona.name}, {persona.age}</Text>
            </View>
          </View>
        </Rise>

        <Rise delay={260}>
          <View style={styles.card}>
            <View style={{ alignSelf: 'center' }}>
              <Mascot size={120} pose="heart" />
            </View>
            <Text style={Type.heading} numberOfLines={1}>{persona.name} también quiere ese bocado</Text>
            <Text style={Type.body}>“{persona.bio}”</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {persona.cuisines.map(c => (
                <View key={c} style={styles.chip}>
                  <Text style={styles.chipText}>{c}</Text>
                </View>
              ))}
              <View style={[styles.chip, { backgroundColor: Colors.greenSoft }]}>
                <Feather name="clock" size={11} color={Colors.greenDeep} />
                <Text style={[styles.chipText, { color: Colors.greenDeep }]}>{persona.availability}</Text>
              </View>
            </View>
            <View style={{ gap: 10 }}>
              <PrimaryButton title="Ver plan del dúo" icon="message-circle" onPress={() => router.replace({ pathname: '/chat', params: { thread: `persona:${persona.id}` } })} />
              <GhostButton title="Seguir explorando" icon="compass" onPress={() => router.replace('/explore')} />
            </View>
          </View>
        </Rise>

        <Rise delay={340}>
          <Text style={[Type.note, { textAlign: 'center' }]}>Match simulado: {persona.name} es ficticia y el plan queda solo en este dispositivo.</Text>
        </Rise>
      </View>
      <Confetti burst={1} count={34} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.cream },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.m, padding: Spacing.l },
  inner: { flex: 1, paddingHorizontal: Spacing.l, paddingTop: 12, gap: Spacing.m, paddingBottom: 40 },
  titleWrap: { alignItems: 'center', gap: 4 },
  title: { fontFamily: FontNames.displayHeavy, fontSize: 38, color: Colors.pink },
  matchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 18 },
  avatarCard: { alignItems: 'center', gap: 6 },
  avatarBubble: { width: 84, height: 84, borderRadius: 999, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: Colors.pinkSoft, ...Shadow.float },
  avatarEmoji: { fontSize: 40 },
  avatarInitial: { fontFamily: FontNames.displayHeavy, fontSize: 38 },
  avatarName: { fontFamily: FontNames.label, fontSize: 13, color: Colors.ink },
  heartBubble: { width: 56, height: 56, borderRadius: 999, backgroundColor: Colors.pink, alignItems: 'center', justifyContent: 'center', ...Shadow.float },
  card: { backgroundColor: Colors.white, borderRadius: Radius.sheet, padding: Spacing.l, gap: 10, ...Shadow.card, alignItems: 'center' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.violetSoft, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  chipText: { fontFamily: FontNames.label, fontSize: 11.5, color: Colors.violetDeep },
});
