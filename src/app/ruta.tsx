import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Animated, { Easing, FadeInDown, runOnJS, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import Svg, { Circle, G, Path, Text as SvgText } from 'react-native-svg';
import { useDemo } from '../state/demo';
import { Colors, FontNames, Radius, Shadow, Spacing, Type, MaxContentWidth } from '../constants/theme';
import { formatPrice, type Restaurant } from '../types/restaurant';
import { CuisineTile } from '../components/kit/cuisine-tile';
import { EmptyState, GhostButton, PrimaryButton, Rise, TopInset, VioletButton, OrangeButton, FeedbackPill, useSquish } from '../components/kit/ui';
import { Confetti } from '../components/kit/confetti';
import { haptic } from '../lib/haptics';

/* Gajos de la marca: alternan tinta profunda y pastel del mismo tono
 * (rosa, violeta, naranja tostado, verde) — sin arcoíris y con etiqueta AA. */
const WEDGES = ['#E0245A', '#FFE1EA', '#7C4DFF', '#EDE7FF', '#A84B05', '#FFE7D1', '#0E7A43', '#DCF6E7'];
const LABEL_FG = ['#FFFFFF', Colors.pinkDeep, '#FFFFFF', Colors.violetDeep, '#FFFFFF', Colors.orangeDeep, '#FFFFFF', Colors.greenDeep];
const SIZE = 250;
const CENTER = SIZE / 2;
const RADIUS = CENTER - 6;
const MAX_WEDGES = 8;

/** Gajos = lugares reales de la ronda (2 a 8). La rueda nunca es decorativa. */
function wheelCount(n: number): number {
  return Math.min(MAX_WEDGES, Math.max(2, n));
}

function shortName(name: string): string {
  return name.length > 11 ? `${name.slice(0, 10).trimEnd()}…` : name;
}

export default function Ruta() {
  const { data, addPlan, restaurants } = useDemo();
  const spin = useSharedValue(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Restaurant | null>(null);
  const [burst, setBurst] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wheelN = useRef(MAX_WEDGES);
  const mounted = useRef(true);
  const hubSquish = useSquish();

  const loader = useSharedValue(0);
  useEffect(() => {
    if (spinning) {
      loader.value = withRepeat(withTiming(360, { duration: 900, easing: Easing.linear }), -1, false);
    } else {
      loader.value = 0;
    }
  }, [spinning, loader]);
  const loaderStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${loader.value}deg` }] }));

  const geoMode = restaurants.some(place => place.geo && place.distance_km != null);
  // La ruleta usa todo el catálogo filtrado (ignora lo deslizado en Explorar).
  const visible = useMemo(
    () =>
      restaurants.filter(
        p =>
          (geoMode || p.zone === data.zone) &&
          (data.cuisine === 'Todas' || p.cuisine === data.cuisine) &&
          (!data.budget || (p.price_min != null && p.price_min <= Number(data.budget))),
      ),
    [restaurants, data.zone, data.cuisine, data.budget, geoMode],
  );

  const n = wheelCount(visible.length);

  const wheelStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value}deg` }] }));

  const flash = (message: string) => {
    if (flashTimer.current) clearTimeout(flashTimer.current);
    setFeedback(message);
    flashTimer.current = setTimeout(() => setFeedback(null), 2600);
  };

  const finishSpin = (target: number) => {
    if (!mounted.current) return;
    const angle = 360 / wheelN.current;
    const landed = Math.floor((((360 - (target % 360)) % 360) + 360) % 360 / angle) % wheelN.current;
    const item = visible[landed % visible.length];
    setSpinning(false);
    if (item) {
      setResult(item);
      setBurst(b => b + 1);
      haptic.success();
    } else {
      haptic.warn();
      flash('La ruleta no encontró lugares con tus filtros');
    }
  };

  const girar = () => {
    if (spinning || visible.length === 0) return;
    wheelN.current = n;
    haptic.medium();
    setSpinning(true);
    setResult(null);
    const target = spin.value + 2160 + Math.random() * 360;
    spin.value = withTiming(target, { duration: 2800, easing: Easing.bezier(0.12, 0, 0.16, 1) }, finished => {
      if (finished) runOnJS(finishSpin)(target);
    });
  };

  const guardarPlan = () => {
    if (!result) return;
    addPlan({
      title: result.name,
      restaurantId: result.id,
      when: data.availability || 'Por acordar',
      status: 'pendiente',
      source: 'manual',
      note: 'Plan de la ruleta de rutas',
    });
    haptic.success();
    flash(`Plan guardado: ${result.name}`);
  };

  // Limpieza al desmontar: temporizadores del feedback.
  useEffect(
    () => () => {
      mounted.current = false;
      if (flashTimer.current) clearTimeout(flashTimer.current);
    },
    [],
  );

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TopInset />
        <Rise>
          <Text style={Type.display}>¿Sin ideas?</Text>
          <Text style={Type.body}>Deja que la ruta decida por ti: gira y quédate con el bocado que salga.</Text>
          <View style={{ flexDirection: 'row', marginTop: Spacing.s }}>
            <View style={styles.filterChip}>
              <Feather name={geoMode ? 'navigation' : 'map-pin'} size={12} color={Colors.greenDeep} />
              <Text style={styles.filterText}>{geoMode ? `Radio ${data.radiusKm} km` : data.zone}</Text>
            </View>
          </View>
        </Rise>

        {visible.length === 0 ? (
          <EmptyState
            title="La ruleta está vacía"
            body="No hay lugares con estos filtros. Amplía el radio, cambia la cocina o quita el presupuesto y vuelve a girar."
            action={<GhostButton title="Cambiar filtros" icon="sliders" onPress={() => router.push('/preferences')} />}
          />
        ) : (
          <Rise delay={120}>
            <View style={styles.wheelWrap}>
              {/* puntero pin de la marca: cae sobre el lugar que visita */}
              <View style={styles.pointer} pointerEvents="none">
                <Pointer />
              </View>
              <Animated.View style={[styles.wheelCard, wheelStyle]}>
                <Wheel names={visible.map(p => p.name)} n={n} />
              </Animated.View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Girar ruleta"
                accessibilityHint="Gira la rueda de lugares cerca de ti"
                onPress={girar}
                disabled={spinning}
                {...hubSquish.handlers}
                style={styles.hubBtn}
              >
                <Animated.View style={[styles.hub, hubSquish.style]}>
                  {spinning ? (
                    <Animated.View style={loaderStyle}>
                      <Feather name="loader" size={24} color={Colors.orangeDeep} />
                    </Animated.View>
                  ) : (
                    <Feather name="disc" size={26} color={Colors.orangeDeep} />
                  )}
                  <Text style={styles.hubLabel}>{spinning ? 'GIRANDO' : 'GIRAR'}</Text>
                </Animated.View>
              </Pressable>
            </View>
            <OrangeButton
              title={spinning ? 'Girando…' : result ? 'Girar otra vez' : 'Girar ruleta'}
              icon="disc"
              onPress={girar}
              disabled={spinning}
            />
          </Rise>
        )}

        {result && (
          <Animated.View
            entering={FadeInDown.springify().damping(9)}
            style={styles.resultCard}
            accessibilityLiveRegion="polite"
            accessibilityLabel={`¡La ruta eligió ${result.name}! ${result.cuisine}, ${formatPrice(result)}`}
          >
            <View style={styles.resultRow}>
              <CuisineTile cuisine={result.cuisine} width={58} height={58} radius={16} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.resultName} numberOfLines={2}>¡La ruta eligió {result.name}!</Text>
              </View>
            </View>
            <View style={styles.resultChips}>
              <View style={[styles.rChip, { backgroundColor: Colors.violetSoft }]}>
                <Feather name="coffee" size={11} color={Colors.violetDeep} />
                <Text style={[styles.rChipText, { color: Colors.violetDeep }]}>{result.cuisine}</Text>
              </View>
              <View style={[styles.rChip, { backgroundColor: Colors.pinkSoft }]}>
                <Feather name="dollar-sign" size={11} color={Colors.pinkDeep} />
                <Text style={[styles.rChipText, { color: Colors.pinkDeep }]}>{formatPrice(result)}</Text>
              </View>
              {result.distance_km != null ? (
                <View style={[styles.rChip, { backgroundColor: Colors.greenSoft }]}>
                  <Feather name="navigation" size={11} color={Colors.greenDeep} />
                  <Text style={[styles.rChipText, { color: Colors.greenDeep }]}>a {result.distance_km} km</Text>
                </View>
              ) : null}
            </View>
            <View style={{ gap: 10 }}>
              <PrimaryButton title="Ver el lugar" icon="eye" onPress={() => router.push({ pathname: '/restaurant/[id]', params: { id: result.id } })} />
              {result.geo ? (
                <GhostButton title="Ver en el mapa" icon="map" onPress={() => router.push('/mapa')} />
              ) : null}
              <VioletButton title="Guardar como plan" icon="calendar" onPress={guardarPlan} />
            </View>
          </Animated.View>
        )}

        <Rise delay={220}>
          <View style={styles.noteCard}>
            <Feather name="info" size={13} color={Colors.inkSoft} style={{ marginTop: 2 }} />
            <Text style={Type.note}>
              La ruleta elige al azar entre {visible.length} lugares cerca de ti con tus filtros activos. Cada gajo es un lugar real.
            </Text>
          </View>
        </Rise>
      </ScrollView>
      <Confetti burst={burst} count={26} />
      <FeedbackPill message={feedback} />
    </View>
  );
}

/** Puntero de la ruleta: pin rosa pastelería que apunta al lugar elegido. */
function Pointer() {
  return (
    <Svg width={36} height={44} viewBox="0 0 36 44">
      <Path
        d="M18 41 C18 41 32 24 32 15 C32 6.8 25.6 1 18 1 C10.4 1 4 6.8 4 15 C4 24 18 41 18 41 Z"
        fill={Colors.pinkFill}
        stroke="#FFFFFF"
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <Circle cx={18} cy={15} r={5.5} fill="#FFFFFF" />
    </Svg>
  );
}

function Wheel({ names, n }: { names: string[]; n: number }) {
  const angle = 360 / n;
  const wedges = Array.from({ length: n }, (_, i) => i);
  return (
    <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
      {wedges.map(i => {
        const start = (i * angle - 90) * (Math.PI / 180);
        const end = ((i + 1) * angle - 90) * (Math.PI / 180);
        const x1 = CENTER + RADIUS * Math.cos(start);
        const y1 = CENTER + RADIUS * Math.sin(start);
        const x2 = CENTER + RADIUS * Math.cos(end);
        const y2 = CENTER + RADIUS * Math.sin(end);
        return (
          <Path
            key={i}
            d={`M ${CENTER} ${CENTER} L ${x1} ${y1} A ${RADIUS} ${RADIUS} 0 0 1 ${x2} ${y2} Z`}
            fill={WEDGES[i % WEDGES.length]}
            stroke="#FFFFFF"
            strokeWidth={4}
            strokeLinejoin="round"
          />
        );
      })}
      {/* aro exterior: la repostería sostiene la rueda */}
      <Circle cx={CENTER} cy={CENTER} r={RADIUS - 2} fill="none" stroke="#FFFFFF" strokeWidth={5} />
      {/* nombres reales: cada gajo es un lugar de tu ronda */}
      {wedges.map(i => (
        <G key={`l-${i}`} transform={`rotate(${i * angle + angle / 2} ${CENTER} ${CENTER})`}>
          <SvgText
            x={CENTER}
            y={CENTER - RADIUS + 34}
            fill={LABEL_FG[i % LABEL_FG.length]}
            fontFamily={FontNames.label}
            fontSize={n >= 6 ? 12 : 13.5}
            fontWeight="800"
            textAnchor="middle"
          >
            {shortName(names[i % names.length])}
          </SvgText>
        </G>
      ))}
    </Svg>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.cream },
  content: { gap: Spacing.m, paddingHorizontal: Spacing.l, paddingTop: 18, paddingBottom: 48, maxWidth: MaxContentWidth, alignSelf: 'center', width: '100%' },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.white, borderRadius: 999, paddingHorizontal: 12, minHeight: 34, ...Shadow.card },
  filterText: { fontFamily: FontNames.label, fontSize: 12, color: Colors.greenDeep },
  wheelWrap: { alignItems: 'center', justifyContent: 'center', marginVertical: Spacing.s },
  wheelCard: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: Colors.white,
    padding: 6,
    ...Shadow.float,
  },
  pointer: { position: 'absolute', top: -4, left: 0, right: 0, alignItems: 'center', zIndex: 3 },
  hubBtn: { position: 'absolute', zIndex: 2 },
  hub: {
    width: 92,
    height: 92,
    borderRadius: 999,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    borderWidth: 6,
    borderColor: Colors.orangeSoft,
    ...Shadow.float,
  },
  hubLabel: { fontFamily: FontNames.label, fontSize: 9.5, letterSpacing: 1.2, color: Colors.orangeDeep },
  resultCard: { backgroundColor: Colors.white, borderRadius: Radius.sheet, padding: Spacing.l, gap: 12, ...Shadow.card },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  resultName: { fontFamily: FontNames.display, fontSize: 21, lineHeight: 26, color: Colors.ink },
  resultChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  rChip: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  rChipText: { fontFamily: FontNames.label, fontSize: 11 },
  noteCard: { flexDirection: 'row', gap: 8, backgroundColor: Colors.creamDeep, borderRadius: Radius.input, padding: 12, alignItems: 'flex-start' },
});
