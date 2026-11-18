import React from 'react';
import Svg, { Circle, Defs, G, Path, Rect, LinearGradient, Stop } from 'react-native-svg';
import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { FontNames } from '../../constants/theme';

/**
 * Mosaico de cocina: ilustración vectorial propia y honesta para
 * restaurantes del catálogo sin fotografía autorizada (image_url vacío).
 * Nada de fotos fingidas: cada cocina tiene su mundo de color y su plato.
 */
export const CUISINE_ART: Record<string, { from: string; to: string; icon: keyof typeof Feather.glyphMap }> = {
  Italiana: { from: '#FF8A5C', to: '#F43F6D', icon: 'coffee' },
  Asiática: { from: '#FF6FA5', to: '#7C4DFF', icon: 'heart' },
  Colombiana: { from: '#FFB13D', to: '#FF7A3D', icon: 'sun' },
  Carnes: { from: '#FF7A5C', to: '#E0552B', icon: 'zap' },
  'Comida rápida': { from: '#FFC531', to: '#FF8A3D', icon: 'zap' },
  Postres: { from: '#FF9EC2', to: '#F43F6D', icon: 'gift' },
  Mar: { from: '#5CC9FF', to: '#3D8BFF', icon: 'anchor' },
  Saludable: { from: '#5FE0A8', to: '#17A55C', icon: 'wind' },
  Café: { from: '#C98A4B', to: '#7A4A21', icon: 'coffee' },
};

const DEFAULT_ART = { from: '#FF9EC2', to: '#7C4DFF', icon: 'coffee' as const };

export function CuisineTile({
  cuisine,
  width,
  height,
  radius = 20,
  name,
  fill = false,
  iconSize,
}: {
  cuisine: string;
  width?: number;
  height?: number;
  radius?: number;
  name?: string;
  /** fill: ocupa el 100% del contenedor recortando el dibujo. */
  fill?: boolean;
  iconSize?: number;
}) {
  const art = CUISINE_ART[cuisine] ?? DEFAULT_ART;
  const uid = React.useId().replace(/:/g, '');
  const grad = `grad-${uid}`;

  // Dibujo en coordenadas 0..100 escalado por preserveAspectRatio slice.
  const drawing = (w: number, h: number, slice: boolean) => (
    <>
      <Defs>
        <LinearGradient id={grad} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={art.from} />
          <Stop offset="1" stopColor={art.to} />
        </LinearGradient>
      </Defs>
      <Rect width={w} height={h} fill={`url(#${grad})`} />
      <G opacity={0.16} fill="#FFFFFF">
        {Array.from({ length: 4 }).map((_, r) =>
          Array.from({ length: 5 }).map((_, c) => (
            <Circle key={`${r}-${c}`} cx={(c * w) / 5 + (r % 2 ? w / 10 : 0)} cy={(r * h) / 4 + h / 10} r={w * 0.012 + 1.4} />
          )),
        )}
      </G>
      {/* plato con borde */}
      <Circle cx={w / 2} cy={h * 0.44} r={Math.min(w, h) * 0.27} fill="#FFFFFF" opacity={0.96} />
      <Circle cx={w / 2} cy={h * 0.44} r={Math.min(w, h) * 0.19} fill="none" stroke={art.to} strokeWidth={2.5} opacity={0.3} />
      {/* cubiertos */}
      <G stroke="#FFFFFF" strokeWidth={4.5} strokeLinecap="round" opacity={0.85}>
        <Path d={`M${w * 0.14} ${h * 0.28} L ${w * 0.14} ${h * 0.6}`} />
        <Path d={`M${w * 0.86} ${h * 0.28} L ${w * 0.86} ${h * 0.6}`} />
      </G>
      {slice ? null : null}
    </>
  );

  return (
    <View style={fill ? { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: radius, overflow: 'hidden' } : { width, height, borderRadius: radius, overflow: 'hidden' }}>
      <Svg width={fill ? '100%' : width} height={fill ? '100%' : height} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        {drawing(100, 100, fill)}
      </Svg>
      <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', paddingBottom: fill ? 46 : (height ?? 40) * 0.3 }]}>
        <Feather name={art.icon} size={iconSize ?? (fill ? 30 : Math.min(width ?? 40, height ?? 40) * 0.18)} color={art.to} />
        {(fill || (width ?? 0) >= 90) && <Text style={[styles.tileCuisine, { color: art.to }]}>{cuisine}</Text>}
      </View>
      {name ? (
        <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'flex-end', padding: 12 }]}>
          <Text numberOfLines={1} style={styles.tileName}>
            {name}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tileName: {
    color: '#FFFFFF',
    fontFamily: FontNames.label,
    fontSize: 13,
    textShadowColor: 'rgba(64,31,51,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  tileCuisine: {
    fontFamily: FontNames.label,
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginTop: 3,
  },
});
