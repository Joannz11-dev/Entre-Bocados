import { Platform } from 'react-native';
import '@/global.css';

/**
 * Mundo visual "Feria jugosa" — el mockup aprobado es la fuente.
 * Colores, radios, sombras y escala tipográfica del sistema completo.
 */
export const Colors = {
  /** Fondo crema cálido de toda la app. */
  cream: '#FFF3E9',
  /** Crema un punto más profundo para superficies hundidas. */
  creamDeep: '#FCE4D2',
  white: '#FFFFFF',
  /** Tinta principal (ciruela profunda). */
  ink: '#401F33',
  /** Tinta secundaria: cumple AA (≥4.5:1) sobre crema y blanco. */
  inkSoft: '#7A5566',
  /** Tinta sobre superficies de color (rosa/violeta llenos). */
  onColor: '#FFFFFF',
  pink: '#F43F6D',
  pinkFill: '#E0245A',
  pinkDeep: '#B81B44',
  pinkSoft: '#FFE1EA',
  violet: '#7C4DFF',
  violetDeep: '#6A38F0',
  violetSoft: '#EDE7FF',
  orange: '#FF8A3D',
  orangeDeep: '#A84B05',
  orangeSoft: '#FFE7D1',
  green: '#17A55C',
  greenDeep: '#0E7A43',
  greenSoft: '#DCF6E7',
  amber: '#FFC531',
  amberDeep: '#8A6205',
  amberSoft: '#FFF2D2',
  /** Borde suave sobre blanco/crema. */
  line: '#F3D9C8',
} as const;

export type Palette = typeof Colors;

/** Radio del sistema: sobrio y consistente con las esquinas nativas de Android. */
export const Radius = {
  chip: 999,
  input: 12,
  card: 14,
  sheet: 18,
} as const;

/** Elevación discreta: sombras suaves, no nubes de pastelería. */
export const Shadow = {
  card: Platform.select({
    ios: { shadowColor: '#401F33', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 3 }, shadowRadius: 10 },
    android: { elevation: 2 },
    web: { shadowColor: '#401F33', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 3 }, shadowRadius: 10 },
  }),
  float: Platform.select({
    ios: { shadowColor: '#401F33', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 4 }, shadowRadius: 12 },
    android: { elevation: 3 },
    web: { shadowColor: '#401F33', shadowOpacity: 0.10, shadowOffset: { width: 0, height: 4 }, shadowRadius: 12 },
  }),
} as const;

/** Nombres de fuente cargados con expo-font (@expo-google-fonts). */
export const FontNames = {
  display: 'Baloo2_700Bold',
  displayHeavy: 'Baloo2_800ExtraBold',
  displayMid: 'Baloo2_600SemiBold',
  body: 'Nunito_600SemiBold',
  bodyBold: 'Nunito_800ExtraBold',
  label: 'Nunito_800ExtraBold',
} as const;

/** Escala tipográfica Material-friendly en unidades relativas al sistema. */
export const Type = {
  display: { fontFamily: FontNames.displayHeavy, fontSize: 34, lineHeight: 40, color: Colors.ink },
  title: { fontFamily: FontNames.display, fontSize: 24, lineHeight: 30, color: Colors.ink },
  heading: { fontFamily: FontNames.display, fontSize: 18, lineHeight: 24, color: Colors.ink },
  body: { fontFamily: FontNames.body, fontSize: 15, lineHeight: 23, color: Colors.inkSoft },
  bodyStrong: { fontFamily: FontNames.bodyBold, fontSize: 15, lineHeight: 23, color: Colors.ink },
  label: { fontFamily: FontNames.label, fontSize: 13, lineHeight: 18, color: Colors.ink, letterSpacing: 0.4 },
  note: { fontFamily: FontNames.body, fontSize: 13, lineHeight: 19, color: Colors.inkSoft },
  micro: { fontFamily: FontNames.label, fontSize: 11, lineHeight: 15, color: Colors.inkSoft, letterSpacing: 0.6 },
} as const;

export const Spacing = { xs: 4, s: 8, m: 16, l: 24, xl: 32 } as const;

export const BottomTabInset = 96;
export const MaxContentWidth = 560;
