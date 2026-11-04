import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, fonts, spacing } from '../../theme';
import { ease, useReducedMotion } from '../../utils/motion';
import { GrabitMark, type MarkVariant } from './GrabitMark';

type Props = {
  size?: number;
  variant?: MarkVariant;
  style?: StyleProp<ViewStyle>;
};

/** The G chasing its tomato. Replaces every spinner in the app. */
export function GrabitLoader({ size = 40, variant = 'color', style }: Props) {
  const spin = useRef(new Animated.Value(0)).current;
  const reduced = useReducedMotion();

  useEffect(() => {
    spin.setValue(0);
    const anim = reduced
      ? Animated.loop(
          Animated.sequence([
            Animated.timing(spin, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.timing(spin, { toValue: 0, duration: 600, useNativeDriver: true }),
          ]),
        )
      : Animated.loop(
          Animated.timing(spin, { toValue: 1, duration: 900, easing: ease.spin, useNativeDriver: true }),
        );
    anim.start();
    return () => anim.stop();
  }, [reduced, spin]);

  const animStyle = reduced
    ? { opacity: spin.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }
    : { transform: [{ rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] };

  return (
    <Animated.View
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
      style={[{ width: size, height: size }, animStyle, style]}
    >
      <GrabitMark size={size} variant={variant} showLeaf={false} />
    </Animated.View>
  );
}

/** Full-area loading state. */
export function LoaderView({ label, style }: { label?: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.wrap, style]}>
      <GrabitLoader size={44} />
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
