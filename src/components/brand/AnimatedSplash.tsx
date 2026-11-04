import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { brand, fonts } from '../../theme';
import { haptic } from '../../utils/haptics';
import { ease } from '../../utils/motion';
import { GrabitMark, MARK } from './GrabitMark';
import { WORDMARK } from './wordmarkPath';

/** Must match the native splash (app.json → expo-splash-screen imageWidth). */
export const SPLASH_MARK_SIZE = 160;
const WORD_H = 58;

/** Groceries that spill out of the bag: colour, sideways travel, height, size. */
const SPILL = [
  { c: brand.sprout, dx: -46, up: 92, s: 22 },
  { c: brand.butter, dx: 6, up: 128, s: 26 },
  { c: brand.tomato, dx: 50, up: 98, s: 20 },
];

type Props = { onFinish: () => void };

/**
 * "The Grab Bag". The native splash shows the static bag; this overlay takes over in
 * the same spot: the bag crouches, hops and lands with a squash, groceries pop out of
 * it and drop back in, then "grabit" rises letter by letter and the i-dot lands last.
 */
export function AnimatedSplash({ onFinish }: Props) {
  const { width: W, height: H } = useWindowDimensions();
  const S = SPLASH_MARK_SIZE;
  const v = useRef({
    crouch: new Animated.Value(0),
    hop: new Animated.Value(0),
    land: new Animated.Value(0),
    spill: SPILL.map(() => new Animated.Value(0)),
    lift: new Animated.Value(0),
    letters: WORDMARK.letters.map(() => new Animated.Value(0)),
    dot: new Animated.Value(0),
    tag: new Animated.Value(0),
    fade: new Animated.Value(1),
  }).current;
  const done = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const finish = () => {
      if (done.current) return;
      done.current = true;
      onFinish();
    };
    const fallback = setTimeout(finish, 5000);
    const N = { useNativeDriver: true } as const;
    const fadeOut = Animated.timing(v.fade, { toValue: 0, duration: 260, delay: 600, ...N });

    AccessibilityInfo.isReduceMotionEnabled()
      .catch(() => false)
      .then((reduce) => {
        if (cancelled) return;
        if (reduce) {
          v.lift.setValue(1);
          v.letters.forEach((l) => l.setValue(1));
          v.dot.setValue(1);
          v.tag.setValue(1);
          fadeOut.start(finish);
          return;
        }

        const jump = Animated.sequence([
          Animated.delay(100),
          Animated.timing(v.crouch, { toValue: 1, duration: 140, easing: ease.settle, ...N }),
          Animated.parallel([
            Animated.timing(v.crouch, { toValue: 0, duration: 120, ...N }),
            Animated.timing(v.hop, { toValue: 1, duration: 280, easing: ease.settle, ...N }),
          ]),
          Animated.timing(v.hop, { toValue: 0, duration: 260, easing: ease.fall, ...N }),
        ]);

        const landing = Animated.parallel([
          Animated.sequence([
            Animated.timing(v.land, { toValue: 1, duration: 70, ...N }),
            Animated.spring(v.land, { toValue: 0, friction: 3.6, tension: 170, ...N }),
          ]),
          Animated.stagger(
            90,
            v.spill.map((s) => Animated.timing(s, { toValue: 1, duration: 640, delay: 60, ...N })),
          ),
        ]);

        const reveal = Animated.parallel([
          Animated.timing(v.lift, { toValue: 1, duration: 460, delay: 520, easing: ease.settle, ...N }),
          Animated.stagger(
            55,
            v.letters.map((l) => Animated.timing(l, { toValue: 1, duration: 380, delay: 600, easing: ease.snap, ...N })),
          ),
          Animated.timing(v.dot, { toValue: 1, duration: 380, delay: 1000, ...N }),
          Animated.timing(v.tag, { toValue: 1, duration: 320, delay: 1080, easing: ease.settle, ...N }),
        ]);

        jump.start(() => {
          if (cancelled) return;
          haptic.grab();
          Animated.parallel([landing, reveal]).start(() => {
            if (!cancelled) fadeOut.start(finish);
          });
        });
      });

    return () => {
      cancelled = true;
      clearTimeout(fallback);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The bag sits exactly where the native splash drew it, then lifts to make room.
  const markLeft = W / 2 - S / 2;
  const markTop = H / 2 - S / 2;
  const LIFT = 56;
  const k = S / 120;

  const bagStyle = {
    transform: [
      { translateY: v.lift.interpolate({ inputRange: [0, 1], outputRange: [0, -LIFT] }) },
      { translateY: v.hop.interpolate({ inputRange: [0, 1], outputRange: [0, -S * 0.42] }) },
      { rotate: v.hop.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-7deg'] }) },
      // squash from the bottom of the bag: shift down, scale, shift back
      { translateY: S * 0.4 },
      {
        scaleX: Animated.add(
          v.crouch.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] }),
          v.land.interpolate({ inputRange: [0, 1], outputRange: [0, 0.18] }),
        ),
      },
      {
        scaleY: Animated.add(
          v.crouch.interpolate({ inputRange: [0, 1], outputRange: [1, 0.86] }),
          v.land.interpolate({ inputRange: [0, 1], outputRange: [0, -0.2] }),
        ),
      },
      { translateY: -S * 0.4 },
    ],
  };

  const ws = WORD_H / WORDMARK.height;
  const wordW = WORDMARK.width * ws;
  const wordTop = H / 2 + S / 2 - LIFT + 12;
  const d = WORDMARK.dot;
  const mouthX = MARK.mouth.x * k;
  const mouthY = MARK.mouth.y * k;

  return (
    <Animated.View style={[styles.root, { opacity: v.fade }]}>
      <StatusBar style="light" />
      <Animated.View style={[{ position: 'absolute', left: markLeft, top: markTop, width: S, height: S }, bagStyle]}>
        {/* groceries spill out of the bag's mouth (behind the bag) and drop back in */}
        {SPILL.map((p, i) => (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left: mouthX - p.s / 2,
              top: mouthY - p.s / 2,
              width: p.s,
              height: p.s,
              borderRadius: p.s / 2,
              backgroundColor: p.c,
              opacity: v.spill[i].interpolate({ inputRange: [0, 0.05, 0.85, 1], outputRange: [0, 1, 1, 0] }),
              transform: [
                { translateX: v.spill[i].interpolate({ inputRange: [0, 0.45, 1], outputRange: [0, p.dx, p.dx * 0.25] }) },
                { translateY: v.spill[i].interpolate({ inputRange: [0, 0.45, 1], outputRange: [20, -p.up, 16] }) },
                { scale: v.spill[i].interpolate({ inputRange: [0, 0.45, 1], outputRange: [0.4, 1.1, 0.7] }) },
              ],
            }}
          />
        ))}
        <GrabitMark size={S} variant="reverse" />
      </Animated.View>

      <View
        accessible
        accessibilityLabel="Grabit"
        style={{ position: 'absolute', top: wordTop, left: W / 2 - wordW / 2, width: wordW, height: WORD_H }}
      >
        {WORDMARK.letters.map((l, i) => {
          const lw = (l.x1 - l.x0) * ws;
          return (
            <Animated.View
              key={l.x0}
              style={{
                position: 'absolute',
                left: (l.x0 - WORDMARK.minX) * ws,
                top: 0,
                width: lw,
                height: WORD_H,
                opacity: v.letters[i],
                transform: [
                  { translateY: v.letters[i].interpolate({ inputRange: [0, 1], outputRange: [26, 0] }) },
                  { scale: v.letters[i].interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) },
                ],
              }}
            >
              <Svg width={lw} height={WORD_H} viewBox={`${l.x0} ${WORDMARK.minY} ${l.x1 - l.x0} ${WORDMARK.height}`}>
                <Path d={l.d} fill="#FFFFFF" />
              </Svg>
            </Animated.View>
          );
        })}
        <Animated.View
          style={{
            position: 'absolute',
            left: (d.cx - d.r - WORDMARK.minX) * ws,
            top: (d.cy - d.r - WORDMARK.minY) * ws,
            width: d.r * 2 * ws,
            height: d.r * 2 * ws,
            borderRadius: d.r * ws,
            backgroundColor: brand.butter,
            transform: [
              {
                translateY: v.dot.interpolate({ inputRange: [0, 0.5, 1], outputRange: [-40, 4, 0] }),
              },
              {
                scale: v.dot.interpolate({ inputRange: [0, 0.1, 0.5, 0.75, 1], outputRange: [0, 1, 1.25, 0.9, 1] }),
              },
            ],
          }}
        />
      </View>

      <Animated.Text
        style={[
          styles.tagline,
          {
            top: wordTop + WORD_H + 18,
            opacity: v.tag,
            transform: [{ translateY: v.tag.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }],
          },
        ]}
        maxFontSizeMultiplier={1.25}
      >
        Groceries, bagged and brought.
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: brand.green,
    zIndex: 1000,
    elevation: 1000,
  },
  tagline: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontFamily: fonts.semibold,
    fontSize: 17,
    color: brand.cream,
  },
});
