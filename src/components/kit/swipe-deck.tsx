/* eslint-disable react-hooks/immutability -- las SharedValues de Reanimated son mutables por diseño; la regla no las modela */
import React, { type MutableRefObject, useEffect } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { FontNames, Colors } from '../../constants/theme';
import { haptic } from '../../lib/haptics';

export type SwipeAction = 'pass' | 'like' | 'favorite';
export type Stamp = { label: string; color: string; bg: string };
export type DeckTriggers = { like: Stamp; pass: Stamp; favorite: Stamp };

/**
 * Baraja de swipe con física jugosa: rotación con el gesto, sellos
 * ME INTERESA / NOPE / FAVORITO que suben con el arrastre, muelle de
 * retorno y salida con tiro. La carta superior expone su `commit` por
 * `triggerRef`, así los botones y las acciones de accesibilidad disparan
 * exactamente el mismo gesto que la mano.
 */
export function SwipeDeck<T extends { id: string }>({
  items,
  renderItem,
  accessibilityLabel,
  onCommit,
  onOpen,
  triggerRef,
  stamps = {
    like: { label: 'ME INTERESA', color: Colors.pink, bg: Colors.white },
    pass: { label: 'NOPE', color: Colors.violetDeep, bg: Colors.white },
    favorite: { label: 'FAVORITO', color: Colors.amberDeep, bg: Colors.white },
  },
  peek = 2,
}: {
  items: T[];
  renderItem: (item: T, isTop: boolean) => React.ReactNode;
  accessibilityLabel: (item: T) => string;
  onCommit: (action: SwipeAction, item: T) => void;
  onOpen?: (item: T) => void;
  triggerRef?: MutableRefObject<((action: SwipeAction) => void) | null>;
  stamps?: DeckTriggers;
  peek?: number;
}) {
  const list = items.slice(0, Math.max(1, peek + 1));
  return (
    <View style={styles.deck}>
      {list
        .map((item, index) => ({ item, index }))
        .reverse()
        .map(({ item, index }) => (
          <DeckCard
            key={item.id}
            item={item}
            isTop={index === 0}
            depth={index}
            renderItem={renderItem}
            accessibilityLabel={accessibilityLabel}
            onCommit={onCommit}
            onOpen={onOpen}
            triggerRef={triggerRef}
            stamps={stamps}
          />
        ))}
    </View>
  );
}

function DeckCard<T extends { id: string }>({
  item,
  isTop,
  depth,
  renderItem,
  accessibilityLabel,
  onCommit,
  onOpen,
  triggerRef,
  stamps,
}: {
  item: T;
  isTop: boolean;
  depth: number;
  renderItem: (item: T, isTop: boolean) => React.ReactNode;
  accessibilityLabel: (item: T) => string;
  onCommit: (action: SwipeAction, item: T) => void;
  onOpen?: (item: T) => void;
  triggerRef?: MutableRefObject<((action: SwipeAction) => void) | null>;
  stamps: DeckTriggers;
}) {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const rot = useSharedValue(0);
  const exiting = useSharedValue(false);
  const hapticZone = useSharedValue('');

  const likeOpacity = useSharedValue(0);
  const passOpacity = useSharedValue(0);
  const favOpacity = useSharedValue(0);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { rotate: `${rot.value}deg` },
      { scale: 1 - depth * 0.05 },
    ],
    top: depth * 12,
  }));

  const likeStyle = useAnimatedStyle(() => ({ opacity: likeOpacity.value, transform: [{ rotate: '-13deg' }, { scale: 0.9 + likeOpacity.value * 0.2 }] }));
  const passStyle = useAnimatedStyle(() => ({ opacity: passOpacity.value, transform: [{ rotate: '13deg' }, { scale: 0.9 + passOpacity.value * 0.2 }] }));
  const favStyle = useAnimatedStyle(() => ({ opacity: favOpacity.value, transform: [{ scale: 0.9 + favOpacity.value * 0.2 }] }));

  const commit = (action: SwipeAction) => {
    if (exiting.value) return;
    exiting.value = true;
    const flight = action === 'favorite' ? { x: 0, y: -900 } : { x: action === 'like' ? 900 : -900, y: 70 };
    x.value = withTiming(flight.x, { duration: 230 });
    y.value = withTiming(flight.y, { duration: 230 });
    rot.value = withTiming(action === 'like' ? 16 : action === 'pass' ? -16 : 0, { duration: 230 });
    if (action === 'favorite') haptic.medium();
    onCommit(action, item);
  };

  useEffect(() => {
    if (!isTop || !triggerRef) return;
    triggerRef.current = commit;
    return () => {
      if (triggerRef.current === commit) triggerRef.current = null;
    };
  });

  const tap = Gesture.Tap().enabled(isTop).runOnJS(true).onEnd(() => {
    if (onOpen && !exiting.value) onOpen(item);
  });

  const pan = Gesture.Pan()
    .enabled(isTop)
    .runOnJS(true)
    .onUpdate(g => {
      if (exiting.value) return;
      x.value = g.translationX;
      y.value = g.translationY;
      rot.value = g.translationX / 16;
      likeOpacity.value = clamp(g.translationX / 110);
      passOpacity.value = clamp(-g.translationX / 110);
      favOpacity.value = clamp(-g.translationY / 110);
      const zone = g.translationX > 100 ? 'like' : g.translationX < -100 ? 'pass' : g.translationY < -100 ? 'fav' : '';
      if (zone !== hapticZone.value) {
        hapticZone.value = zone;
        if (zone) haptic.light();
      }
    })
    .onEnd(g => {
      if (exiting.value) return;
      const { translationX: dx, translationY: dy } = g;
      if (dy < -110 && Math.abs(dy) > Math.abs(dx)) {
        favOpacity.value = withTiming(1, { duration: 80 });
        runOnJS(commit)('favorite');
      } else if (dx > 110 && Math.abs(dx) > Math.abs(dy)) {
        likeOpacity.value = withTiming(1, { duration: 80 });
        runOnJS(commit)('like');
      } else if (dx < -110 && Math.abs(dx) > Math.abs(dy)) {
        passOpacity.value = withTiming(1, { duration: 80 });
        runOnJS(commit)('pass');
      } else {
        x.value = withSpring(0, { damping: 14, stiffness: 220 });
        y.value = withSpring(0, { damping: 14, stiffness: 220 });
        rot.value = withSpring(0, { damping: 14, stiffness: 220 });
        likeOpacity.value = withTiming(0);
        passOpacity.value = withTiming(0);
        favOpacity.value = withTiming(0);
      }
    });

  const gesture = Gesture.Simultaneous(pan, tap);

  return (
    <View style={[styles.cardSlot, Platform.OS === 'web' && depth > 0 && { pointerEvents: 'box-none' }]}>
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[styles.card, cardStyle]}
          accessible={isTop}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel(item)}
          accessibilityActions={[
            { name: 'activate', label: 'Ver detalle' },
            { name: 'pass', label: 'Pasar' },
            { name: 'like', label: 'Me interesa' },
            { name: 'favorite', label: 'Guardar favorito' },
          ]}
          onAccessibilityAction={event => {
            const name = event.nativeEvent.actionName;
            if (name === 'activate') onOpen?.(item);
            else if (name === 'pass' || name === 'like' || name === 'favorite') commit(name);
          }}
        >
          {renderItem(item, isTop)}
          {isTop && (
            <>
              <StampView stamp={stamps.like} style={likeStyle} side="right" />
              <StampView stamp={stamps.pass} style={passStyle} side="left" />
              <StampView stamp={stamps.favorite} style={favStyle} side="top" />
            </>
          )}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

function clamp(v: number) {
  'worklet';
  return Math.max(0, Math.min(1, v));
}

function StampView({ stamp, style, side }: { stamp: Stamp; style: object; side: 'left' | 'right' | 'top' }) {
  const pos =
    side === 'top'
      ? { top: 24, left: 0, right: 0, alignItems: 'center' }
      : { top: 36, [side === 'left' ? 'right' : 'left']: 24 } as object;
  return (
    <Animated.View pointerEvents="none" style={[styles.stamp, pos, style]}>
      <Text style={[styles.stampText, { color: stamp.color }]}>{stamp.label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  deck: { width: '100%', aspectRatio: 0.82, alignSelf: 'center' },
  cardSlot: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  card: {
    flex: 1,
    borderRadius: 26,
    backgroundColor: Colors.white,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#401F33', shadowOpacity: 0.14, shadowOffset: { width: 0, height: 12 }, shadowRadius: 24 },
      android: { elevation: 7 },
      default: { shadowColor: '#401F33', shadowOpacity: 0.14, shadowOffset: { width: 0, height: 12 }, shadowRadius: 24 },
    }),
  },
  stamp: {
    position: 'absolute',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 3,
    borderRadius: 12,
  },
  stampText: { fontFamily: FontNames.displayHeavy, fontSize: 20, letterSpacing: 1 },
});
