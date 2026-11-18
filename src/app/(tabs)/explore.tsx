/* eslint-disable react-hooks/immutability -- las SharedValues de Reanimated son mutables por dise�o; la regla no las modela */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSpring } from 'react-native-reanimated';
import { Image as ExpoImage } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { useDemo } from '../../state/demo';
import { Colors, FontNames, Shadow, Spacing, Type, MaxContentWidth } from '../../constants/theme';
import { formatPrice, type Coords, type Restaurant } from '../../types/restaurant';
import { SwipeDeck, type SwipeAction } from '../../components/kit/swipe-deck';
import { CuisineTile } from '../../components/kit/cuisine-tile';
import { EmptyState, FeedbackPill, GhostButton, PrimaryButton, TopInset } from '../../components/kit/ui';
import { requestCurrentLocation } from '../../lib/location';
import { haptic } from '../../lib/haptics';

export default function Explore() {
  const { data, update, restaurants, loading, error, reload } = useDemo();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [geo, setGeo] = useState<{ granted: boolean; source: string } | null>(null);
  const trigger = useRef<((action: SwipeAction) => void) | null>(null);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const geoRequested = useRef(false);
  const lastCenter = useRef<Coords | null>(null);

  // Ubicación: pide permiso y trae restaurantes reales alrededor del usuario.
  useEffect(() => {
    if (geoRequested.current) return;
    geoRequested.current = true;
    requestCurrentLocation().then(res => {
      lastCenter.current = res.coords;
      setGeo({ granted: res.granted, source: res.source });
      void reload(res.coords);
    });
  }, [reload]);

  // Cambiar el radio desde preferencias reconsulta el catálogo.
  useEffect(() => {
    if (!lastCenter.current) return;
    void reload(lastCenter.current, data.radiusKm);
  }, [data.radiusKm, reload]);

  const geoMode = restaurants.some(place => place.geo && place.distance_km != null);

  const visible = useMemo(
    () =>
      restaurants.filter(
        p =>
          (geoMode || p.zone === data.zone) &&
          !data.dismissed.includes(p.id) &&
          (data.cuisine === 'Todas' || p.cuisine === data.cuisine) &&
          (!data.budget || (p.price_min != null && p.price_min <= Number(data.budget))),
      ),
    [restaurants, data.zone, data.cuisine, data.budget, data.dismissed, geoMode],
  );

  const refresh = () => void reload(lastCenter.current ?? undefined, data.radiusKm);

  const flash = (message: string) => {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    setFeedback(message);
    feedbackTimer.current = setTimeout(() => setFeedback(null), 2400);
  };

  const commit = (action: SwipeAction, place: Restaurant) => {
    const patch: Parameters<typeof update>[0] = { dismissed: [...data.dismissed, place.id] };
    if (action === 'favorite') patch.favorites = [...new Set([...data.favorites, place.id])];
    if (action === 'like') patch.liked = [...new Set([...data.liked, place.id])];
    update(patch);
    if (action === 'favorite') {
      haptic.success();
      flash(`¡Me encanta! ${place.name} quedó guardado.`);
    } else if (action === 'like') {
      flash(`Te interesa ${place.name}`);
    } else {
      flash(`Pasaste de largo ${place.name}`);
    }
  };

  const surprise = () => {
    if (visible.length === 0) return;
    haptic.medium();
    const pick = visible[Math.floor(Math.random() * visible.length)];
    router.push({ pathname: '/restaurant/[id]', params: { id: pick.id } });
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.inner, { maxWidth: MaxContentWidth, alignSelf: 'center', width: '100%' }]}>
        <TopInset />
        {/* encabezado de marca */}
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/preferences')}
            style={styles.zoneChip}
          >
            <Feather name={geoMode ? 'navigation' : 'map-pin'} size={14} color={Colors.greenDeep} />
            <Text style={styles.zoneText}>{geoMode ? `Radio ${data.radiusKm} km` : data.zone}</Text>
            <Feather name="sliders" size={14} color={Colors.greenDeep} />
          </Pressable>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ver en el mapa"
              onPress={() => router.push('/mapa')}
              style={styles.favBtn}
            >
              <Feather name="map" size={20} color={Colors.greenDeep} />
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Mis guardados" onPress={() => router.push('/favoritos')} style={styles.favBtn}>
              <Feather name="heart" size={20} color={Colors.pinkDeep} />
            </Pressable>
          </View>
        </View>

        {geo && !geo.granted ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              requestCurrentLocation().then(res => {
                lastCenter.current = res.coords;
                setGeo({ granted: res.granted, source: res.source });
                refresh();
              });
            }}
            style={styles.geoBanner}
          >
            <Feather name="map-pin" size={14} color={Colors.amberDeep} />
            <Text style={[Type.note, { flex: 1, color: Colors.amberDeep }]}>
              Activa la ubicación del teléfono para ver restaurantes reales con distancia.
            </Text>
            <Feather name="chevron-right" size={14} color={Colors.amberDeep} />
          </Pressable>
        ) : null}

        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={Type.display}>Descubre tu bocado</Text>
            <Text style={Type.body}>Un lugar a la vez. Desliza para decidir.</Text>
          </View>
        </View>

        {loading ? (
          <DeckSkeleton />
        ) : error ? (
          <EmptyState
            title="No pudimos cargar los lugares"
            body={error}
            action={<PrimaryButton title="Reintentar" icon="refresh-cw" onPress={refresh} />}
          />
        ) : visible[0] ? (
          <>
            <SwipeDeck
              items={visible}
              onCommit={commit}
              triggerRef={trigger}
              onOpen={place => router.push({ pathname: '/restaurant/[id]', params: { id: place.id } })}
              accessibilityLabel={p => `${p.name}, ${p.cuisine} en ${p.zone}. Desliza a la izquierda para pasar, a la derecha para indicar interés o arriba para guardar en favoritos.`}
              renderItem={place => <RestaurantCard place={place} />}
            />
            {/* acción de la ronda */}
            <View style={styles.actions}>
              <ActionButton label="Pasar" bg={Colors.white} iconColor={Colors.pinkDeep} icon="x" onPress={() => trigger.current?.('pass')} size={58} />
              <ActionButton label="Sorpréndeme" bg={Colors.violet} iconColor={Colors.white} icon="shuffle" onPress={surprise} size={52} secondary />
              <ActionButton label="Me encanta" bg={Colors.green} iconColor={Colors.white} icon="check" onPress={() => trigger.current?.('favorite')} size={58} />
            </View>
            <View style={styles.rutaRow}>
              <Pressable accessibilityRole="button" onPress={() => router.push('/ruta')} style={styles.rutaChip}>
                <Feather name="disc" size={15} color={Colors.orangeDeep} />
                <Text style={styles.rutaText}>¿Sin ideas? Gira la ruleta</Text>
                <Feather name="chevron-right" size={14} color={Colors.orangeDeep} />
              </Pressable>
            </View>
          </>
        ) : (
          <EmptyState
            title="Nada cerca con estos filtros"
            body={
              data.budget
                ? 'El filtro de presupuesto excluye lugares cuyo precio no está reportado. Quitarlo muestra todo el radio.'
                : 'No hay más lugares en este radio. Amplía el radio o empieza otra ronda.'
            }
            action={
              <View style={{ gap: 10, alignSelf: 'stretch' }}>
                {data.budget ? (
                  <PrimaryButton title="Quitar filtro de presupuesto" icon="dollar-sign" onPress={() => update({ budget: '' })} />
                ) : null}
                <PrimaryButton title="Empezar otra ronda" icon="rotate-ccw" onPress={() => update({ dismissed: [] })} />
                <GhostButton title="Cambiar filtros" icon="sliders" onPress={() => router.push('/preferences')} />
                <GhostButton title="Actualizar lugares" icon="refresh-cw" onPress={refresh} />
              </View>
            }
          />
        )}
      </View>
      <FeedbackPill message={feedback} />
    </View>
  );
}

function RestaurantCard({ place }: { place: Restaurant }) {
  const height = 300;
  return (
    <View style={styles.cardContent}>
      <View style={{ height, width: '100%' }}>
        {place.image_url ? (
          <ExpoImage source={{ uri: place.image_url }} style={{ width: '100%', height }} contentFit="cover" accessibilityLabel={`Foto de ${place.name}`} transition={300} />
        ) : (
          <CuisineTile cuisine={place.cuisine} fill height={height} radius={0} />
        )}
      </View>
      <View style={styles.cardBody}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={styles.cardName} numberOfLines={1}>{place.name}</Text>
          <Text style={styles.cardPrice}>{formatPrice(place)}</Text>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 }}>
          <MetaChip label={place.cuisine} tone={Colors.violetSoft} fg={Colors.violetDeep} icon="coffee" />
          {place.rating != null ? (
            <MetaChip
              label={`${place.rating} (${place.rating_count ?? 0})`}
              tone={Colors.amberSoft}
              fg={Colors.amberDeep}
              icon="star"
            />
          ) : null}
          {place.distance_km != null ? (
            <MetaChip label={`a ${place.distance_km} km`} tone={Colors.pinkSoft} fg={Colors.pinkDeep} icon="navigation" />
          ) : (
            <MetaChip label={place.zone} tone={Colors.greenSoft} fg={Colors.greenDeep} icon="map-pin" />
          )}
        </View>
      </View>
    </View>
  );
}

function MetaChip({ label, tone, fg, icon }: { label: string; tone: string; fg: string; icon?: keyof typeof Feather.glyphMap }) {
  return (
    <View style={[styles.metaChip, { backgroundColor: tone }]}>
      {icon ? <Feather name={icon} size={11} color={fg} /> : null}
      <Text style={[styles.metaChipText, { color: fg }]}>{label}</Text>
    </View>
  );
}

function ActionButton({ label, bg, iconColor, icon, onPress, size, secondary }: { label: string; bg: string; iconColor: string; icon: keyof typeof Feather.glyphMap; onPress: () => void; size: number; secondary?: boolean }) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPressIn={() => { scale.value = withSpring(0.86, { damping: 100 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 10, stiffness: 260 }); }}
      onPress={() => { haptic.light(); onPress(); }}
      style={{ alignItems: 'center', gap: 4 }}
    >
      <Animated.View style={[styles.actionBtn, { backgroundColor: bg, width: size, height: size, borderRadius: size }, secondary && { elevation: 3 }, style]}>
        <Feather name={icon} size={size * 0.42} color={iconColor} />
      </Animated.View>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

function DeckSkeleton() {
  const pulse = useSharedValue(0);
  React.useEffect(() => {
    pulse.value = withRepeat(withSpring(1, { damping: 100, stiffness: 90 }), -1, true);
  }, [pulse]);
  const style = useAnimatedStyle(() => ({ opacity: 0.55 + pulse.value * 0.3 }));
  return (
    <View style={{ flex: 1, justifyContent: 'center', gap: Spacing.l }}>
      <Animated.View style={[styles.skeletonCard, style]}>
        <View style={styles.skeletonTile} />
        <View style={styles.skeletonLine} />
        <View style={[styles.skeletonLine, { width: '55%' }]} />
      </Animated.View>
      <Text style={[Type.note, { textAlign: 'center' }]}>Preparando lugares cerca de ti…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.cream },
  inner: { flex: 1, paddingHorizontal: Spacing.l, paddingTop: 14, gap: Spacing.m, paddingBottom: 118 },
  geoBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.amberSoft, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  zoneChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.white, borderRadius: 999, paddingHorizontal: 14, minHeight: 40, ...Shadow.card },
  zoneText: { fontFamily: FontNames.label, fontSize: 13, color: Colors.greenDeep },
  favBtn: { width: 44, height: 44, borderRadius: 999, backgroundColor: Colors.pinkSoft, alignItems: 'center', justifyContent: 'center', ...Shadow.card },
  titleRow: { flexDirection: 'row', alignItems: 'flex-end' },
  cardContent: { flex: 1, backgroundColor: Colors.white, borderRadius: 26, overflow: 'hidden' },
  cardBody: { flex: 1, padding: 16, gap: 6, backgroundColor: Colors.white },
  cardName: { fontFamily: FontNames.display, fontSize: 22, color: Colors.ink, flex: 1, marginRight: 8 },
  cardPrice: { fontFamily: FontNames.label, fontSize: 13, color: Colors.pinkDeep },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  metaChipText: { fontFamily: FontNames.label, fontSize: 11 },
  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 26 },
  actionBtn: { alignItems: 'center', justifyContent: 'center', ...Shadow.float },
  actionLabel: { fontFamily: FontNames.label, fontSize: 10.5, color: Colors.inkSoft },
  rutaRow: { flexDirection: 'row', justifyContent: 'center' },
  rutaChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.orangeSoft, borderRadius: 999, paddingHorizontal: 14, minHeight: 38 },
  rutaText: { fontFamily: FontNames.label, fontSize: 12.5, color: Colors.orangeDeep },
  skeletonCard: { backgroundColor: Colors.white, borderRadius: 26, padding: 16, gap: 12, ...Shadow.card },
  skeletonTile: { height: 220, borderRadius: 18, backgroundColor: Colors.creamDeep },
  skeletonLine: { height: 16, borderRadius: 8, backgroundColor: Colors.creamDeep, width: '80%' },
});
