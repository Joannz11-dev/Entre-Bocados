import React, { useEffect, useState } from 'react';
import { Redirect, router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSpring } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useDemo } from '../state/demo';
import { useAuth } from '../state/auth';
import { requestCurrentLocation } from '../lib/location';
import { goBackOrHome } from '../lib/nav';
import { Colors, FontNames, Radius, Shadow, Spacing, Type, MaxContentWidth } from '../constants/theme';
import { OsmMap } from '../components/kit/osm-map';
import { CuisineTile } from '../components/kit/cuisine-tile';
import { EmptyState, GhostButton, PrimaryButton, Rise, TopInset } from '../components/kit/ui';
import type { Coords } from '../types/restaurant';

/** Mapa de la ronda: todos los lugares cerca de ti, en el mundo de la marca. */
export default function Mapa() {
  const { restaurants, loading, reload, data } = useDemo();
  const { user, initializing } = useAuth();
  const [coords, setCoords] = useState<Coords | null>(null);
  const [granted, setGranted] = useState<boolean | null>(null);

  // Recarga el catálogo con el radio actual cada vez que entra o cambia el radio.
  useEffect(() => {
    if (!user) return;
    let active = true;
    requestCurrentLocation().then(res => {
      if (!active) return;
      setCoords(res.coords);
      setGranted(res.granted);
      void reload(res.coords, data.radiusKm);
    });
    return () => {
      active = false;
    };
  }, [user, reload, data.radiusKm]);

  if (initializing) return null;
  if (!user) return <Redirect href="/login" />;

  const mapeables = restaurants.filter(place => place.geo);

  const pedirUbicacion = () => {
    requestCurrentLocation().then(res => {
      setCoords(res.coords);
      setGranted(res.granted);
      void reload(res.coords, data.radiusKm);
    });
  };

  return (
    <View style={styles.screen}>
      <TopInset />
      {/* barra superior nativa: volver + título de contexto */}
      <View style={styles.topBar}>
        <Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={() => goBackOrHome('/explore')} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={Colors.ink} />
        </Pressable>
        <Text style={[Type.heading, { flexShrink: 1 }]} numberOfLines={1}>
          Mapa de la ronda
        </Text>
      </View>

      <View style={[styles.inner, { maxWidth: MaxContentWidth, alignSelf: 'center', width: '100%' }]}>
        <Rise>
          <Text style={[Type.display, { fontSize: 26 }]}>La ronda completa</Text>
          <Text style={Type.body}>Todos los lugares cerca de ti, dentro de tu radio de {data.radiusKm} km.</Text>
          <View style={styles.chipRow}>
            <View style={styles.metaChip}>
              <Feather name="map-pin" size={12} color={Colors.greenDeep} />
              <Text style={styles.metaText}>Radio {data.radiusKm} km</Text>
            </View>
            {mapeables.length ? (
              <View style={[styles.metaChip, { backgroundColor: Colors.amberSoft }]}>
                <Feather name="star" size={12} color={Colors.amberDeep} />
                <Text style={[styles.metaText, { color: Colors.amberDeep }]}>{mapeables.length} lugares</Text>
              </View>
            ) : null}
          </View>
        </Rise>

        <Rise delay={110} style={{ flex: 1 }}>
          {mapeables[0] && coords ? (
            <View style={styles.mapCard}>
              <OsmMap places={mapeables} user={coords} radiusKm={data.radiusKm} />
            </View>
          ) : loading ? (
            <MapSkeleton />
          ) : granted === false ? (
            <EmptyState
              pose="wave"
              title="Activa tu ubicación"
              body="Con tu ubicación el mapa se centra en ti y muestra solo lo que está a tu alcance. Puedes seguir sin activarla: tomamos el centro de Usaquén."
              action={<PrimaryButton title="Activar ubicación" icon="map-pin" onPress={pedirUbicacion} />}
            />
          ) : (
            <EmptyState
              pose="wave"
              title="Aún no hay lugares con coordenadas"
              body="Abre Explorar para cargar el catálogo y vuelve al mapa de la ronda."
              action={<GhostButton title="Ir a Explorar" icon="compass" onPress={() => router.replace('/explore')} />}
            />
          )}
        </Rise>

        {mapeables.length ? (
          <Rise delay={200}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.strip}>
              {mapeables.slice(0, 12).map(place => (
                <Pressable
                  key={place.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${place.name}, ${place.cuisine}${place.distance_km != null ? `, a ${place.distance_km} km` : ''}. Abrir el lugar.`}
                  onPress={() => router.push({ pathname: '/restaurant/[id]', params: { id: place.id } })}
                  style={styles.placeCard}
                >
                  <CuisineTile cuisine={place.cuisine} width={48} height={48} radius={12} />
                  <Text style={styles.placeName} numberOfLines={1}>{place.name}</Text>
                  <Text style={Type.micro} numberOfLines={1}>{place.distance_km != null ? `a ${place.distance_km} km` : place.zone}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </Rise>
        ) : null}

        {granted === false ? (
          <Rise delay={260}>
            <View style={styles.geoNote}>
              <Feather name="map-pin" size={14} color={Colors.amberDeep} />
              <Text style={[Type.note, { flex: 1, color: Colors.amberDeep }]}>
                Sin permiso de ubicación: se muestra el centro de Usaquén como referencia.
              </Text>
            </View>
          </Rise>
        ) : null}
      </View>
    </View>
  );
}

/** Carga con pulso: la misma promesa de esqueleto que Explorar. */
function MapSkeleton() {
  const pulse = useSharedValue(0);
  React.useEffect(() => {
    pulse.value = withRepeat(withSpring(1, { damping: 100, stiffness: 90 }), -1, true);
  }, [pulse]);
  const style = useAnimatedStyle(() => ({ opacity: 0.55 + pulse.value * 0.3 }));
  return (
    <View style={styles.skeleton}>
      <Animated.View style={[styles.skeletonPins, style]}>
        <View style={styles.skeletonPin} />
        <View style={[styles.skeletonPin, { opacity: 0.7 }]} />
        <View style={styles.skeletonPin} />
      </Animated.View>
      <Text style={Type.note}>Cargando lugares cerca de ti…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.cream },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: Spacing.s, paddingHorizontal: Spacing.l, paddingTop: Spacing.xs, minHeight: 48 },
  backBtn: { width: 44, height: 44, borderRadius: 999, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', ...Shadow.card },
  inner: { flex: 1, paddingHorizontal: Spacing.l, paddingTop: Spacing.m, gap: Spacing.m, paddingBottom: Spacing.l },
  chipRow: { flexDirection: 'row', gap: 8, marginTop: Spacing.s },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.greenSoft, borderRadius: 999, paddingHorizontal: 12, minHeight: 34 },
  metaText: { fontFamily: FontNames.label, fontSize: 12, color: Colors.greenDeep },
  mapCard: { flex: 1, borderRadius: Radius.sheet, overflow: 'hidden', backgroundColor: Colors.white, ...Shadow.float },
  strip: { gap: 10, paddingVertical: 2, paddingHorizontal: 2 },
  placeCard: { width: 122, gap: 6, backgroundColor: Colors.white, borderRadius: Radius.card, padding: 10, alignItems: 'flex-start', ...Shadow.card },
  placeName: { fontFamily: FontNames.label, fontSize: 12.5, color: Colors.ink },
  geoNote: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.amberSoft, borderRadius: Radius.input, paddingHorizontal: 12, paddingVertical: 10 },
  skeleton: { flex: 1, borderRadius: Radius.sheet, backgroundColor: Colors.creamDeep, alignItems: 'center', justifyContent: 'center', gap: Spacing.m, padding: Spacing.l, ...Shadow.card },
  skeletonPins: { flexDirection: 'row', gap: 16 },
  skeletonPin: { width: 18, height: 18, borderRadius: 999, backgroundColor: Colors.white },
});
