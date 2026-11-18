import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TabListProps, TabTrigger, TabTriggerSlotProps } from 'expo-router/ui';
import type { Href } from 'expo-router';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { Colors, FontNames } from '../../constants/theme';
import { haptic } from '../../lib/haptics';

type Stop = { name: string; href: Href; label: string; icon: keyof typeof Feather.glyphMap };

export const TAB_STOPS: Stop[] = [
  { name: 'explore', href: '/explore', label: 'Explorar', icon: 'compass' },
  { name: 'connect', href: '/connect', label: 'Conectar', icon: 'users' },
  { name: 'plans', href: '/plans', label: 'Planes', icon: 'calendar' },
  { name: 'profile', href: '/profile', label: 'Perfil', icon: 'smile' },
];

/**
 * Barra de navegación inferior nativa (Material): superficie sólida a todo lo
 * ancho, íconos con etiqueta y tinte de marca en el destino activo.
 */
export function JuicyTabList(props: TabListProps) {
  return (
    <SafeAreaView edges={['bottom']} style={styles.safe} pointerEvents="box-none">
      <View style={styles.bar} {...props} />
    </SafeAreaView>
  );
}

export function JuicyTabTriggers() {
  return (
    <>
      {TAB_STOPS.map(stop => (
        <TabTrigger key={stop.name} name={stop.name} href={stop.href} asChild>
          <TabButton stop={stop} />
        </TabTrigger>
      ))}
    </>
  );
}

export function TabButton({ stop, ...props }: TabTriggerSlotProps & { stop: Stop }) {
  const focused = props.isFocused ?? false;
  const focus = useSharedValue(focused ? 1 : 0);
  useEffect(() => {
    focus.value = withTiming(focused ? 1 : 0, { duration: 160 });
  }, [focused, focus]);

  const bubbleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(1 + focus.value * 0.12, { damping: 12, stiffness: 240 }) }],
  }));

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={stop.label}
      onPress={() => haptic.light()}
      {...props}
      style={styles.trigger}
    >
      <Animated.View style={bubbleStyle}>
        <View style={[styles.bubblePill, focused && { backgroundColor: Colors.pinkSoft }]}>
          <Feather name={stop.icon} size={22} color={focused ? Colors.pinkDeep : Colors.inkSoft} />
        </View>
      </Animated.View>
      <Text style={[styles.label, focused && { color: Colors.pinkDeep }]}>{stop.label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  bar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.line,
    paddingVertical: 6,
    paddingHorizontal: 4,
    elevation: 8,
  },
  trigger: { flex: 1, alignItems: 'center', gap: 2, minHeight: 56, justifyContent: 'center', borderRadius: 12 },
  bubblePill: { width: 46, height: 27, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  label: { fontFamily: FontNames.label, fontSize: 10.5, color: Colors.inkSoft },
});
