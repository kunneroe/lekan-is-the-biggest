import { useEffect, useRef, useState } from 'react';
import { Animated, type StyleProp, type TextStyle } from 'react-native';
import { ease, useReducedMotion } from '../../utils/motion';
import { TEXT_CAP } from '../../utils/responsive';

type Props = {
  value: number;
  style?: StyleProp<TextStyle>;
  prefix?: string;
  /** shrink the text to fit instead of wrapping (bottom bars) */
  fit?: boolean;
};

/** A price that rolls to its new amount and gives a little pop when it changes. */
export function AnimatedPrice({ value, style, prefix = '₦', fit = false }: Props) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(value);
  const roll = useRef(new Animated.Value(value)).current;
  const pop = useRef(new Animated.Value(1)).current;
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (reduced) {
      setShown(value);
      return;
    }
    const id = roll.addListener(({ value: v }) => setShown(v));
    Animated.timing(roll, { toValue: value, duration: 520, easing: ease.settle, useNativeDriver: false }).start(
      () => setShown(value),
    );
    pop.setValue(1.1);
    Animated.spring(pop, { toValue: 1, friction: 4, tension: 180, useNativeDriver: true }).start();
    return () => roll.removeListener(id);
  }, [value, reduced, roll, pop]);

  return (
    <Animated.Text
      style={[style, { transform: [{ scale: pop }] }]}
      numberOfLines={fit ? 1 : undefined}
      adjustsFontSizeToFit={fit}
      minimumFontScale={0.7}
      maxFontSizeMultiplier={TEXT_CAP.control}
    >
      {prefix}
      {Math.round(shown).toLocaleString()}
    </Animated.Text>
  );
}
