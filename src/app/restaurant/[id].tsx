import React, { useEffect, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Image as ExpoImage } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { useDemo } from '../../state/demo';
import { Colors, FontNames, Radius, Shadow, Spacing, Type, MaxContentWidth } from '../../constants/theme';
import { formatPrice, type Coords } from '../../types/restaurant';
import { CuisineTile } from '../../components/kit/cuisine-tile';
import { OsmMap } from '../../components/kit/osm-map';
import { GhostButton, HonestNote, PrimaryButton, Rise } from '../../components/kit/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { goBackOrHome } from '../../lib/nav';
import { lastKnownLocation } from '../../lib/location';
import { haptic } from '../../lib/haptics';

export default function Detail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { top } = useSafeAreaInsets();
  const { data, update, restaurants, loading, error, reload } = useDemo();
  const place = restaurants.find(item => item.id === id);
  const [userCoords, setUserCoords] = useState<Coords | null>(null);

  useEffect(() => {
    let active = true;
    lastKnownLocation().then(res => {
      if (active) setUserCoords(res.coords);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!place) {
    return (
      <View style={styles.screen}>
        <View style={styles.center}>
          <Text style={Type.body}>{loading ? 'Cargando…' : error || 'Restaurante no disponible.'}</Text>
          {error ? <PrimaryButton title="Reintentar" icon="refresh-cw" onPress={() => void reload()} /> : null}
          <GhostButton title="Volver a explorar" onPress={() => router.replace('/explore')} />
        </View>
      </View>
    );
  }

  const favorite = data.favorites.includes(place.id);
  const toggleFav = () => {
    haptic.light();
    update({
      favorites: favorite ? data.favorites.filter(item => item !== place.id) : [...data.favorites, place.id],
    });
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.content, { maxWidth: MaxContentWidth, alignSelf: 'center', width: '100%' }]}>
        {/* héroe */}
        <View style={styles.hero}>
          {place.image_url ? (
            <ExpoImage source={{ uri: place.image_url }} style={StyleSheet.absoluteFill} contentFit="cover" accessibilityLabel={`Foto de ${place.name}`} transition={300} />
          ) : (
            <View style={StyleSheet.absoluteFill}>
              <CuisineTile cuisine={place.cuisine} fill radius={0} iconSize={44} />
            </View>
          )}
          <View style={[styles.heroBar, { top: Math.max(top, 12) }]}>
            <Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={() => goBackOrHome('/explore')} style={styles.circleBtn}>
              <Feather name="arrow-left" size={20} color={Colors.ink} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={favorite ? 'Quitar de favoritos' : 'Guardar favorito'}
              onPress={toggleFav}
              style={[styles.circleBtn, favorite && { backgroundColor: Colors.pink }]}
            >
              <Feather name="heart" size={20} color={favorite ? Colors.white : Colors.pinkDeep} />
            </Pressable>
          </View>
          {place.image_url ? null : (
            <View style={styles.heroLabel}>
              <Text style={styles.heroLabelText}>Ilustración de la cocina · sin foto autorizada</Text>
            </View>
          )}
        </View>

        <Rise delay={80} style={{ gap: Spacing.m, paddingHorizontal: Spacing.l, paddingBottom: 40, marginTop: -28 }}>
          <View style={styles.sheet}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.name}>{place.name}</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  <ChipSoft label={place.cuisine} bg={Colors.violetSoft} fg={Colors.violetDeep} />
                  <ChipSoft label={formatPrice(place)} bg={Colors.pinkSoft} fg={Colors.pinkDeep} />
                  {place.rating != null ? (
                    <ChipSoft label={`${place.rating} de 5 · ${place.rating_count ?? 0} reseñas`} bg={Colors.amberSoft} fg={Colors.amberDeep} />
                  ) : null}
                  {place.distance_km != null ? (
                    <ChipSoft label={`a ${place.distance_km} km`} bg={Colors.greenSoft} fg={Colors.greenDeep} />
                  ) : (
                    <ChipSoft label={place.zone} bg={Colors.greenSoft} fg={Colors.greenDeep} />
                  )}
                </View>
              </View>
            </View>
            {place.image_url ? null : (
              <Text style={[Type.note, { fontStyle: 'italic' }]}>Ilustración propia de la cocina: este lugar aún no tiene foto autorizada.</Text>
            )}
            <Text style={Type.body}>{place.description || 'Descripción no disponible por ahora.'}</Text>
          </View>

          {place.geo && userCoords ? (
            <View style={styles.mapCard}>
              <OsmMap places={[place]} user={userCoords} radiusKm={1} showRadius={false} />
            </View>
          ) : null}

          <View style={styles.sheet}>
            <View style={styles.dataRow}>
              <View style={styles.dataIcon}><Feather name="map-pin" size={14} color={Colors.violetDeep} /></View>
              <View style={{ flex: 1 }}>
                <Text style={Type.bodyStrong}>Dirección</Text>
                <Text style={Type.body}>{place.id.startsWith('g-') ? place.address : `${place.address}, ${place.city}`}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={{ gap: 10 }}>
              {place.menu_url ? (
                <PrimaryButton title="Ver el menú" icon="book-open" onPress={() => void open(place.menu_url!)} />
              ) : (
                <View style={styles.missing}><Text style={Type.note}>Menú no disponible por ahora.</Text></View>
              )}
              {place.maps_url ? (
                <GhostButton title="Abrir ubicación" icon="navigation" onPress={() => void open(place.maps_url!)} />
              ) : (
                <View style={styles.missing}><Text style={Type.note}>Ubicación en mapas no disponible.</Text></View>
              )}
            </View>
            <Text style={Type.note}>Los precios y horarios son referencia y pueden cambiar.</Text>
          </View>

          <HonestNote>Los precios sin confirmar no se comparan con tu presupuesto hasta que se verifican.</HonestNote>
        </Rise>
      </View>
    </View>
  );
}

function ChipSoft({ label, bg, fg }: { label: string; bg: string; fg: string }) {
  return (
    <View style={[styles.chip, { backgroundColor: bg }]}>
      <Text style={[styles.chipText, { color: fg }]}>{label}</Text>
    </View>
  );
}

async function open(url: string) {
  try {
    await Linking.openURL(url);
  } catch {
    const { Alert } = await import('react-native');
    Alert.alert('No se pudo abrir el enlace');
  }
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.cream },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.m, padding: Spacing.l },
  content: { flex: 1 },
  hero: { height: 320, borderBottomLeftRadius: 34, borderBottomRightRadius: 34, overflow: 'hidden', backgroundColor: Colors.creamDeep },
  heroBar: { position: 'absolute', top: 14, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' },
  circleBtn: { width: 46, height: 46, borderRadius: 999, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', ...Shadow.float },
  heroLabel: { position: 'absolute', bottom: 34, left: 16, backgroundColor: 'rgba(64,31,51,0.55)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  heroLabelText: { fontFamily: FontNames.label, fontSize: 10.5, color: Colors.white },
  sheet: { backgroundColor: Colors.white, borderRadius: Radius.sheet, padding: Spacing.l, gap: 12, ...Shadow.card },
  mapCard: { height: 220, borderRadius: 18, overflow: 'hidden', backgroundColor: Colors.creamDeep },
  name: { fontFamily: FontNames.displayHeavy, fontSize: 28, color: Colors.ink },
  chip: { borderRadius: 999, paddingHorizontal: 11, paddingVertical: 6 },
  chipText: { fontFamily: FontNames.label, fontSize: 12 },
  dataRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  dataIcon: { width: 34, height: 34, borderRadius: 12, backgroundColor: Colors.violetSoft, alignItems: 'center', justifyContent: 'center' },
  divider: { height: 1, backgroundColor: Colors.line },
  missing: { backgroundColor: Colors.cream, borderRadius: 14, padding: 12, alignItems: 'center' },
});
