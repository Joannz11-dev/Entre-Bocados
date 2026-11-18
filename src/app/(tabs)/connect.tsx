/* eslint-disable react-hooks/immutability -- las SharedValues de Reanimated son mutables por dise�o; la regla no las modela */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useDemo } from '../../state/demo';
import { Colors, FontNames, Radius, Shadow, Spacing, Type, MaxContentWidth } from '../../constants/theme';
import { PERSONAS, type Persona, type Duo } from '../../data/social';
import { SwipeDeck, type SwipeAction } from '../../components/kit/swipe-deck';
import { EmptyState, FeedbackPill, GhostButton, PrimaryButton, TopInset } from '../../components/kit/ui';
import { distanceKmBetween, lastKnownLocation } from '../../lib/location';
import type { Coords } from '../../types/restaurant';
import { haptic } from '../../lib/haptics';

export default function Connect() {
  const { data, update } = useDemo();
  const [feedback, setFeedback] = useState<string | null>(null);
  const trigger = useRef<((action: SwipeAction) => void) | null>(null);
  const pool = PERSONAS.filter(p => !data.dismissed.includes(`persona:${p.id}`));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Distancia real de cada perfil según la ubicación del teléfono.
  const [userCoords, setUserCoords] = useState<Coords | null>(null);
  useEffect(() => {
    lastKnownLocation().then(res => setUserCoords(res.coords));
  }, []);
  const distanceLabel = useMemo(
    () => (persona: Persona) =>
      userCoords ? `A ${distanceKmBetween(userCoords, persona.coords)} km` : persona.distance,
    [userCoords],
  );

  const flash = (message: string) => {
    if (timer.current) clearTimeout(timer.current);
    setFeedback(message);
    timer.current = setTimeout(() => setFeedback(null), 2400);
  };

  const commit = (action: SwipeAction, persona: Persona) => {
    update({ dismissed: [...data.dismissed, `persona:${persona.id}`] });
    if (action === 'like') {
      haptic.success();
      update({ matches: [...new Set([...data.matches, persona.id])] });
      setTimeout(() => router.push({ pathname: '/match', params: { persona: persona.id } }), 260);
    } else {
      flash(`Pasaste de ${persona.name}`);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.inner, { maxWidth: MaxContentWidth, alignSelf: 'center', width: '100%' }]}>
        <TopInset />
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={[Type.title, { fontSize: 27 }]}>Modo Conectar</Text>
            <Text style={Type.body}>Personas con gustos parecidos al antojo.</Text>
          </View>
          <View style={styles.onlineChip}>
            <View style={styles.dot} />
            <Text style={styles.onlineText}>En línea · demo</Text>
          </View>
        </View>

        {pool[0] ? (
          <SwipeDeck
            items={pool}
            peek={2}
            onCommit={commit}
            triggerRef={trigger}
            stamps={{
              like: { label: '¡MATCH!', color: Colors.pink, bg: Colors.white },
              pass: { label: 'NOPE', color: Colors.violetDeep, bg: Colors.white },
              favorite: { label: 'SÚPER', color: Colors.amberDeep, bg: Colors.white },
            }}
            accessibilityLabel={p => `${p.name}, ${p.age} años, ${p.zone}. Desliza a la izquierda para pasar o a la derecha para conectar.`}
            renderItem={persona => <PersonaCard persona={persona} distanceLabel={distanceLabel(persona)} />}
          />
        ) : (
          <EmptyState
            pose="heart"
            title="Se acabaron los bocados sociales"
            body="Ya viste a todas las personas de esta demo. Vuelve a traerlas o mira los dúos disponibles."
            action={
              <View style={{ gap: 10, alignSelf: 'stretch' }}>
                <PrimaryButton title="Traerlas de vuelta" icon="rotate-ccw" onPress={() => update({ dismissed: data.dismissed.filter(d => !d.startsWith('persona:')) })} />
                <GhostButton title="Ver dúos disponibles" icon="users" onPress={() => router.push('/duos')} />
              </View>
            }
          />
        )}

        {pool[0] && (
          <>
            <View style={styles.actions}>
              <DeckAction label="Pasar" bg={Colors.white} iconColor={Colors.violetDeep} icon="x" onPress={() => trigger.current?.('pass')} size={58} />
              <DeckAction
                label="Chatear"
                bg={Colors.violet}
                iconColor={Colors.white}
                icon="message-circle"
                onPress={() => {
                  haptic.light();
                  router.push({ pathname: '/chat', params: { thread: `persona:${pool[0].id}` } });
                }}
                size={52}
              />
              <DeckAction label="¡Match!" bg={Colors.pink} iconColor={Colors.white} icon="heart" onPress={() => trigger.current?.('like')} size={58} />
            </View>
            <Pressable accessibilityRole="button" onPress={() => router.push('/duos')} style={styles.duosChip}>
              <Feather name="users" size={15} color={Colors.violetDeep} />
              <Text style={styles.duosText}>Ver dúos disponibles</Text>
              <Feather name="chevron-right" size={14} color={Colors.violetDeep} />
            </Pressable>
          </>
        )}
      </View>
      <FeedbackPill message={feedback} />
    </View>
  );
}

export function PersonaCard({ persona, compact = false, distanceLabel }: { persona: Persona; compact?: boolean; distanceLabel?: string }) {
  return (
    <View style={styles.personaCard}>
      <View style={[styles.personaTop, { backgroundColor: persona.color + '22' }]}>
        <View style={styles.sparkA}><SparkleDot color={persona.color} size={10} /></View>
        <View style={styles.sparkB}><SparkleDot color={Colors.amber} size={8} /></View>
        <View style={styles.avatarBig}>
          <Text style={[styles.avatarInitial, { color: persona.color }]}>{persona.name[0]}</Text>
          <View style={styles.onlineDot} />
        </View>
        <View style={styles.personaDistance}>
          <Feather name="map-pin" size={11} color={Colors.greenDeep} />
          <Text style={styles.personaDistanceText}>{distanceLabel ?? persona.distance}</Text>
        </View>
      </View>
      <View style={[styles.personaBody, compact && { padding: 12 }]}>
        <View style={styles.personaNameRow}>
          <Text style={[styles.personaName, compact && { fontSize: 18 }]}>{persona.name}, {persona.age}</Text>
          <Text style={[styles.personaBudget, { color: Colors.inkSoft }]}>{persona.budget}</Text>
        </View>
        {!compact && <Text style={Type.body} numberOfLines={2}>{persona.bio}</Text>}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {persona.cuisines.map(c => (
            <View key={c} style={[styles.pChip, { backgroundColor: Colors.violetSoft }]}>
              <Text style={[styles.pChipText, { color: Colors.violetDeep }]}>{c}</Text>
            </View>
          ))}
          <View style={[styles.pChip, { backgroundColor: Colors.greenSoft }]}>
            <Feather name="clock" size={10} color={Colors.greenDeep} />
            <Text style={[styles.pChipText, { color: Colors.greenDeep }]}>{persona.availability}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function SparkleDot({ color, size }: { color: string; size: number }) {
  return <View style={{ width: size, height: size, borderRadius: size, backgroundColor: color, opacity: 0.7 }} />;
}

export function DuoCard({ duo }: { duo: Duo }) {
  return (
    <View style={styles.duoCard}>
      <View style={styles.duoAvatars}>
        <View style={[styles.duoAvatar, { backgroundColor: duo.aColor }]}>
          <Text style={styles.duoAvatarText}>{duo.a[0]}</Text>
        </View>
        <View style={[styles.duoAvatar, { backgroundColor: duo.bColor, marginLeft: -10 }]}>
          <Text style={styles.duoAvatarText}>{duo.b[0]}</Text>
        </View>
        <View style={styles.duoHeart}>
          <Feather name="heart" size={12} color={Colors.white} />
        </View>
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={styles.duoName}>{duo.a} y {duo.b}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
          <View style={[styles.pChip, { backgroundColor: Colors.pinkSoft }]}><Text style={[styles.pChipText, { color: Colors.pinkDeep }]}>{duo.cuisine}</Text></View>
          <View style={[styles.pChip, { backgroundColor: Colors.greenSoft }]}><Text style={[styles.pChipText, { color: Colors.greenDeep }]}>{duo.when}</Text></View>
        </View>
        <Text style={Type.note} numberOfLines={1}>{duo.note}</Text>
      </View>
      <PrimaryButton small title="Conectar" onPress={() => { haptic.light(); router.push({ pathname: '/chat', params: { thread: `duo:${duo.id}` } }); }} />
    </View>
  );
}

function DeckAction({ label, bg, iconColor, icon, onPress, size }: { label: string; bg: string; iconColor: string; icon: keyof typeof Feather.glyphMap; onPress: () => void; size: number }) {
  const scale = useSquishScale();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPressIn={() => scale.press(true)} onPressOut={() => scale.press(false)} onPress={onPress} style={{ alignItems: 'center', gap: 4 }}>
      <Animated.View style={[styles.deckAction, { backgroundColor: bg, width: size, height: size, borderRadius: size }, scale.style]}>
        <Feather name={icon} size={size * 0.42} color={iconColor} />
      </Animated.View>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

function useSquishScale() {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return {
    style,
    press: (down: boolean) => {
      scale.value = withSpring(down ? 0.86 : 1, down ? { damping: 100 } : { damping: 10, stiffness: 260 });
    },
  };
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.cream },
  inner: { flex: 1, paddingHorizontal: Spacing.l, paddingTop: 14, gap: Spacing.m, paddingBottom: 118 },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  onlineChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.white, borderRadius: 999, paddingHorizontal: 12, minHeight: 36, ...Shadow.card },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.green },
  onlineText: { fontFamily: FontNames.label, fontSize: 11.5, color: Colors.greenDeep },
  personaCard: { flex: 1, backgroundColor: Colors.white, borderRadius: 26, overflow: 'hidden' },
  personaTop: { alignItems: 'center', justifyContent: 'center', height: 230 },
  avatarBig: { width: 118, height: 118, borderRadius: 999, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', ...Shadow.float },
  avatarInitial: { fontFamily: FontNames.displayHeavy, fontSize: 52 },
  onlineDot: { position: 'absolute', right: 8, bottom: 8, width: 16, height: 16, borderRadius: 8, backgroundColor: Colors.green, borderWidth: 3, borderColor: Colors.white },
  sparkA: { position: 'absolute', top: 26, left: 34 },
  sparkB: { position: 'absolute', top: 52, right: 40 },
  personaDistance: { position: 'absolute', top: 18, left: 18, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.white, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, ...Shadow.card },
  personaDistanceText: { fontFamily: FontNames.label, fontSize: 11, color: Colors.greenDeep },
  personaBody: { flex: 1, padding: 16, gap: 8 },
  personaNameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  personaName: { fontFamily: FontNames.display, fontSize: 24, color: Colors.ink },
  personaBudget: { fontFamily: FontNames.label, fontSize: 16 },
  pChip: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  pChipText: { fontFamily: FontNames.label, fontSize: 11 },
  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 26 },
  deckAction: { alignItems: 'center', justifyContent: 'center', ...Shadow.float },
  actionLabel: { fontFamily: FontNames.label, fontSize: 10.5, color: Colors.inkSoft },
  duosChip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: Colors.violetSoft, borderRadius: 999, alignSelf: 'center', paddingHorizontal: 14, minHeight: 38 },
  duosText: { fontFamily: FontNames.label, fontSize: 12.5, color: Colors.violetDeep },
  duoCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.white, borderRadius: Radius.card, padding: 12, ...Shadow.card },
  duoAvatars: { flexDirection: 'row', alignItems: 'center' },
  duoAvatar: { width: 44, height: 44, borderRadius: 999, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: Colors.white },
  duoAvatarText: { fontFamily: FontNames.displayHeavy, fontSize: 18, color: Colors.white },
  duoHeart: { position: 'absolute', right: -6, bottom: -2, width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.pink, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.white },
  duoName: { fontFamily: FontNames.label, fontSize: 14, color: Colors.ink },
});
