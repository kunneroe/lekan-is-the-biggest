import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { brand, colors, fonts, spacing } from '../../theme';
import { useReducedMotion } from '../../utils/motion';
import { GrabitMark, MARK, type MarkVariant } from './GrabitMark';

type Props = {
  size?: number;
  variant?: MarkVariant;
  style?: StyleProp<ViewStyle>;
};

const CYCLE = 1050;

/**
 * "Bag hop": the bag crouches and hops while a grocery flips up out of it and drops
 * back in. Replaces every spinner in the app.
 */
export function GrabitLoader({ size = 40, variant = 'color', style }: Props) {
  const t = useRef(new Animated.Value(0)).current;
  const reduced = useReducedMotion();

  useEffect(() => {
    t.setValue(0);
    const anim = reduced
      ? Animated.loop(
          Animated.sequence([
            Animated.timing(t, { toValue: 1, duration: 650, useNativeDriver: true }),
            Animated.timing(t, { toValue: 0, duration: 650, useNativeDriver: true }),
          ]),
        )
      : Animated.loop(Animated.timing(t, { toValue: 1, duration: CYCLE, easing: Easing.linear, useNativeDriver: true }));
    anim.start();
    return () => anim.stop();
  }, [reduced, t]);

  const dotSize = Math.max(4, size * 0.17);
  const mouthX = (MARK.mouth.x / 120) * size - dotSize / 2;
  const mouthY = (MARK.mouth.y / 120) * size - dotSize / 2;
  const dotColor = variant === 'reverse' ? brand.butter : variant === 'dark' ? brand.sprout : brand.tomato;

  if (reduced) {
    return (
      <Animated.View
        accessibilityRole="progressbar"
        accessibilityLabel="Loading"
        style={[{ width: size, height: size, opacity: t.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] }) }, style]}
      >
        <GrabitMark size={size} variant={variant} />
      </Animated.View>
    );
  }

  return (
    <View accessibilityRole="progressbar" accessibilityLabel="Loading" style={[{ width: size, height: size }, style]}>
      {/* the grocery: flips up out of the bag and drops back in (drawn behind the bag) */}
      <Animated.View
        style={{
          position: 'absolute',
          left: mouthX,
          top: mouthY,
          width: dotSize,
          height: dotSize,
          borderRadius: dotSize / 2,
          backgroundColor: dotColor,
          opacity: t.interpolate({ inputRange: [0, 0.18, 0.22, 0.74, 0.8, 1], outputRange: [0, 0, 1, 1, 0, 0] }),
          transform: [
            {
              translateY: t.interpolate({
                inputRange: [0, 0.2, 0.48, 0.8, 1],
                outputRange: [size * 0.12, size * 0.1, -size * 0.5, size * 0.12, size * 0.12],
              }),
            },
            { translateX: t.interpolate({ inputRange: [0, 0.2, 0.48, 0.8, 1], outputRange: [0, 0, size * 0.12, 0, 0] }) },
          ],
        }}
      />
      <Animated.View
        style={{
          transform: [
            { translateY: size / 2 },
            {
              translateY: t.interpolate({
                inputRange: [0, 0.12, 0.3, 0.46, 0.6, 0.72, 1],
                outputRange: [0, 0, -size * 0.14, -size * 0.04, 0, 0, 0],
              }),
            },
            {
              scaleY: t.interpolate({
                inputRange: [0, 0.12, 0.3, 0.6, 0.68, 0.8, 1],
                outputRange: [1, 0.84, 1.06, 1, 0.9, 1, 1],
              }),
            },
            {
              scaleX: t.interpolate({
                inputRange: [0, 0.12, 0.3, 0.6, 0.68, 0.8, 1],
                outputRange: [1, 1.1, 0.96, 1, 1.08, 1, 1],
              }),
            },
            { translateY: -size / 2 },
          ],
        }}
      >
        <GrabitMark size={size} variant={variant} />
      </Animated.View>
    </View>
  );
}

/** Full-area loading state. */
export function LoaderView({ label, style }: { label?: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.wrap, style]}>
      <GrabitLoader size={52} />
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    gap: spacing.md,
  },
  label: { fontFamily: fonts.medium, fontSize: 14, color: colors.textSecondary },
});
