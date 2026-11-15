import React, { useState } from 'react';
import { Animated, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Restaurant } from '../types/restaurant';
import { PlaceImage, PlaceSummary, styles } from './demo-ui';

export type SwipeAction = 'pass' | 'like' | 'favorite';

export function SwipeCard({ place, onSwipe, onOpen }: {
  place: Restaurant;
  onSwipe: (action: SwipeAction) => void;
  onOpen: () => void;
}) {
  const [position] = useState(() => new Animated.ValueXY());
  const [busy, setBusy] = useState(false);
  const commit = (action: SwipeAction) => {
    if (busy) return;
    setBusy(true);
    const toValue = action === 'favorite' ? { x: 0, y: -650 } : { x: action === 'like' ? 650 : -650, y: 0 };
    Animated.timing(position, { toValue, duration: 200, useNativeDriver: true }).start(({ finished }) => {
      if (finished) onSwipe(action);
      else setBusy(false);
    });
  };
  const responder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 10 || Math.abs(gesture.dy) > 10,
    onPanResponderMove: (_, gesture) => position.setValue({ x: gesture.dx, y: gesture.dy }),
    onPanResponderRelease: (_, gesture) => {
      const { dx, dy } = gesture;
      if (dy < -75 && Math.abs(dy) > Math.abs(dx)) commit('favorite');
      else if (Math.abs(dx) > 90 && Math.abs(dx) > Math.abs(dy)) commit(dx > 0 ? 'like' : 'pass');
      else Animated.spring(position, { toValue: { x: 0, y: 0 }, useNativeDriver: true }).start();
    },
    onPanResponderTerminate: () => Animated.spring(position, { toValue: { x: 0, y: 0 }, useNativeDriver: true }).start(),
  });
  const rotation = position.x.interpolate({ inputRange: [-300, 0, 300], outputRange: ['-12deg', '0deg', '12deg'], extrapolate: 'clamp' });
  return <Animated.View style={[cardStyles.card, { transform: [...position.getTranslateTransform(), { rotate: rotation }] }]} {...responder.panHandlers}
    accessible accessibilityLabel={`${place.name}. Desliza a la izquierda para pasar, a la derecha para indicar interés o arriba para guardar en favoritos.`}
    accessibilityActions={[{ name: 'activate', label: 'Ver detalle' }, { name: 'pass', label: 'Pasar' }, { name: 'like', label: 'Me interesa' }, { name: 'favorite', label: 'Guardar favorito' }]}
    onAccessibilityAction={event => {
      const action = event.nativeEvent.actionName;
      if (action === 'activate') onOpen();
      else if (action === 'pass' || action === 'like' || action === 'favorite') commit(action);
    }}>
    <Pressable onPress={onOpen} accessibilityRole="button" accessibilityLabel={`Ver detalle de ${place.name}`}>
      <PlaceImage place={place} />
      <View style={cardStyles.content}><PlaceSummary place={place} /><Text style={styles.note}>{place.address} · Toca para ver detalles →</Text></View>
    </Pressable>
  </Animated.View>;
}

const cardStyles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#E9D9CA', elevation: 3 },
  content: { padding: 20, gap: 8 },
});
