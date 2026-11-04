import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import {
  getSupermarketEta,
  getSupermarketImageUrl,
  type ApiSupermarket,
} from '../../utils/catalogFormat';
import { brand, colors, fonts, radii, shadows, spacing, typography } from '../../theme';
import { useReducedMotion } from '../../utils/motion';
import { useLayout } from '../../utils/responsive';
import { ProductImage } from '../ProductImage';
import { PressableScale } from '../motion/PressableScale';

export type StoreCardVariant = 'card' | 'hero' | 'row' | 'tile' | 'slide';

type Props = {
  store: ApiSupermarket;
  onPress?: () => void;
  /** card: full-width list card · hero: big featured · row: compact list · tile: grid · slide: carousel */
  variant?: StoreCardVariant;
  /** width for the slide variant */
  width?: number;
};

function useStoreInfo(store: ApiSupermarket) {
  const { min, max } = getSupermarketEta(store);
  const fee = Number(store.deliveryFee || 0);
  const closed = store.status === 'INACTIVE' || store.status === 'CLOSED';
  return {
    eta: `${min}–${max} min`,
    fee,
    feeLabel: fee === 0 ? 'Free delivery' : `₦${fee.toLocaleString()}`,
    closed,
    rating: Number(store.rating || 0).toFixed(1),
    area: store.area || store.city || 'Nearby',
    image: getSupermarketImageUrl(store),
  };
}

/** Lime dot with a soft pulse — "open right now". */
function LiveDot({ color = brand.lime }: { color?: string }) {
  const v = useRef(new Animated.Value(0)).current;
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) return;
    const loop = Animated.loop(Animated.timing(v, { toValue: 1, duration: 1500, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [reduced, v]);
  return (
    <View style={styles.liveWrap}>
      <Animated.View
        style={[
          styles.livePulse,
          {
            backgroundColor: color,
            opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.7, 0] }),
            transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 2.6] }) }],
          },
        ]}
      />
      <View style={[styles.liveDot, { backgroundColor: color }]} />
    </View>
  );
}

function StatusPill({ closed, live = false }: { closed: boolean; live?: boolean }) {
  return (
    <View style={[styles.status, closed ? styles.statusClosed : styles.statusOpen]}>
      {closed ? (
        <View style={[styles.liveDot, { backgroundColor: colors.danger }]} />
      ) : live ? (
        <LiveDot />
      ) : (
        <View style={[styles.liveDot, { backgroundColor: brand.lime }]} />
      )}
      <Text style={[styles.statusTxt, closed && { color: colors.danger }]} maxFontSizeMultiplier={1.2}>
        {closed ? 'Closed' : 'Open'}
      </Text>
    </View>
  );
}

function Rating({ value, light = false }: { value: string; light?: boolean }) {
  return (
    <View style={[styles.rating, light && styles.ratingLight]}>
      <Ionicons name="star" size={12} color={colors.star} />
      <Text style={[styles.ratingText, light && { color: brand.oat }]} maxFontSizeMultiplier={1.2}>
        {value}
      </Text>
    </View>
  );
}

function FeeChip({ fee, label }: { fee: number; label: string }) {
  return (
    <View style={[styles.fee, fee === 0 && styles.feeFree]}>
      <Ionicons name="bicycle" size={13} color={colors.primaryDark} />
      <Text style={styles.feeTxt} numberOfLines={1} maxFontSizeMultiplier={1.2}>
        {label}
      </Text>
    </View>
  );
}

export function SupermarketListCard({ store, onPress, variant = 'card', width }: Props) {
  const info = useStoreInfo(store);
  const narrow = useLayout().isNarrow;
  const a11y = `${store.name}, ${info.closed ? 'closed' : 'open'}, ${info.eta}`;

  if (variant === 'hero') {
    return (
      <PressableScale onPress={onPress} scaleTo={0.97} accessibilityRole="button" accessibilityLabel={a11y} style={styles.hero}>
        <ProductImage uri={info.image} style={styles.heroImg} label={store.name} />
        <View style={styles.heroScrim} />
        <View style={styles.heroTop}>
          <View style={styles.pick}>
            <Ionicons name="sparkles" size={12} color={brand.forest} />
            <Text style={styles.pickTxt} maxFontSizeMultiplier={1.2}>
              Top pick near you
            </Text>
          </View>
          <StatusPill closed={info.closed} live />
        </View>
        <View style={styles.heroBottom}>
          <Text style={styles.heroName} numberOfLines={2} maxFontSizeMultiplier={1.25}>
            {store.name}
          </Text>
          <View style={styles.heroMeta}>
            <Rating value={info.rating} light />
            <Text style={styles.heroMetaTxt} numberOfLines={1} maxFontSizeMultiplier={1.3}>
              {info.area} · {info.eta}
            </Text>
          </View>
          <View style={{ alignSelf: 'flex-start', marginTop: spacing.sm }}>
            <FeeChip fee={info.fee} label={info.feeLabel} />
          </View>
        </View>
      </PressableScale>
    );
  }

  if (variant === 'row') {
    return (
      <PressableScale onPress={onPress} scaleTo={0.98} accessibilityRole="button" accessibilityLabel={a11y} style={styles.row}>
        <View>
          <ProductImage uri={info.image} style={[styles.rowImg, narrow && styles.rowImgSmall]} label={store.name} />
          {info.closed ? <View style={styles.rowClosedVeil} /> : null}
        </View>
        <View style={styles.rowBody}>
          <Text style={styles.rowName} numberOfLines={1} maxFontSizeMultiplier={1.25}>
            {store.name}
          </Text>
          <View style={styles.rowMeta}>
            <Rating value={info.rating} />
            <FeeChip fee={info.fee} label={info.fee === 0 ? 'Free' : info.feeLabel} />
          </View>
          <View style={styles.rowMeta}>
            <Ionicons name={info.closed ? 'moon-outline' : 'time-outline'} size={13} color={colors.textSecondary} />
            <Text style={styles.metaTxt} numberOfLines={1} maxFontSizeMultiplier={1.3}>
              {info.closed ? 'Closed now' : info.eta} · {info.area}
            </Text>
          </View>
        </View>
        {narrow ? null : <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />}
      </PressableScale>
    );
  }

  if (variant === 'tile') {
    return (
      <PressableScale onPress={onPress} scaleTo={0.96} accessibilityRole="button" accessibilityLabel={a11y} style={styles.tile}>
        <View>
          <ProductImage uri={info.image} style={styles.tileImg} label={store.name} />
          <View style={styles.tileBadges}>
            <Rating value={info.rating} />
          </View>
          {info.closed ? (
            <View style={styles.tileClosed}>
              <Text style={styles.tileClosedTxt}>Closed</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.tileBody}>
          <Text style={styles.tileName} numberOfLines={2} maxFontSizeMultiplier={1.2}>
            {store.name}
          </Text>
          <Text style={styles.metaTxt} numberOfLines={1} maxFontSizeMultiplier={1.3}>
            {info.eta}
          </Text>
          <View style={{ alignSelf: 'flex-start', marginTop: 6 }}>
            <FeeChip fee={info.fee} label={info.fee === 0 ? 'Free' : info.feeLabel} />
          </View>
        </View>
      </PressableScale>
    );
  }

  if (variant === 'slide') {
    return (
      <PressableScale
        onPress={onPress}
        scaleTo={0.97}
        accessibilityRole="button"
        accessibilityLabel={a11y}
        style={[styles.card, { width, marginBottom: 0 }]}
      >
        <View>
          <ProductImage uri={info.image} style={styles.slideImg} label={store.name} />
          <View style={styles.topRow}>
            <Rating value={info.rating} />
            <StatusPill closed={info.closed} live />
          </View>
        </View>
        <View style={styles.body}>
          <Text style={[styles.name, typography.storeName]} numberOfLines={1} maxFontSizeMultiplier={1.25}>
            {store.name}
          </Text>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
            <Text style={[styles.metaTxt, { flex: 1 }]} numberOfLines={1} maxFontSizeMultiplier={1.3}>
              {info.area} · {info.eta}
            </Text>
          </View>
          <View style={{ alignSelf: 'flex-start' }}>
            <FeeChip fee={info.fee} label={info.feeLabel} />
          </View>
        </View>
      </PressableScale>
    );
  }

  return (
    <PressableScale onPress={onPress} scaleTo={0.97} accessibilityRole="button" accessibilityLabel={a11y} style={styles.card}>
      <View>
        <ProductImage uri={info.image} style={styles.image} label={store.name} />
        <View style={styles.topRow}>
          <Rating value={info.rating} />
          <StatusPill closed={info.closed} />
        </View>
      </View>
      <View style={styles.body}>
        <Text style={[styles.name, typography.storeName]} numberOfLines={1} maxFontSizeMultiplier={1.25}>
          {store.name}
        </Text>
        <View style={styles.metaRow}>
          <View style={styles.meta}>
            <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.metaTxt} numberOfLines={1} maxFontSizeMultiplier={1.3}>
              {info.area}
            </Text>
          </View>
          <View style={styles.meta}>
            <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.metaTxt} maxFontSizeMultiplier={1.3}>
              {info.eta}
            </Text>
          </View>
          <FeeChip fee={info.fee} label={info.fee === 0 ? 'Free' : info.feeLabel} />
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  // shared
  liveWrap: { width: 8, height: 8, alignItems: 'center', justifyContent: 'center' },
  livePulse: { position: 'absolute', width: 8, height: 8, borderRadius: 4 },
  liveDot: { width: 7, height: 7, borderRadius: 4 },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: radii.pill,
  },
  statusOpen: { backgroundColor: brand.forest },
  statusClosed: { backgroundColor: colors.overlayWhite },
  statusTxt: { fontFamily: fonts.bold, fontSize: 12, color: brand.oat },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.overlayWhite,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.pill,
  },
  ratingLight: { backgroundColor: 'rgba(255,246,230,0.18)' },
  ratingText: { fontFamily: fonts.bold, fontSize: 12, color: colors.text },
  fee: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.mint,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.pill,
    flexShrink: 0,
  },
  feeFree: { backgroundColor: brand.lime },
  feeTxt: { fontFamily: fonts.bold, fontSize: 12, color: colors.primaryDark, flexShrink: 1 },
  metaTxt: { fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary, flexShrink: 1 },

  // card (classic full-width)
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...shadows.card,
  },
  image: { width: '100%', height: 150 },
  slideImg: { width: '100%', height: 168 },
  topRow: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  body: { padding: spacing.lg, gap: spacing.sm },
  name: { color: colors.text },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flexWrap: 'wrap' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 1 },

  // hero
  hero: {
    height: 230,
    borderRadius: radii.xl,
    overflow: 'hidden',
    marginBottom: spacing.md,
    backgroundColor: brand.forest,
    ...shadows.card,
  },
  heroImg: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  heroScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10,46,31,0.52)' },
  heroTop: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pick: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: brand.lime,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: radii.pill,
  },
  pickTxt: { fontFamily: fonts.bold, fontSize: 12, color: brand.forest },
  heroBottom: { position: 'absolute', left: spacing.lg, right: spacing.lg, bottom: spacing.lg },
  heroName: { fontFamily: fonts.display, fontSize: 24, lineHeight: 27, letterSpacing: -0.5, color: brand.oat },
  heroMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 6 },
  heroMetaTxt: { fontFamily: fonts.medium, fontSize: 13, color: brand.oat, flexShrink: 1 },

  // row (compact list)
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.sm + 2,
    paddingRight: spacing.md,
    marginBottom: spacing.sm + 2,
    ...shadows.soft,
  },
  rowImg: { width: 84, height: 84, borderRadius: radii.md },
  rowImgSmall: { width: 72, height: 72 },
  rowClosedVeil: { ...StyleSheet.absoluteFillObject, borderRadius: radii.md, backgroundColor: 'rgba(255,255,255,0.55)' },
  rowBody: { flex: 1, minWidth: 0, gap: 5 },
  rowName: { fontFamily: fonts.display, fontSize: 16, letterSpacing: -0.2, color: colors.text },
  rowMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },

  // tile (grid)
  tile: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    overflow: 'hidden',
    ...shadows.soft,
  },
  tileImg: { width: '100%', height: 112 },
  tileBadges: { position: 'absolute', top: spacing.sm, left: spacing.sm },
  tileClosed: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,46,31,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileClosedTxt: { fontFamily: fonts.bold, fontSize: 13, color: brand.oat },
  tileBody: { padding: spacing.md, gap: 3 },
  tileName: { fontFamily: fonts.display, fontSize: 15, lineHeight: 18, color: colors.text, minHeight: 36 },
});
