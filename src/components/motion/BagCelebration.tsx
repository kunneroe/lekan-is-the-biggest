import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import { brand } from '../../theme';
import { haptic } from '../../utils/haptics';
import { ease, useReducedMotion } from '../../utils/motion';

const W = 240;
const H = 260;
const AnimatedPath = Animated.createAnimatedComponent(Path);
const CHECK_LEN = 110;

/** Bits that burst out from behind the bag when the check lands. */
const CONFETTI = [
  { dx: -160, dy: -40, c: brand.butter, s: 14, r: 7 },
  { dx: -120, dy: -130, c: brand.sprout, s: 12, r: 3 },
  { dx: -50, dy: -180, c: brand.green, s: 14, r: 7 },
  { dx: 40, dy: -185, c: '#FFC92E', s: 14, r: 7 },
  { dx: 115, dy: -140, c: brand.butter, s: 12, r: 6 },
  { dx: 165, dy: -50, c: brand.sprout, s: 12, r: 3 },
  { dx: 150, dy: 60, c: brand.green, s: 12, r: 6 },
  { dx: -150, dy: 70, c: '#FFC92E', s: 12, r: 3 },
  { dx: -175, dy: -100, c: brand.butter, s: 10, r: 5 },
  { dx: 175, dy: -115, c: brand.green, s: 10, r: 5 },
];

type Props = { onDone?: () => void };

/**
 * Order success: four groceries drop into the Grabit bag one by one, the bag dips on each
 * landing, then a check draws itself on the front and produce confetti bursts out.
 */
export function BagCelebration({ onDone }: Props) {
  const reduced = useReducedMotion();
  const items = useRef([0, 1, 2, 3].map(() => new Animated.Value(0))).current;
  const dip = useRef(new Animated.Value(0)).current;
  const pop = useRef(new Animated.Value(0)).current;
  const check = useRef(new Animated.Value(0)).current;
  const burst = useRef(new Animated.Value(0)).current;
  const ring = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduced) {
      items.forEach((i) => i.setValue(1));
      check.setValue(1);
      onDone?.();
      return;
    }
    const N = { useNativeDriver: true } as const;
    const landing = (i: number) =>
      Animated.sequence([
        Animated.delay(200 + i * 250),
        Animated.timing(items[i], { toValue: 1, duration: 420, easing: ease.fall, ...N }),
      ]);
    const dips = Animated.sequence(
      [0, 1, 2, 3].flatMap((i) => [
        Animated.delay(i === 0 ? 620 : 130),
        Animated.timing(dip, { toValue: 1, duration: 60, ...N }),
        Animated.spring(dip, { toValue: 0, friction: 4, tension: 200, ...N }),
      ]),
    );
    const timers = [0, 1, 2, 3].map((i) => setTimeout(() => haptic.tap(), 620 + i * 250));

    Animated.parallel([...items.map((_, i) => landing(i)), dips]).start(() => {
      haptic.success();
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pop, { toValue: 1, duration: 90, ...N }),
          Animated.spring(pop, { toValue: 0, friction: 3.5, tension: 160, ...N }),
        ]),
        Animated.timing(check, { toValue: 1, duration: 450, easing: ease.settle, useNativeDriver: false }),
        Animated.timing(burst, { toValue: 1, duration: 1300, easing: ease.settle, ...N }),
        Animated.timing(ring, { toValue: 1, duration: 700, easing: ease.settle, ...N }),
      ]).start(() => onDone?.());
    });
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  const bagStyle = {
    transform: [
      { translateY: H * 0.45 },
      {
        scaleX: Animated.add(
          dip.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] }),
          pop.interpolate({ inputRange: [0, 1], outputRange: [0, 0.06] }),
        ),
      },
      {
        scaleY: Animated.add(
          dip.interpolate({ inputRange: [0, 1], outputRange: [1, 0.94] }),
          pop.interpolate({ inputRange: [0, 1], outputRange: [0, -0.1] }),
        ),
      },
      { translateY: -H * 0.45 },
    ],
  };

  const dropStyle = (v: Animated.Value) => ({
    opacity: v.interpolate({ inputRange: [0, 0.05, 1], outputRange: [0, 1, 1] }),
    transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [-320, 0] }) }],
  });

  return (
    <View style={styles.stage}>
      <Animated.View
        style={[
          styles.ring,
          {
            opacity: ring.interpolate({ inputRange: [0, 0.05, 1], outputRange: [0, 0.9, 0] }),
            transform: [{ scale: ring.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.5] }) }],
          },
        ]}
      />
      <View style={styles.disc} />

      {CONFETTI.map((c, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            left: W / 2 - c.s / 2 + 30,
            top: 140,
            width: c.s,
            height: c.s,
            borderRadius: c.r,
            backgroundColor: c.c,
            opacity: burst.interpolate({ inputRange: [0, 0.02, 0.65, 1], outputRange: [0, 1, 1, 0] }),
            transform: [
              { translateX: burst.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, c.dx, c.dx] }) },
              { translateY: burst.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, c.dy, c.dy + 40] }) },
              { rotate: burst.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${(i % 2 ? -1 : 1) * 220}deg`] }) },
            ],
          }}
        />
      ))}

      <Animated.View style={[styles.bag, bagStyle]}>
        <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={StyleSheet.absoluteFill}>
          <Path d="M84 92C84 40 156 40 156 92" fill="none" stroke={brand.greenDeep} strokeWidth={12} strokeLinecap="round" />
          <Rect x={40} y={86} width={160} height={150} rx={22} fill={brand.greenDeep} />
        </Svg>

        <Animated.View style={[StyleSheet.absoluteFill, dropStyle(items[0])]}>
          <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
            <G transform="rotate(18 150 73)">
              <Rect x={138} y={30} width={24} height={86} rx={12} fill="#D9A05B" />
              <Path d="M143 44l14 6M143 60l14 6M143 76l14 6" stroke="#F6E7D2" strokeWidth={3} strokeLinecap="round" />
            </G>
          </Svg>
        </Animated.View>
        <Animated.View style={[StyleSheet.absoluteFill, dropStyle(items[1])]}>
          <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
            <Circle cx={88} cy={82} r={24} fill={brand.butter} />
            <Path d="M88 60C90 52 97 49 104 50C101 57 95 61 88 60Z" fill={brand.sprout} />
          </Svg>
        </Animated.View>
        <Animated.View style={[StyleSheet.absoluteFill, dropStyle(items[2])]}>
          <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
            <Ellipse cx={114} cy={70} rx={10} ry={28} fill="#2E8B3E" transform="rotate(-18 114 70)" />
            <Ellipse cx={126} cy={74} rx={9} ry={24} fill="#4CB860" transform="rotate(16 126 74)" />
          </Svg>
        </Animated.View>
        <Animated.View style={[StyleSheet.absoluteFill, dropStyle(items[3])]}>
          <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
            <Ellipse cx={160} cy={92} rx={20} ry={16} fill="#FFD43B" />
          </Svg>
        </Animated.View>

        <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={StyleSheet.absoluteFill}>
          <Rect x={30} y={100} width={180} height={146} rx={26} fill={brand.green} />
          <AnimatedPath
            d="M86 172L110 196L156 148"
            fill="none"
            stroke={brand.cream}
            strokeWidth={16}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={[CHECK_LEN, CHECK_LEN]}
            strokeDashoffset={check.interpolate({ inputRange: [0, 1], outputRange: [CHECK_LEN, 0] })}
          />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { width: W + 60, height: H + 20, alignItems: 'center', justifyContent: 'flex-start' },
  disc: {
    position: 'absolute',
    top: -10,
    left: (W + 60) / 2 - 150,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: brand.sand,
  },
  ring: {
    position: 'absolute',
    top: -10,
    left: (W + 60) / 2 - 150,
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 4,
    borderColor: brand.sprout,
  },
  bag: { width: W, height: H },
});
