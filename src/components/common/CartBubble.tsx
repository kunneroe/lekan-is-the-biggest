import { Ionicons } from '@expo/vector-icons';
import { forwardRef, useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useCartCount } from '../../context/useCartCount';
import { brand, colors, fonts, shadows } from '../../theme';
import { haptic } from '../../utils/haptics';

type Props = {
  onPress: () => void;
  /** bump this number when a flying product lands here — the bag gulps */
  landSignal?: number;
};

/** Round cart button with a live count. Flying products can land in it. */
export const CartBubble = forwardRef<View, Props>(function CartBubble({ onPress, landSignal = 0 }, ref) {
  const count = useCartCount();
  const gulp = useRef(new Animated.Value(0)).current;
  const pop = useRef(new Animated.Value(count > 0 ? 1 : 0)).current;
  const prev = useRef(count);

  useEffect(() => {
    if (!landSignal) return;
    haptic.grab();
    gulp.setValue(0);
    Animated.sequence([
      Animated.timing(gulp, { toValue: 1, duration: 90, useNativeDriver: true }),
      Animated.spring(gulp, { toValue: 0, friction: 3.5, tension: 220, useNativeDriver: true }),
    ]).start();
  }, [landSignal, gulp]);

  useEffect(() => {
    if (count > prev.current) {
      pop.setValue(0);
      Animated.spring(pop, { toValue: 1, friction: 4, tension: 200, useNativeDriver: true }).start();
    } else {
      pop.setValue(count > 0 ? 1 : 0);
    }
    prev.current = count;
  }, [count, pop]);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={count > 0 ? `Cart, ${count} items` : 'Cart'}
      hitSlop={6}
    >
      <Animated.View
        ref={ref}
        collapsable={false}
        style={[
          styles.btn,
          {
            transform: [
              { scaleX: gulp.interpolate({ inputRange: [0, 1], outputRange: [1, 1.25] }) },
              { scaleY: gulp.interpolate({ inputRange: [0, 1], outputRange: [1, 0.8] }) },
            ],
          },
        ]}
      >
        <Ionicons name="bag-handle" size={22} color={colors.primary} />
      </Animated.View>
      {count > 0 ? (
        <Animated.View style={[styles.badge, { transform: [{ scale: pop }] }]}>
          <Text style={styles.badgeTxt}>{count > 99 ? '99+' : count}</Text>
        </Animated.View>
      ) : null}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  btn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  badge: {
    position: 'absolute',
    right: -4,
    top: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 4,
    backgroundColor: brand.tomato,
    borderWidth: 2,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTxt: { fontFamily: fonts.black, fontSize: 10, color: brand.forest },
});
