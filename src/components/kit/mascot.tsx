import React from 'react';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import { Colors, FontNames, Shadow } from '../../constants/theme';
import { StyleSheet, Text, View } from 'react-native';

const INK = Colors.ink;
const STROKE = { stroke: INK, strokeWidth: 3.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

export type MascotPose = 'wave' | 'heart';

/**
 * Mascota propia de la marca: niño chef kawaii, dibujada a mano en vector
 * para que sea nítida a cualquier tamaño (sin raster generado, sin emoji).
 * Los brazos son cápsulas delineadas: trazo grueso de tinta debajo,
 * trazo blanco encima sobre el mismo trazado.
 */
export function Mascot({ size = 160, pose = 'wave' }: { size?: number; pose?: MascotPose }) {
  const rightArm = pose === 'heart' ? 'M64 152 Q50 168 70 178' : 'M64 152 Q42 142 36 122';
  const leftArm = pose === 'heart' ? 'M136 152 Q150 168 130 178' : 'M136 152 Q152 162 148 174';
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200" pointerEvents="none">
      {/* cuchara levantada (solo en pose wave) */}
      {pose === 'wave' && (
        <G>
          <Rect x="25" y="76" width="13" height="50" rx="6.5" fill="#D9995B" {...STROKE} transform="rotate(-26 31 100)" />
          <Ellipse cx="21" cy="70" rx="13.5" ry="17.5" fill="#E8AF74" {...STROKE} transform="rotate(-26 21 70)" />
          <Ellipse cx="19" cy="66" rx="6" ry="9" fill="#F2C896" transform="rotate(-26 19 66)" />
        </G>
      )}

      {/* piernas / zapatos */}
      <Ellipse cx="82" cy="188" rx="12" ry="7" fill={INK} />
      <Ellipse cx="120" cy="188" rx="12" ry="7" fill={INK} />

      {/* brazo izquierdo (cápsula delineada) */}
      <Path d={leftArm} fill="none" stroke={INK} strokeWidth={16} strokeLinecap="round" />
      <Path d={leftArm} fill="none" stroke="#FFFFFF" strokeWidth={9} strokeLinecap="round" />

      {/* chaqueta de chef */}
      <Path d="M62 144 Q100 128 138 144 L146 184 Q100 200 54 184 Z" fill="#FFFFFF" {...STROKE} />
      {/* doblez central y botón */}
      <Path d="M100 134 L100 162" fill="none" {...STROKE} strokeWidth={2.5} />
      <Circle cx="100" cy="172" r="4.5" fill={Colors.pink} stroke={INK} strokeWidth={2} />

      {/* parche de corazón en el pecho */}
      <Heart cx={pose === 'heart' ? 100 : 118} cy={pose === 'heart' ? 170 : 164} s={pose === 'heart' ? 22 : 14} stroke={INK} strokeWidth={2.5} />

      {/* brazo derecho (cápsula delineada) */}
      <Path d={rightArm} fill="none" stroke={INK} strokeWidth={16} strokeLinecap="round" />
      <Path d={rightArm} fill="none" stroke="#FFFFFF" strokeWidth={9} strokeLinecap="round" />
      {/* mano sobre el fin del brazo */}
      <Circle cx={pose === 'heart' ? 70 : 36} cy={pose === 'heart' ? 178 : 122} r={8.5} fill="#FFE0C7" {...STROKE} strokeWidth={3} />
      {pose === 'heart' && <Circle cx={130} cy={178} r={8.5} fill="#FFE0C7" {...STROKE} strokeWidth={3} />}

      {/* orejas */}
      <Circle cx="49" cy="94" r="9" fill="#FFE0C7" {...STROKE} strokeWidth={3} />
      <Circle cx="151" cy="94" r="9" fill="#FFE0C7" {...STROKE} strokeWidth={3} />

      {/* cabeza */}
      <Circle cx="100" cy="88" r="52" fill="#FFE0C7" {...STROKE} />

      {/* cabello asomando bajo el gorro */}
      <Path d="M52 74 Q56 50 76 44 Q84 56 100 54 Q116 56 124 44 Q144 50 148 74 Q124 60 100 60 Q76 60 52 74 Z" fill="#5C3A2E" />

      {/* gorro de chef: copa esponjosa + banda */}
      <Path d="M52 46 Q47 39 52 32 Q60 24 70 30 Q73 15 88 13 Q100 5 112 13 Q127 15 130 30 Q140 24 148 32 Q153 39 148 46 Q124 56 100 56 Q76 56 52 46 Z" fill="#FFFFFF" {...STROKE} />
      <Path d="M53 50 Q100 66 147 50 L147 42 Q100 58 53 42 Z" fill="#FFFFFF" {...STROKE} strokeWidth={3} />

      {pose === 'heart' ? (
        <G>
          {/* ojos felices cerrados */}
          <Path d="M73 92 Q80 83 87 92" fill="none" {...STROKE} strokeWidth={4} />
          <Path d="M113 92 Q120 83 127 92" fill="none" {...STROKE} strokeWidth={4} />
        </G>
      ) : (
        <G>
          <Ellipse cx="80" cy="92" rx="6.5" ry="9" fill={INK} />
          <Ellipse cx="120" cy="92" rx="6.5" ry="9" fill={INK} />
          <Circle cx="82.5" cy="88.5" r="2.2" fill="#FFFFFF" />
          <Circle cx="122.5" cy="88.5" r="2.2" fill="#FFFFFF" />
          {/* cejas */}
          <Path d="M73 78 Q80 74 87 77" fill="none" {...STROKE} strokeWidth={3} />
          <Path d="M113 77 Q120 74 127 78" fill="none" {...STROKE} strokeWidth={3} />
        </G>
      )}

      {/* sonrojo */}
      <Ellipse cx="66" cy="108" rx="8" ry="5" fill={Colors.pink} opacity={0.5} />
      <Ellipse cx="134" cy="108" rx="8" ry="5" fill={Colors.pink} opacity={0.5} />

      {/* boca abierta feliz */}
      <Path d="M86 112 Q100 134 114 112 Q100 119 86 112 Z" fill="#5A2438" {...STROKE} strokeWidth={3} />
      <Ellipse cx="100" cy="123" rx="7.5" ry="4" fill={Colors.pink} />

      {pose === 'heart' && (
        <G>
          <Heart cx={162} cy={54} s={12} fill={Colors.violet} />
          <Heart cx={42} cy={50} s={10} fill={Colors.orange} />
        </G>
      )}
    </Svg>
  );
}

export function Heart({ cx, cy, s, fill = Colors.pink, stroke = 'none', strokeWidth = 0 }: { cx: number; cy: number; s: number; fill?: string; stroke?: string; strokeWidth?: number }) {
  const w = s / 2;
  return (
    <Path
      d={`M${cx} ${cy + w * 0.62} C ${cx - w * 1.4} ${cy - w * 0.2}, ${cx - w * 0.7} ${cy - w * 1.15}, ${cx} ${cy - w * 0.35} C ${cx + w * 0.7} ${cy - w * 1.15}, ${cx + w * 1.4} ${cy - w * 0.2}, ${cx} ${cy + w * 0.62} Z`}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
  );
}

/** Destello de 4 puntas para acentos del logo. */
export function Sparkle({ size = 16, color = Colors.orange, style }: { size?: number; color?: string; style?: object }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={style} pointerEvents="none">
      <Path d="M12 2 Q13.5 9 22 12 Q13.5 15 12 22 Q10.5 15 2 12 Q10.5 9 12 2 Z" fill={color} />
    </Svg>
  );
}

/** Lockup de marca: mascota + nombre con destellos. */
export function Logo({ mascotSize = 84, titleSize = 40, showMascot = true }: { mascotSize?: number; titleSize?: number; showMascot?: boolean }) {
  return (
    <View style={styles.logoRow}>
      {showMascot && (
        <View style={styles.logoMascot}>
          <Mascot size={mascotSize} />
        </View>
      )}
      <View style={{ gap: 0 }}>
        <View style={styles.logoTextRow}>
          <Text style={{ fontFamily: FontNames.displayHeavy, fontSize: titleSize, color: Colors.violet, lineHeight: titleSize + 6 }}>Entre</Text>
          <Sparkle size={titleSize * 0.32} color={Colors.orange} style={styles.sparkA} />
        </View>
        <View style={styles.logoTextRow}>
          <Text style={{ fontFamily: FontNames.displayHeavy, fontSize: titleSize, color: Colors.pink, lineHeight: titleSize + 6 }}>Bocados</Text>
          <Sparkle size={titleSize * 0.26} color={Colors.violet} style={styles.sparkB} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoMascot: { ...Shadow.card },
  logoTextRow: { flexDirection: 'row', alignItems: 'flex-start' },
  sparkA: { marginLeft: 4, marginTop: -2 },
  sparkB: { marginLeft: 6, marginTop: 4 },
});
