import { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useOnboardingGate } from '../context/OnboardingGateContext';
import { colors, radii, spacing, typography } from '../theme';

const { width: W } = Dimensions.get('window');

const SLIDES = [
  {
    key: '1',
    title: 'Shop from supermarkets near you',
    body: 'Users can browse trusted supermarkets around their location and shop from the one they prefer.',
    image:
      'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&q=80',
    footer: 'Start saving with ₦0 delivery fee*',
  },
  {
    key: '2',
    title: 'Everything you need in one place',
    body: 'Groceries, drinks, toiletries, household items, snacks, baby products, cleaning items, and more.',
    image:
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80',
    footer: '',
  },
  {
    key: '3',
    title: 'Fast delivery to your doorstep',
    body: 'Place your order, leave delivery instructions, and track your rider in real time.',
    image:
      'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80',
    footer: '',
  },
];

export function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { markHasSeenOnboarding } = useOnboardingGate();
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  const finish = async () => {
    await markHasSeenOnboarding();
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / W);
    if (i !== index) setIndex(i);
  };

  const goNext = () => {
    if (index < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1, animated: true });
    } else {
      finish();
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.topRow}>
        <Text style={styles.logo}>Goshop</Text>
        <Pressable onPress={finish} style={styles.skipBtn}>
          <Text style={styles.skipTxt}>SKIP</Text>
        </Pressable>
      </View>
      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        getItemLayout={(_, i) => ({
          length: W,
          offset: W * i,
          index: i,
        })}
        onScrollToIndexFailed={({ index }) => {
          requestAnimationFrame(() => {
            listRef.current?.scrollToIndex({ index, animated: true });
          });
        }}
        renderItem={({ item }) => (
          <View style={{ width: W }}>
            <View style={styles.heroPad}>
              <View style={styles.heroCard}>
                <Image source={{ uri: item.image }} style={styles.heroImg} />
                <View style={styles.heroBadge}>
                  <View style={styles.heroIcon}>
                    <Ionicons name="bag-handle" size={20} color={colors.surface} />
                  </View>
                  <View>
                    <Text style={styles.heroBadgeTitle}>Fresh Groceries</Text>
                    <Text style={styles.heroBadgeSub}>Delivered in 30 mins</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}
      />
      <View style={[styles.bottomCard, { paddingBottom: insets.bottom + spacing.lg }]}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={i === index ? styles.dotActive : styles.dot}
            />
          ))}
        </View>
        <Text style={styles.cardTitle}>{SLIDES[index].title}</Text>
        <Text style={styles.cardBody}>{SLIDES[index].body}</Text>
        <Pressable style={styles.primary} onPress={goNext}>
          <Text style={styles.primaryTxt}>
            {index === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color={colors.surface} />
        </Pressable>
        {index === SLIDES.length - 1 ? (
          <Pressable onPress={() => listRef.current?.scrollToIndex({ index: 1, animated: true })}>
            <Text style={styles.backLink}>Back</Text>
          </Pressable>
        ) : index === 1 ? (
          <Pressable onPress={finish}>
            <Text style={styles.backLink}>Skip</Text>
          </Pressable>
        ) : SLIDES[index].footer ? (
          <Text style={styles.footer}>
            Start saving with <Text style={styles.footerBold}>₦0</Text> delivery fee*
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  logo: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
  },
  skipBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
  },
  skipTxt: {
    color: colors.textSecondary,
    fontWeight: '700',
    fontSize: 12,
  },
  heroPad: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  heroCard: {
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    ...{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
  },
  heroImg: {
    width: '100%',
    height: 280,
    backgroundColor: colors.border,
  },
  heroBadge: {
    position: 'absolute',
    left: spacing.lg,
    bottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.92)',
    padding: spacing.md,
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
  heroBadgeTitle: {
    fontWeight: '700',
    color: colors.text,
    fontSize: 15,
  },
  heroBadgeSub: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  bottomCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    marginTop: -spacing.lg,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 28,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  cardTitle: {
    ...typography.sectionTitle,
    textAlign: 'center',
    color: colors.text,
    marginBottom: spacing.md,
  },
  cardBody: {
    ...typography.body,
    textAlign: 'center',
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  primary: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  primaryTxt: {
    color: colors.surface,
    fontWeight: '700',
    fontSize: 16,
  },
  footer: {
    textAlign: 'center',
    marginTop: spacing.lg,
    color: colors.textSecondary,
    fontSize: 13,
  },
  footerBold: {
    fontWeight: '800',
    color: colors.primary,
  },
  backLink: {
    textAlign: 'center',
    marginTop: spacing.lg,
    color: colors.primary,
    fontWeight: '600',
  },
});
