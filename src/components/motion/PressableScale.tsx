import { useRef, type ReactNode } from 'react';
import {
  Animated,
  Pressable,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { haptic } from '../../utils/haptics';

type Props = Omit<PressableProps, 'style' | 'children'> & {
  children: ReactNode;
  /** style of the visible (scaling) element */
  style?: StyleProp<ViewStyle>;
  /** layout style of the touch target (flex, width, margins) */
  containerStyle?: StyleProp<ViewStyle>;
  scaleTo?: number;
  hapticFeedback?: boolean;
};

/** A pressable that squeezes on touch and springs back — the "grab" feel on every tap. */
export function PressableScale({
  children,
  style,
  containerStyle,
  scaleTo = 0.96,
  hapticFeedback = false,
  onPressIn,
  onPressOut,
  onPress,
  disabled,
  ...rest
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = (e: GestureResponderEvent) => {
    Animated.spring(scale, { toValue: scaleTo, speed: 40, bounciness: 0, useNativeDriver: true }).start();
    onPressIn?.(e);
  };
  const pressOut = (e: GestureResponderEvent) => {
    Animated.spring(scale, { toValue: 1, speed: 18, bounciness: 10, useNativeDriver: true }).start();
    onPressOut?.(e);
  };

  return (
    <Pressable
      {...rest}
      disabled={disabled}
      style={containerStyle}
      onPressIn={pressIn}
      onPressOut={pressOut}
      onPress={(e) => {
        if (hapticFeedback) haptic.tap();
        onPress?.(e);
      }}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}
