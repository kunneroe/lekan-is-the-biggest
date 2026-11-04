import { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GrabitAppTile } from '../components/brand/GrabitMark';
import { GrabitLogo } from '../components/brand/GrabitWordmark';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { useOnboardingGate } from '../context/OnboardingGateContext';
import { brand, colors, fonts, radii, shadows, spacing } from '../theme';
import { haptic } from '../utils/haptics';

const { width: W, height: H } = Dimensions.get('window');
const HERO_H = Math.max(280, Math.min(H * 0.46, 440));

const SLIDES = [
  {
    key: '1',
    title: 'Shop from supermarkets near you',
    body: 'Browse trusted supermarkets around you and shop from the one you love.',
    image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&q=80',
    chip: { icon: 'storefront' as const, title: 'Local stores', sub: 'Right around the corner' },
    footer: 'Start saving with ₦0 delivery fee*',
  },
  {
    key: '2',
    title: 'Everything you need, one grab away',
    body: 'Groceries, drinks, toiletries, household items, snacks, baby products, cleaning items and more.',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80',
    chip: { icon: 'basket' as const, title: 'Fresh groceries', sub: 'Picked with care' },
    footer: '',
  },
  {
    key: '3',
    title: 'Fast delivery to your door',
    body: 'Place your order, leave delivery instructions, and track your rider in real time.',
    image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80',
    chip: { icon: 'bicycle' as const, title: 'Live tracking', sub: 'Delivered in 30 mins' },
    footer: '',
  },
];

export function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { markHasSeenOnboarding } = useOnboardingGate();
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(1)).current;

  const finish = async () => {
    haptic.tap();
    await markHasSeenOnboarding();
  };

  const onScroll = Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
    useNativeDriver: true,
    listener: (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const i = Math.round(e.nativeEvent.contentOffset.x / W);
      if (i !== index && i >= 0 && i < SLIDES.length) {
        setIndex(i);
        textAnim.setValue(0);
        Animated.spring(textAnim, { toValue: 1, friction: 8, tension: 80, useNativeDriver: true }).start();
      }
    },
  });

  const goNext = () => {
    haptic.tap();
    if (index < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1, animated: true });
    } else {
      finish();
    }
  };

  const slide = SLIDES[index];

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.topRow}>
        <GrabitLogo size={22} />
        <Pressable onPress={finish} style={styles.skipBtn} accessibilityRole="button">
          <Text style={styles.skipTxt}>Skip</Text>
        </Pressable>
      </View>
      <Animated.FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        getItemLayout={(_, i) => ({ length: W, offset: W * i, index: i })}
        onScrollToIndexFailed={({ index: failed }) => {
          requestAnimationFrame(() => {
            listRef.current?.scrollToIndex({ index: failed, animated: true });
          });
        }}
        renderItem={({ item, index: i }) => {
          const input = [(i - 1) * W, i * W, (i + 1) * W];
          return (
            <View style={{ width: W }}>
              <View style={styles.heroPad}>
                <View style={styles.heroCard}>
                  <Animated.Image
                    source={{ uri: item.image }}
                    style={[
                      styles.heroImg,
                      {
                        transform: [
                          { translateX: scrollX.interpolate({ inputRange: input, outputRange: [-W * 0.25, 0, W * 0.25] }) },
                          { scale: scrollX.interpolate({ inputRange: input, outputRange: [1.25, 1.1, 1.25] }) },
                        ],
                      },
                    ]}
                  />
                  <Animated.View
                    style={[
                      styles.heroBadge,
                      {
                        transform: [
                          { translateY: scrollX.interpolate({ inputRange: input, outputRange: [40, 0, 40], extrapolate: 'clamp' }) },
                        ],
                        opacity: scrollX.interpolate({ inputRange: input, outputRange: [0, 1, 0], extrapolate: 'clamp' }),
                      },
                    ]}
                  >
                    <View style={styles.heroIcon}>
                      <Ionicons name={item.chip.icon} size={20} color={brand.oat} />
                    </View>
                    <View>
                      <Text style={styles.heroBadgeTitle}>{item.chip.title}</Text>
                      <Text style={styles.heroBadgeSub}>{item.chip.sub}</Text>
                    </View>
                  </Animated.View>
                  <GrabitAppTile size={48} style={styles.heroTile} />
                </View>
              </View>
            </View>
          );
        }}
      />
      <View style={[styles.bottomCard, { paddingBottom: insets.bottom + spacing.lg }]}>
        <View style={styles.dots}>
          {SLIDES.map((s, i) => {
            const input = [(i - 1) * W, i * W, (i + 1) * W];
            return (
              <Animated.View
                key={s.key}
                style={[
                  styles.dot,
                  {
                    opacity: scrollX.interpolate({ inputRange: input, outputRange: [0.3, 1, 0.3], extrapolate: 'clamp' }),
                    transform: [{ scaleX: scrollX.interpolate({ inputRange: input, outputRange: [1, 3, 1], extrapolate: 'clamp' }) }],
                  },
                ]}
              />
            );
          })}
        </View>
        <Animated.View
          style={{
            opacity: textAnim,
            transform: [{ translateY: textAnim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
          }}
        >
          <Text maxFontSizeMultiplier={1.25} style={styles.cardTitle}>{slide.title}</Text>
          <Text style={styles.cardBody}>{slide.body}</Text>
        </Animated.View>
        <PrimaryButton label={index === SLIDES.length - 1 ? 'Get started' : 'Next'} icon="arrow-forward" onPress={goNext} />
        {index === SLIDES.length - 1 ? (
          <Pressable onPress={() => listRef.current?.scrollToIndex({ index: 1, animated: true })} hitSlop={8}>
            <Text style={styles.backLink}>Back</Text>
          </Pressable>
        ) : slide.footer ? (
          <Text style={styles.footer}>
            Start saving with <Text style={styles.footerBold}>₦0</Text> delivery fee*
          </Text>
        ) : (
          <Pressable onPress={finish} hitSlop={8}>
            <Text style={styles.backLink}>Skip intro</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  skipBtn: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    ...shadows.soft,
  },
  skipTxt: { fontFamily: fonts.bold, color: colors.textSecondary, fontSize: 13 },
  heroPad: { paddingHorizontal: spacing.xl, paddingTop: spacing.md },
  heroCard: {
    borderRadius: radii.xxl,
    overflow: 'hidden',
    backgroundColor: colors.sand,
    height: HERO_H,
    ...shadows.card,
  },
  heroImg: { width: '100%', height: '100%' },
  heroTile: { position: 'absolute', top: spacing.lg, right: spacing.lg },
  heroBadge: {
    position: 'absolute',
    left: spacing.lg,
    bottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.overlayWhite,
    padding: spacing.md,
    paddingRight: spacing.lg,
    borderRadius: radii.lg,
  },
  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBadgeTitle: { fontFamily: fonts.bold, color: colors.text, fontSize: 15 },
  heroBadgeSub: { fontFamily: fonts.regular, color: colors.textSecondary, fontSize: 13 },
  bottomCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    marginTop: -spacing.lg,
    ...shadows.lifted,
  },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 14, marginBottom: spacing.lg },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  cardTitle: {
    fontFamily: fonts.display,
    fontSize: 27,
    lineHeight: 30,
    letterSpacing: -0.7,
    textAlign: 'center',
    color: colors.text,
    marginBottom: spacing.md,
  },
  cardBody: {
    fontFamily: fonts.regular,
    fontSize: 15,
    textAlign: 'center',
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  footer: { fontFamily: fonts.regular, textAlign: 'center', marginTop: spacing.lg, color: colors.textSecondary, fontSize: 13 },
  footerBold: { fontFamily: fonts.black, color: colors.primary },
  backLink: { fontFamily: fonts.bold, textAlign: 'center', marginTop: spacing.lg, color: colors.primary, fontSize: 14 },
});
