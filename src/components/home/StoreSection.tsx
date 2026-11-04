import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { brand, colors, fonts, radii, spacing } from '../../theme';
import { haptic } from '../../utils/haptics';
import { useLayout } from '../../utils/responsive';
import { GrabitLoader } from '../brand/GrabitLoader';
import { EmptyState } from '../common/EmptyState';
import { FadeInUp } from '../motion/FadeInUp';
import { StoreCardSkeleton } from '../motion/Skeleton';
import type { FilterState } from './FilterPanelModal';
import { SupermarketListCard } from './SupermarketListCard';

export type StoreLayout = 'featured' | 'carousel' | 'grid';
const LAYOUT_KEY = '@grabit_store_layout';

const LAYOUTS: { id: StoreLayout; icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string }[] = [
  { id: 'featured', icon: 'view-agenda-outline', label: 'Featured list' },
  { id: 'carousel', icon: 'view-carousel-outline', label: 'Swipe cards' },
  { id: 'grid', icon: 'view-grid-outline', label: 'Grid' },
];

type Props = {
  stores: any[];
  /** all stores before filters, for the "open now" count */
  allStores: any[];
  loading: boolean;
  refreshing: boolean;
  filters: FilterState;
  onChangeFilters: (f: FilterState) => void;
  onClearFilters: () => void;
  onOpenStore: (id: string) => void;
  onSeeAll: () => void;
};

/**
 * Supermarkets near you, with three arrangements the shopper can switch between
 * (remembered on the device), quick filter chips, and a full-width "See all" button.
 */
export function StoreSection({
  stores,
  allStores,
  loading,
  refreshing,
  filters,
  onChangeFilters,
  onClearFilters,
  onOpenStore,
  onSeeAll,
}: Props) {
  const { width, gutter } = useLayout();
  const [layout, setLayout] = useState<StoreLayout>('featured');

  useEffect(() => {
    AsyncStorage.getItem(LAYOUT_KEY)
      .then((v) => {
        if (v === 'featured' || v === 'carousel' || v === 'grid') setLayout(v);
      })
      .catch(() => {});
  }, []);

  const pickLayout = (l: StoreLayout) => {
    if (l === layout) return;
    haptic.select();
    setLayout(l);
    AsyncStorage.setItem(LAYOUT_KEY, l).catch(() => {});
  };

  const openCount = allStores.filter((s) => s.status === 'ACTIVE').length;
  const chips: { key: string; label: string; icon: keyof typeof Ionicons.glyphMap; on: boolean; toggle: () => void }[] = [
    {
      key: 'all',
      label: 'All',
      icon: 'apps',
      on: !filters.openNowOnly && !filters.freeDeliveryOnly && !filters.sortByRating,
      toggle: () => onChangeFilters({ ...filters, openNowOnly: false, freeDeliveryOnly: false, sortByRating: false }),
    },
    {
      key: 'open',
      label: 'Open now',
      icon: 'time',
      on: filters.openNowOnly,
      toggle: () => onChangeFilters({ ...filters, openNowOnly: !filters.openNowOnly }),
    },
    {
      key: 'free',
      label: 'Free delivery',
      icon: 'bicycle',
      on: filters.freeDeliveryOnly,
      toggle: () => onChangeFilters({ ...filters, freeDeliveryOnly: !filters.freeDeliveryOnly }),
    },
    {
      key: 'top',
      label: 'Top rated',
      icon: 'star',
      on: filters.sortByRating,
      toggle: () => onChangeFilters({ ...filters, sortByRating: !filters.sortByRating }),
    },
  ];

  return (
    <View>
      <View style={styles.head}>
        <View style={styles.headText}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={2} maxFontSizeMultiplier={1.25}>
              Supermarkets near you
            </Text>
            {refreshing ? <GrabitLoader size={18} /> : null}
          </View>
          {!loading ? (
            <Text style={styles.sub} maxFontSizeMultiplier={1.3}>
              {allStores.length} {allStores.length === 1 ? 'store' : 'stores'} · {openCount} open now
            </Text>
          ) : null}
        </View>
        <LayoutToggle value={layout} onChange={pickLayout} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginHorizontal: -gutter }}
        contentContainerStyle={{ paddingHorizontal: gutter, gap: spacing.sm, paddingBottom: spacing.lg }}
      >
        {chips.map((c) => (
          <Pressable
            key={c.key}
            onPress={() => {
              haptic.select();
              c.toggle();
            }}
            style={({ pressed }) => [styles.chip, c.on && styles.chipOn, pressed && { transform: [{ scale: 0.95 }] }]}
            accessibilityRole="button"
            accessibilityState={{ selected: c.on }}
          >
            <Ionicons name={c.icon} size={14} color={c.on ? brand.lime : colors.textSecondary} />
            <Text style={[styles.chipTxt, c.on && styles.chipTxtOn]} maxFontSizeMultiplier={1.25}>
              {c.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {loading ? (
        [0, 1].map((i) => <StoreCardSkeleton key={i} index={i} />)
      ) : stores.length === 0 ? (
        <EmptyState
          art="search"
          title="No stores match your filters"
          body="Try adjusting or clearing your filters to see more stores."
          actionLabel="Clear filters"
          onAction={onClearFilters}
        />
      ) : (
        <View key={layout}>
          {layout === 'featured' ? (
            <>
              <FadeInUp>
                <SupermarketListCard variant="hero" store={stores[0]} onPress={() => onOpenStore(stores[0].id)} />
              </FadeInUp>
              {stores.slice(1).map((s, i) => (
                <FadeInUp key={s.id} index={i + 1} distance={12}>
                  <SupermarketListCard variant="row" store={s} onPress={() => onOpenStore(s.id)} />
                </FadeInUp>
              ))}
            </>
          ) : layout === 'carousel' ? (
            <StoreCarousel stores={stores} width={width} gutter={gutter} onOpenStore={onOpenStore} />
          ) : (
            <View style={styles.grid}>
              {stores.map((s, i) => (
                <FadeInUp key={s.id} index={i} style={styles.gridCell}>
                  <SupermarketListCard variant="tile" store={s} onPress={() => onOpenStore(s.id)} />
                </FadeInUp>
              ))}
            </View>
          )}
        </View>
      )}

      {!loading && stores.length > 0 ? (
        <Pressable
          onPress={onSeeAll}
          style={({ pressed }) => [styles.seeAll, pressed && { opacity: 0.75 }]}
          accessibilityRole="button"
        >
          <Text style={styles.seeAllTxt} maxFontSizeMultiplier={1.3}>
            See all supermarkets
          </Text>
          <View style={styles.seeAllIcon}>
            <Ionicons name="arrow-forward" size={16} color={brand.oat} />
          </View>
        </Pressable>
      ) : null}
    </View>
  );
}

/** Three icons in a pill; a Forest highlight slides to the chosen one. */
function LayoutToggle({ value, onChange }: { value: StoreLayout; onChange: (l: StoreLayout) => void }) {
  const idx = LAYOUTS.findIndex((l) => l.id === value);
  const slide = useRef(new Animated.Value(idx)).current;
  useEffect(() => {
    Animated.spring(slide, { toValue: idx, friction: 7, tension: 120, useNativeDriver: true }).start();
  }, [idx, slide]);
  const BTN = 36;
  return (
    <View style={styles.toggle} accessibilityRole="radiogroup" accessibilityLabel="Store layout">
      <Animated.View
        style={[
          styles.toggleKnob,
          { width: BTN, height: BTN, transform: [{ translateX: slide.interpolate({ inputRange: [0, 2], outputRange: [0, BTN * 2] }) }] },
        ]}
      />
      {LAYOUTS.map((l) => {
        const on = l.id === value;
        return (
          <Pressable
            key={l.id}
            onPress={() => onChange(l.id)}
            style={{ width: BTN, height: BTN, alignItems: 'center', justifyContent: 'center' }}
            accessibilityRole="radio"
            accessibilityLabel={l.label}
            accessibilityState={{ checked: on }}
            hitSlop={4}
          >
            <MaterialCommunityIcons name={l.icon} size={19} color={on ? brand.lime : colors.textSecondary} />
          </Pressable>
        );
      })}
    </View>
  );
}

/** Swipeable cards; the centred one is full size, its neighbours sit back a little. */
function StoreCarousel({
  stores,
  width,
  gutter,
  onOpenStore,
}: {
  stores: any[];
  width: number;
  gutter: number;
  onOpenStore: (id: string) => void;
}) {
  const cardW = Math.min(Math.round(width * 0.78), 340);
  const gap = spacing.md;
  const x = useRef(new Animated.Value(0)).current;
  const [active, setActive] = useState(0);

  return (
    <View style={{ marginHorizontal: -gutter, marginBottom: spacing.sm }}>
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={cardW + gap}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: gutter, gap, paddingVertical: spacing.sm }}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x } } }], { useNativeDriver: true })}
        onMomentumScrollEnd={(e) => {
          const i = Math.round(e.nativeEvent.contentOffset.x / (cardW + gap));
          if (i !== active) {
            haptic.select();
            setActive(i);
          }
        }}
        scrollEventThrottle={16}
      >
        {stores.map((s, i) => {
          const input = [(i - 1) * (cardW + gap), i * (cardW + gap), (i + 1) * (cardW + gap)];
          return (
            <Animated.View
              key={s.id}
              style={{
                transform: [
                  { scale: x.interpolate({ inputRange: input, outputRange: [0.92, 1, 0.92], extrapolate: 'clamp' }) },
                  { translateY: x.interpolate({ inputRange: input, outputRange: [10, 0, 10], extrapolate: 'clamp' }) },
                ],
                opacity: x.interpolate({ inputRange: input, outputRange: [0.75, 1, 0.75], extrapolate: 'clamp' }),
              }}
            >
              <SupermarketListCard variant="slide" width={cardW} store={s} onPress={() => onOpenStore(s.id)} />
            </Animated.View>
          );
        })}
      </Animated.ScrollView>
      <View style={styles.counter}>
        {stores.slice(0, 8).map((s, i) => (
          <View key={s.id} style={[styles.counterDot, i === Math.min(active, 7) && styles.counterDotOn]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  headText: { flex: 1, minWidth: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { flexShrink: 1, fontFamily: fonts.display, fontSize: 20, lineHeight: 23, letterSpacing: -0.4, color: colors.text },
  sub: { fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  toggle: {
    flexDirection: 'row',
    backgroundColor: colors.sand,
    borderRadius: radii.pill,
    padding: 3,
  },
  toggleKnob: { position: 'absolute', top: 3, left: 3, borderRadius: radii.pill, backgroundColor: brand.forest },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipOn: { backgroundColor: brand.forest, borderColor: brand.forest },
  chipTxt: { fontFamily: fonts.semibold, fontSize: 13, color: colors.text },
  chipTxtOn: { color: brand.oat },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: spacing.md },
  gridCell: { width: '48.3%' },
  counter: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: spacing.sm },
  counterDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.border },
  counterDotOn: { width: 18, backgroundColor: brand.basil },
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.mintStrong,
    backgroundColor: colors.surface,
  },
  seeAllTxt: { fontFamily: fonts.bold, fontSize: 15, color: colors.primary },
  seeAllIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
