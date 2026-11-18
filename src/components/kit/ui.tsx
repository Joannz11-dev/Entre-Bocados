import React, { useEffect } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, ViewStyle, StyleProp } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { goBackOrHome } from '../../lib/nav';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring, withTiming, Easing } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { Colors, FontNames, Radius, Shadow, Spacing, Type, MaxContentWidth, BottomTabInset } from '../../constants/theme';
import { Mascot, type MascotPose } from './mascot';

/* ---------- motion helpers ---------- */

const SPRING = { damping: 16, stiffness: 260, mass: 0.7 } as const;

/** Entrada escalonada del contenido de una pantalla. */
export function Rise({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(420).easing(Easing.out(Easing.cubic))} style={style}>
      {children}
    </Animated.View>
  );
}

/** Squish táctil universal para cualquier control. */
export function useSquish() {
  const scale = useSharedValue(1);
  const handlers = {
    onPressIn: () => {
      scale.value = withSpring(0.94, { damping: 100, stiffness: 500 });
    },
    onPressOut: () => {
      scale.value = withSpring(1, SPRING);
    },
  };
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return { handlers, style };
}

/* ---------- decorative field ---------- */

type Blob = { c: string; s: number; o: number; top?: number | `${number}%`; bottom?: number; left?: number | `${number}%`; right?: number; };

const BLOB_SETS: Blob[][] = [
  [
    { c: Colors.pinkSoft, top: -90, left: -70, s: 240, o: 0.9 },
    { c: Colors.violetSoft, bottom: -110, right: -80, s: 280, o: 0.9 },
    { c: Colors.orangeSoft, top: '38%', right: -90, s: 190, o: 0.8 },
  ],
  [
    { c: Colors.violetSoft, top: -80, right: -90, s: 250, o: 0.9 },
    { c: Colors.orangeSoft, bottom: -120, left: -70, s: 260, o: 0.9 },
    { c: Colors.pinkSoft, top: '42%', left: -110, s: 200, o: 0.8 },
  ],
  [
    { c: Colors.orangeSoft, top: -70, left: -60, s: 230, o: 0.9 },
    { c: Colors.pinkSoft, bottom: -120, right: -100, s: 300, o: 0.9 },
    { c: Colors.violetSoft, top: '55%', right: -60, s: 150, o: 0.8 },
  ],
];

/** Blobs pastel de esquina: el suelo crema de la marca nunca es plano. */
export function BlobField({ tint = 0 }: { tint?: 0 | 1 | 2 }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {BLOB_SETS[tint].map((b, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            top: b.top,
            bottom: b.bottom,
            left: b.left,
            right: b.right,
            width: b.s,
            height: b.s,
            borderRadius: b.s,
            backgroundColor: b.c,
            opacity: b.o,
          }}
        />
      ))}
    </View>
  );
}

/* ---------- screens ---------- */

/** Espacio para la barra superior del sistema (batería, reloj, notificaciones). */
export function TopInset() {
  const { top } = useSafeAreaInsets();
  return <View style={{ height: Math.max(top, 12) }} pointerEvents="none" />;
}

export function Screen({
  children,
  scroll = true,
  back = false,
  title,
  pad = true,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  back?: boolean;
  title?: string;
  pad?: boolean;
}) {
  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        {(back || title) && (
          <View style={styles.topBar}>
            {back && (
              <Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={() => goBackOrHome('/explore')} style={styles.backBtn}>
                <Feather name="arrow-left" size={22} color={Colors.ink} />
              </Pressable>
            )}
            {title ? <Text style={[Type.heading, { flexShrink: 1 }]} numberOfLines={1}>{title}</Text> : <View style={{ flex: 1 }} />}
          </View>
        )}
        {scroll ? (
          <ScrollView
            contentContainerStyle={[styles.content, pad && styles.contentPad, { maxWidth: MaxContentWidth, alignSelf: 'center', width: '100%' }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.body, pad && styles.contentPad, { maxWidth: MaxContentWidth, alignSelf: 'center', width: '100%' }]}>{children}</View>
        )}
      </SafeAreaView>
    </View>
  );
}

/* ---------- buttons ---------- */

type BtnProps = {
  title: string;
  onPress: () => void;
  icon?: keyof typeof Feather.glyphMap;
  disabled?: boolean;
  small?: boolean;
};

export function PrimaryButton({ title, onPress, icon, disabled, small }: BtnProps) {
  const { handlers, style } = useSquish();
  return (
    <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} {...handlers}>
      <Animated.View
        style={[
          styles.btnBase,
          styles.btnPrimary,
          small && styles.btnSmall,
          disabled && { opacity: 0.45 },
          style,
        ]}
      >
        {icon ? <Feather name={icon} size={small ? 17 : 20} color={Colors.white} /> : null}
        <Text style={[styles.btnText, small && styles.btnTextSmall]}>{title}</Text>
      </Animated.View>
    </Pressable>
  );
}

export function VioletButton({ title, onPress, icon, disabled, small }: BtnProps) {
  const { handlers, style } = useSquish();
  return (
    <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} {...handlers}>
      <Animated.View style={[styles.btnBase, styles.btnViolet, small && styles.btnSmall, disabled && { opacity: 0.45 }, style]}>
        {icon ? <Feather name={icon} size={small ? 17 : 20} color={Colors.white} /> : null}
        <Text style={[styles.btnText, small && styles.btnTextSmall]}>{title}</Text>
      </Animated.View>
    </Pressable>
  );
}

export function OrangeButton({ title, onPress, icon, disabled, small }: BtnProps) {
  const { handlers, style } = useSquish();
  return (
    <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} {...handlers}>
      <Animated.View style={[styles.btnBase, styles.btnOrange, small && styles.btnSmall, disabled && { opacity: 0.45 }, style]}>
        {icon ? <Feather name={icon} size={small ? 17 : 20} color={Colors.white} /> : null}
        <Text style={[styles.btnText, small && styles.btnTextSmall]}>{title}</Text>
      </Animated.View>
    </Pressable>
  );
}

export function GhostButton({ title, onPress, icon, disabled, small }: BtnProps) {
  const { handlers, style } = useSquish();
  return (
    <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} {...handlers}>
      <Animated.View style={[styles.btnBase, styles.btnGhost, small && styles.btnSmall, disabled && { opacity: 0.45 }, style]}>
        {icon ? <Feather name={icon} size={small ? 17 : 20} color={Colors.violet} /> : null}
        <Text style={[styles.btnText, styles.btnGhostText, small && styles.btnTextSmall]}>{title}</Text>
      </Animated.View>
    </Pressable>
  );
}

export function TextButton({ title, onPress, color = Colors.violet }: { title: string; onPress: () => void; color?: string }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} hitSlop={8} style={styles.textBtn}>
      <Text style={[Type.bodyStrong, { color, textDecorationLine: 'underline' }]}>{title}</Text>
    </Pressable>
  );
}

/* ---------- chips & pills ---------- */

export type ChipTone = 'pink' | 'violet' | 'green' | 'orange' | 'amber' | 'neutral';

const TONES: Record<ChipTone, { bg: string; fg: string; filledBg: string }> = {
  pink: { bg: Colors.pinkSoft, fg: Colors.pinkDeep, filledBg: Colors.pinkDeep },
  violet: { bg: Colors.violetSoft, fg: Colors.violetDeep, filledBg: Colors.violet },
  green: { bg: Colors.greenSoft, fg: Colors.greenDeep, filledBg: Colors.greenDeep },
  orange: { bg: Colors.orangeSoft, fg: Colors.orangeDeep, filledBg: Colors.orangeDeep },
  amber: { bg: Colors.amberSoft, fg: Colors.amberDeep, filledBg: Colors.amberDeep },
  neutral: { bg: Colors.creamDeep, fg: Colors.inkSoft, filledBg: Colors.ink },
};

export function Chip({
  label,
  icon,
  tone = 'violet',
  selected = false,
  onPress,
}: {
  label: string;
  icon?: keyof typeof Feather.glyphMap;
  tone?: ChipTone;
  selected?: boolean;
  onPress?: () => void;
}) {
  const t = TONES[tone];
  const { handlers, style } = useSquish();
  const bg = selected ? t.filledBg : t.bg;
  const fg = selected ? Colors.white : t.fg;
  return (
    <Pressable accessibilityRole={onPress ? 'button' : undefined} accessibilityState={onPress ? { selected } : undefined} onPress={onPress} disabled={!onPress} hitSlop={6} {...handlers}>
      <Animated.View style={[styles.chip, { backgroundColor: bg }, style]}>
        {icon ? <Feather name={icon} size={13} color={fg} /> : null}
        <Text style={[styles.chipText, { color: fg }]}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

/** Fila de chips con desplazamiento horizontal. */
export function ChipRow({ children }: { children: React.ReactNode }) {
  return <View style={styles.chipRow}>{children}</View>;
}

/* ---------- cards ---------- */

export function Card({ children, style, tint }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; tint?: ChipTone }) {
  return (
    <View
      style={[
        styles.card,
        tint && { backgroundColor: TONES[tint].bg, shadowOpacity: 0.08 },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={Type.heading}>{title}</Text>
      {action && onAction && (
        <Pressable accessibilityRole="button" onPress={onAction} hitSlop={8}>
          <Text style={[Type.bodyStrong, { color: Colors.pink }]}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}

/* ---------- segmented control ---------- */

export function Segmented({ options, value, onChange }: { options: { key: string; label: string }[]; value: string; onChange: (key: string) => void }) {
  const index = Math.max(0, options.findIndex(o => o.key === value));
  const count = options.length;
  const pos = useSharedValue(index);
  useEffect(() => {
    pos.value = withTiming(index, { duration: 260, easing: Easing.out(Easing.cubic) });
  }, [index, pos]);
  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: `${pos.value * 100}%` } as never],
  }));
  return (
    <View style={[styles.segTrack, { flexDirection: 'row' }]}>
      <Animated.View style={[styles.segPill, { width: `${100 / count}%` }, pillStyle]} />
      {options.map(o => (
        <Pressable key={o.key} accessibilityRole="button" accessibilityState={{ selected: o.key === value }} onPress={() => onChange(o.key)} style={styles.segOption}>
          <Text style={[Type.bodyStrong, { color: o.key === value ? Colors.pink : Colors.inkSoft }]}>{o.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

/* ---------- fields ---------- */

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={Type.label}>{label}</Text>
      {children}
      {hint ? <Text style={Type.note}>{hint}</Text> : null}
    </View>
  );
}

export function Input(props: React.ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      placeholderTextColor={Colors.inkSoft}
      {...props}
      style={[styles.input, props.style]}
    />
  );
}

/** Input de contraseña con alternancia de visibilidad (ojo). */
export function PasswordInput(props: Omit<React.ComponentProps<typeof TextInput>, 'secureTextEntry'>) {
  const [visible, setVisible] = React.useState(false);
  return (
    <View>
      <Input
        {...props}
        secureTextEntry={!visible}
        autoCapitalize="none"
        style={[{ paddingRight: 46 }, props.style]}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        onPress={() => setVisible(v => !v)}
        hitSlop={10}
        style={{ position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center' }}
      >
        <Feather name={visible ? 'eye-off' : 'eye'} size={20} color={Colors.inkSoft} />
      </Pressable>
    </View>
  );
}

/* ---------- empty & honest states ---------- */

export function EmptyState({ title, body, action, pose = 'wave', mascotSize = 150 }: { title: string; body: string; action?: React.ReactNode; pose?: MascotPose; mascotSize?: number }) {
  return (
    <Card style={styles.emptyCard}>
      <View style={{ height: mascotSize * 0.66, width: mascotSize, overflow: 'hidden', alignSelf: 'center', alignItems: 'center' }}>
        <View style={{ width: mascotSize, height: mascotSize, alignItems: 'center', justifyContent: 'flex-end' }}>
          <Mascot size={mascotSize} pose={pose} />
        </View>
      </View>
      <View style={{ gap: 4, alignItems: 'center' }}>
        <Text style={Type.heading}>{title}</Text>
        <Text style={[Type.body, { textAlign: 'center' }]}>{body}</Text>
      </View>
      {action}
    </Card>
  );
}

/** Nota de honestidad demo: breve, cálida y siempre presente donde toca. */
export function HonestNote({ children, tone = 'cream' }: { children: React.ReactNode; tone?: 'cream' | 'violet' }) {
  return (
    <View style={[styles.honest, tone === 'violet' && { backgroundColor: Colors.violetSoft }]}>
      <Feather name="info" size={13} color={tone === 'violet' ? Colors.violetDeep : Colors.inkSoft} style={{ marginTop: 2 }} />
      <Text style={[Type.note, { flex: 1 }]}>{children}</Text>
    </View>
  );
}

/* ---------- feedback pill ---------- */

export function FeedbackPill({ message }: { message: string | null }) {
  const visible = useSharedValue(0);
  useEffect(() => {
    visible.value = withTiming(message ? 1 : 0, { duration: 220 });
  }, [message, visible]);
  const style = useAnimatedStyle(() => ({
    opacity: visible.value,
    transform: [{ translateY: (1 - visible.value) * 18 }],
  }));
  if (!message) return null;
  return (
    <Animated.View pointerEvents="none" style={[styles.feedback, style]}>
      <Text numberOfLines={1} style={[Type.bodyStrong, { color: Colors.white }]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.cream },
  safe: { flex: 1 },
  body: { flex: 1 },
  content: { gap: Spacing.m, paddingBottom: BottomPad(), flexGrow: 1 },
  contentPad: { paddingHorizontal: Spacing.l, paddingTop: Spacing.m },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: Spacing.s, paddingHorizontal: Spacing.l, paddingTop: Spacing.xs, minHeight: 48 },
  backBtn: { width: 44, height: 44, borderRadius: 999, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', ...Shadow.card },
  btnBase: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 54,
    paddingHorizontal: 24,
    borderRadius: 999,
  },
  btnSmall: { minHeight: 46, paddingHorizontal: 18 },
  btnPrimary: { backgroundColor: Colors.pinkFill, ...Shadow.card },
  btnViolet: { backgroundColor: Colors.violet, ...Shadow.card },
  btnOrange: { backgroundColor: Colors.orangeDeep, ...Shadow.card },
  btnGhost: { backgroundColor: Colors.white, borderWidth: 2, borderColor: Colors.violetSoft, ...Shadow.card },
  btnText: { color: Colors.white, fontFamily: FontNames.label, fontSize: 16 },
  btnTextSmall: { fontSize: 14.5 },
  btnGhostText: { color: Colors.violetDeep },
  textBtn: { paddingVertical: 6, alignSelf: 'center' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, minHeight: 40, paddingHorizontal: 14, borderRadius: Radius.chip },
  chipText: { fontFamily: FontNames.label, fontSize: 13 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    padding: Spacing.m,
    gap: 8,
    ...Shadow.card,
  },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.s },
  segTrack: { backgroundColor: Colors.white, borderRadius: 999, padding: 5, ...Shadow.card, overflow: 'hidden' },
  segPill: { position: 'absolute', top: 5, bottom: 5, left: 5, backgroundColor: Colors.pinkSoft, borderRadius: 999 },
  segOption: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  input: {
    backgroundColor: Colors.white,
    borderRadius: Radius.input,
    borderWidth: 2,
    borderColor: Colors.line,
    paddingHorizontal: 16,
    minHeight: 52,
    color: Colors.ink,
    fontFamily: FontNames.body,
    fontSize: 15,
  },
  emptyCard: { alignItems: 'center', gap: Spacing.s, paddingVertical: Spacing.l },
  honest: { flexDirection: 'row', gap: 8, backgroundColor: Colors.creamDeep, borderRadius: Radius.input, padding: 12, alignItems: 'flex-start' },
  feedback: {
    position: 'absolute',
    bottom: 120,
    alignSelf: 'center',
    backgroundColor: Colors.ink,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 999,
    maxWidth: '88%',
    ...Shadow.float,
  },
});

function BottomPad() {
  return Platform.OS === 'web' ? 104 : BottomTabInset;
}
