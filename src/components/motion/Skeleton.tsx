import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radii, spacing } from '../../theme';
import { useReducedMotion } from '../../utils/motion';

type Props = {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  delay?: number;
  style?: StyleProp<ViewStyle>;
};

/** A sand block with a soft light sweeping across it. */
export function Skeleton({ width = '100%', height = 14, radius = 8, delay = 0, style }: Props) {
  const [w, setW] = useState(0);
  const sweep = useRef(new Animated.Value(0)).current;
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!w) return;
    const anim = reduced
      ? Animated.loop(
          Animated.sequence([
            Animated.timing(sweep, { toValue: 1, duration: 700, useNativeDriver: true }),
            Animated.timing(sweep, { toValue: 0, duration: 700, useNativeDriver: true }),
          ]),
        )
      : Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(sweep, { toValue: 1, duration: 1300, useNativeDriver: true }),
            Animated.timing(sweep, { toValue: 0, duration: 0, useNativeDriver: true }),
          ]),
        );
    anim.start();
    return () => anim.stop();
  }, [w, reduced, delay, sweep]);

  return (
    <View
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
      style={[{ width, height, borderRadius: radius, backgroundColor: colors.sand, overflow: 'hidden' }, style]}
    >
      {w > 0 ? (
        reduced ? (
          <Animated.View
            style={[StyleSheet.absoluteFill, { backgroundColor: '#FFFFFF', opacity: sweep.interpolate({ inputRange: [0, 1], outputRange: [0, 0.45] }) }]}
          />
        ) : (
          <Animated.View
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              width: w * 0.45,
              backgroundColor: 'rgba(255,255,255,0.55)',
              transform: [
                { translateX: sweep.interpolate({ inputRange: [0, 1], outputRange: [-w * 0.5, w * 1.05] }) },
                { skewX: '-18deg' },
              ],
            }}
          />
        )
      ) : null}
    </View>
  );
}

/** Product-card placeholder used while a store's products load. */
export function ProductCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <View style={sk.card}>
      <Skeleton height={124} radius={radii.md} delay={index * 100} />
      <Skeleton width="80%" height={12} delay={index * 100} style={{ marginTop: spacing.md }} />
      <Skeleton width="45%" height={12} delay={index * 100} style={{ marginTop: spacing.sm }} />
    </View>
  );
}

/** Store-card placeholder for the home feed. */
export function StoreCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <View style={sk.store}>
      <Skeleton height={150} radius={0} delay={index * 100} />
      <View style={{ padding: spacing.lg, gap: spacing.sm }}>
        <Skeleton width="60%" height={16} delay={index * 100} />
        <Skeleton width="40%" height={12} delay={index * 100} />
      </View>
    </View>
  );
}

const sk = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  store: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
});
