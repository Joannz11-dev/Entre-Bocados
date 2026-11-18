import React, { useEffect } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { Easing, useSharedValue, withDelay, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import { Colors } from '../../constants/theme';

const PIECE_COLORS = [Colors.pink, Colors.violet, Colors.orange, Colors.amber, Colors.green];

/** Confeti propio de la marca: ráfaga corta desde arriba, solo en celebraciones.
 *  Sin estado: cada ráfaga remonta las piezas (key por ráfaga) y cada pieza
 *  termina con opacidad 0, así el arbolito se apaga solo. */
export function Confetti({ burst = 0, count = 26 }: { burst?: number; count?: number }) {
  const { width } = useWindowDimensions();
  if (burst <= 0) return null;
  const pieces = Array.from({ length: count }, (_, i) => i);
  return (
    <View key={burst} pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map(i => (
        <Piece key={i} index={i} width={width} />
      ))}
    </View>
  );
}

function Piece({ index, width }: { index: number; width: number }) {
  const progress = useSharedValue(0);
  useEffect(() => {
    const delay = (index % 13) * 70;
    progress.value = withDelay(delay, withTiming(1, { duration: 2400 + (index % 7) * 180, easing: Easing.out(Easing.quad) }));
  }, [progress, index]);
  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: (((index * 83) % 100) / 100) * width - width / 2 + Math.sin((index * 37 + progress.value * 540) * (Math.PI / 180)) * 46 },
      { translateY: -30 + progress.value * 620 },
      { rotate: `${index * 47 + progress.value * 720}deg` },
    ],
    opacity: progress.value > 0.85 ? Math.max(0, (1 - progress.value) / 0.15) : 1,
  }));
  const round = index % 2 === 0;
  const size = 8 + (index % 4) * 3;
  return (
    <Animated.View
      style={[
        styles.piece,
        {
          left: width / 2,
          top: 0,
          width: size,
          height: round ? size : size * 0.45,
          borderRadius: round ? size / 2 : 2,
          backgroundColor: PIECE_COLORS[index % PIECE_COLORS.length],
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  piece: { position: 'absolute' },
});
