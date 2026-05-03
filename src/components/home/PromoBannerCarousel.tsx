import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, radii, spacing, typography } from '../../theme';

const GREEN_IMG =
  'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80';

type Banner = {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  backgroundColor: string;
  image: string;
  ctaStyle: 'darkOnLight' | 'lightOnDark';
};

const BANNERS: Banner[] = [
  {
    id: '1',
    title: 'Free delivery on your first order',
    subtitle: 'Enjoy zero delivery fees on all local markets today.',
    cta: 'Claim Now',
    backgroundColor: colors.primaryDark,
    image: GREEN_IMG,
    ctaStyle: 'darkOnLight',
  },
  {
    id: '2',
    title: 'Weekend flash deals',
    subtitle: 'Save on pantry staples from partner stores.',
    cta: 'Shop Deals',
    backgroundColor: colors.bannerOrange,
    image:
      'https://images.unsplash.com/photo-1606787366850-de6330120b65?w=800&q=80',
    ctaStyle: 'lightOnDark',
  },
];

export function PromoBannerCarousel() {
  return (
    <ScrollView
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.carousel}
      decelerationRate="fast"
      snapToInterval={316}
    >
      {BANNERS.map((b) => (
        <View
          key={b.id}
          style={[styles.card, { backgroundColor: b.backgroundColor }]}
        >
          <View style={styles.textCol}>
            <Text style={[styles.title, typography.bannerTitle]}>{b.title}</Text>
            <Text style={[styles.subtitle, typography.bannerSubtitle]}>
              {b.subtitle}
            </Text>
            <Pressable
              style={[
                styles.cta,
                b.ctaStyle === 'darkOnLight'
                  ? styles.ctaLight
                  : styles.ctaDark,
              ]}
              onPress={() =>
                Alert.alert(b.cta, 'Promo applied to your next order (demo).')
              }
            >
              <Text
                style={[
                  styles.ctaText,
                  b.ctaStyle === 'darkOnLight'
                    ? styles.ctaTextDark
                    : styles.ctaTextLight,
                ]}
              >
                {b.cta}
              </Text>
            </Pressable>
          </View>
          <View style={styles.imageCol}>
            <Image source={{ uri: b.image }} style={styles.bannerImage} />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const CARD_W = 300;

const styles = StyleSheet.create({
  carousel: {
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  card: {
    width: CARD_W,
    minHeight: 140,
    borderRadius: radii.lg,
    flexDirection: 'row',
    overflow: 'hidden',
    padding: spacing.lg,
  },
  textCol: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: spacing.sm,
  },
  title: {
    color: colors.surface,
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  cta: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
  },
  ctaLight: {
    backgroundColor: colors.surface,
  },
  ctaDark: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '700',
  },
  ctaTextDark: {
    color: colors.text,
  },
  ctaTextLight: {
    color: colors.surface,
  },
  imageCol: {
    width: 88,
    justifyContent: 'flex-end',
  },
  bannerImage: {
    width: 88,
    height: 88,
    borderRadius: radii.md,
  },
});
