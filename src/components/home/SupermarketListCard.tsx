import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import {
  getSupermarketEta,
  getSupermarketImageUrl,
  type ApiSupermarket,
} from '../../utils/catalogFormat';
import { brand, colors, fonts, radii, shadows, spacing, typography } from '../../theme';
import { ProductImage } from '../ProductImage';
import { PressableScale } from '../motion/PressableScale';

type Props = {
  store: ApiSupermarket;
  onPress?: () => void;
};

export function SupermarketListCard({ store, onPress }: Props) {
  const { min, max } = getSupermarketEta(store);
  const fee = Number(store.deliveryFee || 0);
  const closed = store.status === 'INACTIVE' || store.status === 'CLOSED';

  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.97}
      accessibilityRole="button"
      accessibilityLabel={`${store.name}, ${closed ? 'closed' : 'open'}`}
      style={styles.card}
    >
      <View>
        <ProductImage uri={getSupermarketImageUrl(store)} style={styles.image} label={store.name} />
        <View style={styles.topRow}>
          <View style={styles.rating}>
            <Ionicons name="star" size={12} color={colors.star} />
            <Text style={styles.ratingText}>{Number(store.rating || 0).toFixed(1)}</Text>
          </View>
          <View style={[styles.status, closed ? styles.statusClosed : styles.statusOpen]}>
            <View style={[styles.statusDot, { backgroundColor: closed ? colors.danger : brand.lime }]} />
            <Text style={[styles.statusTxt, closed && { color: colors.danger }]}>{closed ? 'Closed' : 'Open'}</Text>
          </View>
        </View>
      </View>
      <View style={styles.body}>
        <Text style={[styles.name, typography.storeName]} numberOfLines={1}>
          {store.name}
        </Text>
        <View style={styles.metaRow}>
          <View style={styles.meta}>
            <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.metaTxt} numberOfLines={1}>
              {store.area || store.city || 'Nearby'}
            </Text>
          </View>
          <View style={styles.meta}>
            <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.metaTxt}>
              {min}–{max} min
            </Text>
          </View>
          <View style={[styles.fee, fee === 0 && styles.feeFree]}>
            <Ionicons name="bicycle" size={14} color={colors.primaryDark} />
            <Text style={styles.feeTxt}>{fee === 0 ? 'Free' : `₦${fee.toLocaleString()}`}</Text>
          </View>
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...shadows.card,
  },
  image: { width: '100%', height: 150 },
  topRow: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.overlayWhite,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: radii.pill,
  },
  ratingText: { fontFamily: fonts.bold, fontSize: 12, color: colors.text },
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
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusTxt: { fontFamily: fonts.bold, fontSize: 12, color: brand.oat },
  body: { padding: spacing.lg, gap: spacing.sm },
  name: { color: colors.text },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flexWrap: 'wrap' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 1 },
  metaTxt: { fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary },
  fee: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.mint,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.pill,
    marginLeft: 'auto',
  },
  feeFree: { backgroundColor: brand.lime },
  feeTxt: { fontFamily: fonts.bold, fontSize: 12, color: colors.primaryDark },
});
