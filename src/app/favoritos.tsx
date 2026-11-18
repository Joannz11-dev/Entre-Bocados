import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useDemo } from '../state/demo';
import { Colors, FontNames, Radius, Shadow, Spacing, Type } from '../constants/theme';
import { formatPrice, type Restaurant } from '../types/restaurant';
import { CuisineTile } from '../components/kit/cuisine-tile';
import { EmptyState, GhostButton, PrimaryButton, Rise, Screen } from '../components/kit/ui';

export default function Favoritos() {
  const { data, restaurants, loading, error, reload } = useDemo();
  const favorites = restaurants.filter(p => data.favorites.includes(p.id));
  const liked = restaurants.filter(p => data.liked.includes(p.id) && !data.favorites.includes(p.id));

  return (
    <Screen back title="Mis guardados">
      {loading ? (
        <Text style={Type.body}>Cargando guardados…</Text>
      ) : error ? (
        <EmptyState title="No pudimos consultar" body={error} action={<PrimaryButton title="Reintentar" icon="refresh-cw" onPress={() => void reload()} />} />
      ) : (
        <>
          <Rise>
            <SectionLabel icon="heart" tone={Colors.pinkSoft} fg={Colors.pinkDeep} title="Guardados" count={favorites.length} />
            {favorites.length ? (
              favorites.map((p, i) => (
                <Rise key={p.id} delay={60 + i * 50}>
                  <PlaceRow place={p} />
                </Rise>
              ))
            ) : (
              <Text style={[Type.body, { marginTop: -Spacing.s }]}>Aún no guardas nada: en Explorar, desliza una tarjeta hacia arriba o toca el check verde.</Text>
            )}
          </Rise>
          <Rise delay={120}>
            <SectionLabel icon="arrow-up-right" tone={Colors.violetSoft} fg={Colors.violetDeep} title="Te interesan" count={liked.length} />
            {liked.length ? (
              liked.map((p, i) => (
                <Rise key={p.id} delay={60 + i * 50}>
                  <PlaceRow place={p} />
                </Rise>
              ))
            ) : (
              <Text style={[Type.body, { marginTop: -Spacing.s }]}>Desliza a la derecha los lugares que te despierten antojo.</Text>
            )}
          </Rise>
          <Rise delay={200}>
            <GhostButton title="Ir a explorar" icon="compass" onPress={() => router.push('/explore')} />
          </Rise>
        </>
      )}
    </Screen>
  );
}

function SectionLabel({ icon, tone, fg, title, count }: { icon: keyof typeof Feather.glyphMap; tone: string; fg: string; title: string; count: number }) {
  return (
    <View style={styles.sectionLabel}>
      <View style={[styles.sectionIcon, { backgroundColor: tone }]}>
        <Feather name={icon} size={14} color={fg} />
      </View>
      <Text style={Type.heading}>{title}</Text>
      <View style={[styles.countBubble, { backgroundColor: tone }]}>
        <Text style={[styles.countText, { color: fg }]}>{count}</Text>
      </View>
    </View>
  );
}

export function PlaceRow({ place }: { place: Restaurant }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ver detalle de ${place.name}`}
      onPress={() => router.push({ pathname: '/restaurant/[id]', params: { id: place.id } })}
      style={styles.row}
    >
      <CuisineTile cuisine={place.cuisine} width={54} height={54} radius={16} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.rowName} numberOfLines={1}>{place.name}</Text>
        <Text style={Type.note}>{place.cuisine} · {place.distance_km != null ? `a ${place.distance_km} km` : place.zone}</Text>
        <Text style={styles.rowPrice}>{formatPrice(place)}</Text>
      </View>
      <Feather name="chevron-right" size={18} color={Colors.inkSoft} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sectionLabel: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.s, marginTop: Spacing.s },
  sectionIcon: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  countBubble: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 2 },
  countText: { fontFamily: FontNames.label, fontSize: 11.5 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.white, borderRadius: Radius.card, padding: 12, ...Shadow.card, marginBottom: 10 },
  rowName: { fontFamily: FontNames.display, fontSize: 16.5, color: Colors.ink },
  rowPrice: { fontFamily: FontNames.label, fontSize: 12, color: Colors.pinkDeep },
});
