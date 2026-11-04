import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import {
  AccessibilityInfo,
  Animated,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { brand, fonts } from '../../theme';
import { haptic } from '../../utils/haptics';
import { ease } from '../../utils/motion';
import { MARK } from './GrabitMark';
import { WORDMARK } from './wordmarkPath';

/** Must match the native splash (app.json → expo-splash-screen imageWidth). */
export const SPLASH_MARK_SIZE = 160;
const WORD_H = 60;

type Props = { onFinish: () => void };

/**
 * "The Grab". The native splash shows the static mark; this overlay takes over in the
 * same spot: the tomato hops out, drops back, the G snaps shut on it, then the wordmark
 * rises letter by letter and the i-dot lands last.
 */
export function AnimatedSplash({ onFinish }: Props) {
  const { width: W, height: H } = useWindowDimensions();
  const S = SPLASH_MARK_SIZE;
  const v = useRef({
    hop: new Animated.Value(0),
    squash: new Animated.Value(0),
    snap: new Animated.Value(0),
    ring: new Animated.Value(0),
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
    const fallback = setTimeout(finish, 4500);
    const N = { useNativeDriver: true } as const;
    const fadeOut = Animated.timing(v.fade, { toValue: 0, duration: 260, delay: 650, ...N });

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

        const toss = Animated.sequence([
          Animated.delay(120),
          Animated.timing(v.hop, { toValue: 1, duration: 280, easing: ease.settle, ...N }),
          Animated.timing(v.hop, { toValue: 0, duration: 300, easing: ease.fall, ...N }),
        ]);

        const grab = Animated.parallel([
          Animated.sequence([
            Animated.timing(v.squash, { toValue: 1, duration: 70, ...N }),
            Animated.spring(v.squash, { toValue: 0, friction: 4, tension: 170, ...N }),
          ]),
          Animated.sequence([
            Animated.timing(v.snap, { toValue: 1, duration: 90, ...N }),
            Animated.timing(v.snap, { toValue: 2, duration: 170, easing: ease.settle, ...N }),
            Animated.timing(v.snap, { toValue: 3, duration: 160, easing: ease.settle, ...N }),
          ]),
          Animated.timing(v.ring, { toValue: 1, duration: 600, easing: ease.settle, ...N }),
        ]);

        const reveal = Animated.parallel([
          Animated.timing(v.lift, { toValue: 1, duration: 460, delay: 120, easing: ease.settle, ...N }),
          Animated.stagger(
            50,
            v.letters.map((l) =>
              Animated.timing(l, { toValue: 1, duration: 380, delay: 160, easing: ease.snap, ...N }),
            ),
          ),
          Animated.timing(v.dot, { toValue: 1, duration: 380, delay: 560, ...N }),
          Animated.timing(v.tag, { toValue: 1, duration: 320, delay: 640, easing: ease.settle, ...N }),
        ]);

        toss.start(() => {
          if (cancelled) return;
          haptic.grab();
          Animated.parallel([grab, reveal]).start(() => {
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

  // Mark sits exactly where the native splash drew it, then lifts to make room.
  const markLeft = W / 2 - S / 2;
  const markTop = H / 2 - S / 2;
  const LIFT = 52;

  const markStyle = {
    transform: [
      { translateY: v.lift.interpolate({ inputRange: [0, 1], outputRange: [0, -LIFT] }) },
      { scale: v.snap.interpolate({ inputRange: [0, 1, 2, 3], outputRange: [1, 0.9, 1.06, 1] }) },
      {
        rotate: v.snap.interpolate({
          inputRange: [0, 1, 2, 3],
          outputRange: ['0deg', '-8deg', '3deg', '0deg'],
        }),
      },
    ],
  };

  // Tomato + leaf live in their own small layer so they can hop and squash.
  const t = { x: 79, y: 16, w: 26, h: 34 };
  const k = S / 120;
  const tomatoStyle = {
    transform: [
      { translateY: v.hop.interpolate({ inputRange: [0, 1], outputRange: [0, -S * 0.55] }) },
      { rotate: v.hop.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-25deg'] }) },
      { scaleX: v.squash.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] }) },
      { scaleY: v.squash.interpolate({ inputRange: [0, 1], outputRange: [1, 0.72] }) },
    ],
  };

  const ringStyle = {
    opacity: v.ring.interpolate({ inputRange: [0, 0.05, 1], outputRange: [0, 0.9, 0] }),
    transform: [{ scale: v.ring.interpolate({ inputRange: [0, 1], outputRange: [0.55, 2.1] }) }],
  };

  const ws = WORD_H / WORDMARK.height;
  const wordW = WORDMARK.width * ws;
  const wordTop = H / 2 + S / 2 - LIFT + 18;
  const d = WORDMARK.dot;

  return (
    <Animated.View style={[styles.root, { opacity: v.fade }]}>
      <StatusBar style="light" />
      <Animated.View style={[{ position: 'absolute', left: markLeft, top: markTop, width: S, height: S }, markStyle]}>
        <Animated.View
          pointerEvents="none"
          style={[styles.ring, { left: 0, top: 0, width: S, height: S, borderRadius: S / 2 }, ringStyle]}
        />
        <Svg width={S} height={S} viewBox="0 0 120 120">
          <Path
            d={MARK.g}
            fill="none"
            stroke={brand.oat}
            strokeWidth={MARK.stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
        <Animated.View
          style={[
            { position: 'absolute', left: t.x * k, top: t.y * k, width: t.w * k, height: t.h * k },
            tomatoStyle,
          ]}
        >
          <Svg width={t.w * k} height={t.h * k} viewBox={`${t.x} ${t.y} ${t.w} ${t.h}`}>
            <Circle cx={MARK.dot.cx} cy={MARK.dot.cy} r={MARK.dot.r} fill={brand.tomato} />
            <Path d={MARK.leaf} fill={brand.lime} />
          </Svg>
        </Animated.View>
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
                ],
              }}
            >
              <Svg width={lw} height={WORD_H} viewBox={`${l.x0} ${WORDMARK.minY} ${l.x1 - l.x0} ${WORDMARK.height}`}>
                <Path d={l.d} fill={brand.oat} />
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
            backgroundColor: brand.tomato,
            transform: [
              {
                scale: v.dot.interpolate({
                  inputRange: [0, 0.5, 0.75, 1],
                  outputRange: [0, 1.45, 0.85, 1],
                }),
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
      >
        Fresh groceries, in a grab.
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: brand.basil,
    zIndex: 1000,
    elevation: 1000,
  },
  ring: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: brand.lime,
  },
  tagline: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontFamily: fonts.medium,
    fontSize: 17,
    color: brand.oat,
  },
});
