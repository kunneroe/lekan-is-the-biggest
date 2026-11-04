import { useRef } from 'react';
import { Alert, Animated, Image, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { brand, fonts, radii, spacing } from '../../theme';
import { GrabitMark } from '../brand/GrabitMark';
import { PressableScale } from '../motion/PressableScale';

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

export function PromoBannerCarousel() {
  const { width } = useWindowDimensions();
  const cardW = Math.min(width - 56, 360);
  const gap = spacing.md;
  const scrollX = useRef(new Animated.Value(0)).current;

  return (
    <View style={styles.wrap}>
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.xl, gap }}
        decelerationRate="fast"
        snapToInterval={cardW + gap}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
      >
        {BANNERS.map((b) => (
          <View key={b.id} style={[styles.card, { width: cardW, backgroundColor: b.bg }]}>
            <GrabitMark size={190} variant="mono" color={b.mark} style={styles.mark} />
            <View style={styles.textCol}>
              <Text style={[styles.title, { color: b.fg }]}>{b.title}</Text>
              <Text style={[styles.subtitle, { color: b.fg }]}>{b.subtitle}</Text>
              <PressableScale
                hapticFeedback
                onPress={() => Alert.alert(b.cta, 'Promo applied to your next order (demo).')}
                style={[styles.cta, { backgroundColor: b.ctaBg }]}
                accessibilityRole="button"
              >
                <Text style={[styles.ctaText, { color: b.ctaFg }]}>{b.cta}</Text>
              </PressableScale>
            </View>
            <Image source={{ uri: b.image }} style={styles.image} />
          </View>
        ))}
      </Animated.ScrollView>
      <View style={styles.dots}>
        {BANNERS.map((b, i) => {
          const input = [(i - 1) * (cardW + gap), i * (cardW + gap), (i + 1) * (cardW + gap)];
          return (
            <Animated.View
              key={b.id}
              style={[
                styles.dot,
                {
                  opacity: scrollX.interpolate({ inputRange: input, outputRange: [0.3, 1, 0.3], extrapolate: 'clamp' }),
                  transform: [
                    { scaleX: scrollX.interpolate({ inputRange: input, outputRange: [1, 2.6, 1], extrapolate: 'clamp' }) },
                  ],
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginHorizontal: -spacing.xl, marginBottom: spacing.xl },
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
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: spacing.md },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: brand.basil },
});
