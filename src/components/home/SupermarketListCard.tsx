import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Supermarket } from '../../data/supermarkets';
import { colors, radii, shadows, spacing, typography } from '../../theme';

type Props = {
  store: Supermarket;
  onPress?: () => void;
};

export function SupermarketListCard({ store, onPress }: Props) {
  const eta = `${store.etaMin} - ${store.etaMax} mins`;
  const fee = `₦${Number(store.deliveryFee || 0).toLocaleString()} delivery`;
  const [imgErr, setImgErr] = useState(false);
  const fallback = 'https://placehold.co/150x150/png?text=No+Image';

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && { opacity: 0.92 }]}>
      <View style={styles.card}>
        <View style={styles.imageWrap}>
          <Image 
            source={{ uri: imgErr || !store.image ? fallback : store.image }} 
            style={styles.image} 
            onError={() => setImgErr(true)}
          />
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color={colors.star} />
            <Text style={styles.ratingText}>{Number(store.rating || 0).toFixed(1)}</Text>
          </View>
        </View>
        <View style={styles.body}>
          <View style={styles.rowTop}>
            <Text style={[styles.name, typography.storeName]} numberOfLines={2}>
              {store.name}
            </Text>
            <Text style={styles.open}>OPEN</Text>
          </View>
          <Text style={[styles.meta, typography.meta]}>
            {store.area} • {eta}
          </Text>
          <View style={styles.feeRow}>
            <Ionicons name="bicycle-outline" size={16} color={colors.primary} />
            <Text style={[styles.fee, typography.deliveryFee]}>{fee}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...shadows.card,
  },
  imageWrap: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 140,
    backgroundColor: colors.border,
  },
  ratingBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.overlayWhite,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  body: {
    padding: spacing.lg,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  name: {
    flex: 1,
    color: colors.text,
  },
  open: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.open,
    letterSpacing: 0.5,
  },
  meta: {
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  feeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fee: {
    color: colors.primary,
  },
});
