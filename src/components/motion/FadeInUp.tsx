import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, type StyleProp, type ViewStyle } from 'react-native';
import { ease } from '../../utils/motion';

type Props = {
  children: ReactNode;
  /** list position — staggers the entrance (capped so long lists don't drag) */
  index?: number;
  delay?: number;
  distance?: number;
  style?: StyleProp<ViewStyle>;
};

/** Entrance: fades in while rising a few points, staggered by index. */
export function FadeInUp({ children, index = 0, delay = 0, distance = 16, style }: Props) {
  const v = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(v, {
      toValue: 1,
      duration: 420,
      delay: delay + Math.min(index, 8) * 55,
      easing: ease.settle,
      useNativeDriver: true,
    }).start();
  }, [delay, index, v]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: v,
          transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
