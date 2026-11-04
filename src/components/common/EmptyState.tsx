import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { brand, colors, fonts, radii, spacing } from '../../theme';
import { useReducedMotion } from '../../utils/motion';
import { GrabitMark } from '../brand/GrabitMark';
import { PressableScale } from '../motion/PressableScale';

type Art = 'bag' | 'mark' | 'search';

type Props = {
  art?: Art;
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
};

/** Friendly empty state with a gently swaying Grabit bag (or bobbing mark). */
export function EmptyState({ art = 'bag', title, body, actionLabel, onAction, style }: Props) {
  const sway = useRef(new Animated.Value(0)).current;
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(sway, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(sway, { toValue: -1, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [reduced, sway]);

  const motionStyle =
    art === 'mark'
      ? { transform: [{ translateY: sway.interpolate({ inputRange: [-1, 1], outputRange: [-4, 4] }) }] }
      : { transform: [{ rotate: sway.interpolate({ inputRange: [-1, 1], outputRange: ['-3deg', '3deg'] }) }] };

  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.disc}>
        <Animated.View style={motionStyle}>
          {art === 'mark' ? (
            <GrabitMark size={84} />
          ) : art === 'search' ? (
            <Ionicons name="search" size={64} color={brand.basil} />
          ) : (
            <Svg width={96} height={104} viewBox="0 0 96 104">
              <Path d="M30 34C30 14 66 14 66 34" fill="none" stroke={brand.deepBasil} strokeWidth={7} strokeLinecap="round" />
              <Rect x={10} y={34} width={76} height={66} rx={16} fill={brand.basil} />
              <Circle cx={48} cy={66} r={9} fill={brand.tomato} />
              <Path d="M48 57C49 52 53 50 57 50C56 54 52 57 48 57Z" fill={brand.lime} />
            </Svg>
          )}
        </Animated.View>
      </View>
      <Text maxFontSizeMultiplier={1.25} style={styles.title}>{title}</Text>
      {body ? <Text style={styles.body}>{body}</Text> : null}
      {actionLabel && onAction ? (
        <PressableScale onPress={onAction} style={styles.btn} hapticFeedback accessibilityRole="button">
          <Text style={styles.btnTxt}>{actionLabel}</Text>
        </PressableScale>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: spacing.xxxl, paddingHorizontal: spacing.xl },
  disc: {
    width: 156,
    height: 156,
    borderRadius: 78,
    backgroundColor: colors.sand,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 22,
    letterSpacing: -0.4,
    color: colors.text,
    textAlign: 'center',
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    maxWidth: 320,
  },
  btn: {
    marginTop: spacing.xl,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    borderRadius: radii.pill,
  },
  btnTxt: { fontFamily: fonts.bold, fontSize: 16, color: colors.surface },
});
