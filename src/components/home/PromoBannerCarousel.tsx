import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { brand, fonts, radii, spacing } from '../../theme';
import { GrabitMark } from '../brand/GrabitMark';
import { PressableScale } from '../motion/PressableScale';
import { useReducedMotion } from '../../utils/motion';
import { useLayout } from '../../utils/responsive';

type Banner = {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  bg: string;
  fg: string;
  ctaBg: string;
  ctaFg: string;
  mark: string;
  image: string;
};

const BANNERS: Banner[] = [
  {
    id: '1',
    title: 'Free delivery on your first order',
    subtitle: 'Zero delivery fees on local markets today.',
    cta: 'Claim now',
    bg: brand.forest,
    fg: brand.oat,
    ctaBg: brand.lime,
    ctaFg: brand.forest,
    mark: 'rgba(196,240,66,0.12)',
    image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80',
  },
  {
    id: '2',
    title: 'Weekend flash deals',
    subtitle: 'Save on pantry staples from partner stores.',
    cta: 'Shop deals',
    bg: brand.tomato,
    fg: brand.forest,
    ctaBg: brand.forest,
    ctaFg: brand.oat,
    mark: 'rgba(10,46,31,0.10)',
    image: 'https://images.unsplash.com/photo-1606787366850-de6330120b65?w=800&q=80',
  },
  {
    id: '3',
    title: 'Grab it in minutes',
    subtitle: 'Track your rider live from store to door.',
    cta: 'Learn more',
    bg: brand.lime,
    fg: brand.forest,
    ctaBg: brand.basil,
    ctaFg: brand.oat,
    mark: 'rgba(14,124,74,0.14)',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80',
  },
];

const AUTO_MS = 4500;

/**
 * Promo banners: swipe or let them auto-advance. The active dot fills like a story
 * progress bar; touching the carousel pauses it. Cards behind the centre one sit back
 * and their photos drift, so swiping feels layered.
 */
export function PromoBannerCarousel() {
  const { width, gutter } = useLayout();
  const reduced = useReducedMotion();
  const cardW = Math.min(width - gutter * 2 - 16, 360);
  const gap = spacing.md;
  const step = cardW + gap;
  const scrollX = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const listRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || reduced) return;
    progress.setValue(0);
    const run = Animated.timing(progress, { toValue: 1, duration: AUTO_MS, useNativeDriver: true });
    run.start(({ finished }) => {
      if (!finished) return;
      const next = (index + 1) % BANNERS.length;
      listRef.current?.scrollTo({ x: next * step, animated: true });
      setIndex(next);
    });
    return () => run.stop();
  }, [index, paused, reduced, progress, step]);

  return (
    <View style={[styles.wrap, { marginHorizontal: -gutter }]}>
      <Animated.ScrollView
        ref={listRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: gutter, gap }}
        decelerationRate="fast"
        snapToInterval={step}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: true })}
        onScrollBeginDrag={() => setPaused(true)}
        onMomentumScrollEnd={(e) => {
          const i = Math.max(0, Math.min(BANNERS.length - 1, Math.round(e.nativeEvent.contentOffset.x / step)));
          setIndex(i);
          setPaused(false);
        }}
        scrollEventThrottle={16}
      >
        {BANNERS.map((b, i) => {
          const input = [(i - 1) * step, i * step, (i + 1) * step];
          return (
            <Animated.View
              key={b.id}
              style={[
                styles.card,
                {
                  width: cardW,
                  backgroundColor: b.bg,
                  transform: [{ scale: scrollX.interpolate({ inputRange: input, outputRange: [0.94, 1, 0.94], extrapolate: 'clamp' }) }],
                },
              ]}
            >
              <Animated.View
                style={[
                  styles.mark,
                  {
                    transform: [
                      { rotate: scrollX.interpolate({ inputRange: input, outputRange: ['-25deg', '0deg', '25deg'], extrapolate: 'clamp' }) },
                    ],
                  },
                ]}
              >
                <GrabitMark size={190} variant="mono" color={b.mark} />
              </Animated.View>
              <View style={styles.textCol}>
                <Text maxFontSizeMultiplier={1.25} style={[styles.title, { color: b.fg }]}>{b.title}</Text>
                <Text maxFontSizeMultiplier={1.3} style={[styles.subtitle, { color: b.fg }]}>{b.subtitle}</Text>
                <PressableScale
                  hapticFeedback
                  onPress={() => Alert.alert(b.cta, 'Promo applied to your next order (demo).')}
                  style={[styles.cta, { backgroundColor: b.ctaBg }]}
                  accessibilityRole="button"
                >
                  <Text maxFontSizeMultiplier={1.25} style={[styles.ctaText, { color: b.ctaFg }]}>{b.cta}</Text>
                </PressableScale>
              </View>
              <Animated.Image
                source={{ uri: b.image }}
                style={[
                  styles.image,
                  {
                    transform: [
                      { translateX: scrollX.interpolate({ inputRange: input, outputRange: [-24, 0, 24], extrapolate: 'clamp' }) },
                      { rotate: scrollX.interpolate({ inputRange: input, outputRange: ['-12deg', '0deg', '12deg'], extrapolate: 'clamp' }) },
                    ],
                  },
                ]}
              />
            </Animated.View>
          );
        })}
      </Animated.ScrollView>
      <View style={styles.dots}>
        {BANNERS.map((b, i) =>
          i === index ? (
            <View key={b.id} style={styles.track}>
              <Animated.View
                style={[
                  styles.fill,
                  {
                    transform: [
                      { translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [-TRACK_W, 0] }) },
                    ],
                  },
                  (paused || reduced) && { transform: [{ translateX: 0 }] },
                ]}
              />
            </View>
          ) : (
            <Pressable
              key={b.id}
              hitSlop={8}
              accessibilityLabel={`Show promo ${i + 1}`}
              onPress={() => {
                listRef.current?.scrollTo({ x: i * step, animated: true });
                setIndex(i);
              }}
            >
              <View style={styles.dot} />
            </Pressable>
          ),
        )}
      </View>
    </View>
  );
}

const TRACK_W = 26;

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.xl },
  card: {
    minHeight: 160,
    borderRadius: radii.xl,
    flexDirection: 'row',
    overflow: 'hidden',
    padding: spacing.lg + 2,
  },
  mark: { position: 'absolute', right: -50, bottom: -60 },
  textCol: { flex: 1, justifyContent: 'center', paddingRight: spacing.sm },
  title: { fontFamily: fonts.display, fontSize: 21, lineHeight: 24, letterSpacing: -0.4, marginBottom: spacing.xs },
  subtitle: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, opacity: 0.9, marginBottom: spacing.md },
  cta: { alignSelf: 'flex-start', paddingVertical: spacing.sm + 1, paddingHorizontal: spacing.lg, borderRadius: radii.pill },
  ctaText: { fontFamily: fonts.bold, fontSize: 14 },
  image: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignSelf: 'flex-end',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.85)',
  },
  dots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: spacing.md },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: brand.basil, opacity: 0.3 },
  track: { width: TRACK_W, height: 6, borderRadius: 3, backgroundColor: 'rgba(14,124,74,0.22)', overflow: 'hidden' },
  fill: { width: TRACK_W, height: 6, borderRadius: 3, backgroundColor: brand.basil },
});
