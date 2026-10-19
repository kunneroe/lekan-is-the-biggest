import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { navigateRoot } from '../../navigation/navigationRef';
import { orderService } from '../../services/orderService';
import { colors, radii, shadows, spacing, typography } from '../../theme';
import { cancellationText } from '../../utils/orderStatus';

export function OrderHistoryScreen() {
  const insets = useSafeAreaInsets();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService
      .getOrders({ pastOnly: true })
      .then((data) => setOrders(data.orders || data || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const list = [...orders].sort((a, b) =>
    (a.placedAt || a.createdAt) < (b.placedAt || b.createdAt) ? 1 : -1,
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (list.length === 0) {
    return (
      <View style={styles.centered}>
        <Ionicons name="time-outline" size={56} color={colors.textMuted} />
        <Text style={styles.emptyTitle}>No past orders yet</Text>
        <Text style={styles.emptySub}>
          Completed and delivered orders will be listed here for easy reordering.
        </Text>
        <Pressable
          style={styles.emptyBtn}
          onPress={() => navigateRoot('MainTabs', { screen: 'Home' })}
        >
          <Text style={styles.emptyBtnTxt}>Browse supermarkets</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{
        padding: spacing.xl,
        paddingBottom: insets.bottom + spacing.xxl,
      }}
    >
      {list.map((o) => {
        const storeName = o.storeName || o.supermarket?.name || 'Supermarket';
        const total = Number(o.totalAmount ?? o.total ?? 0);
        const rawDate = o.placedAt || o.createdAt;
        const date = rawDate ? new Date(rawDate).toLocaleDateString() : '—';
        const isCancelled = o.status === 'CANCELLED';
        const statusLabel = isCancelled ? 'Cancelled' : 'Delivered';
        const storeId = o.storeId || o.supermarketId;

        return (
          <View key={o.id} style={styles.row}>
            {/* Tapping the order opens its detail/tracking view; Reorder is a separate button. */}
            <Pressable
              style={styles.main}
              accessibilityRole="button"
              accessibilityLabel={`Open order from ${storeName}`}
              onPress={() => navigateRoot('TrackOrder', { orderId: o.id })}
            >
              <View style={styles.iconWrap}>
                <Ionicons name="storefront-outline" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.store}>{storeName}</Text>
                <Text style={styles.meta}>
                  {date} ·{' '}
                  <Text style={isCancelled ? styles.cancelled : styles.delivered}>
                    {statusLabel}
                  </Text>
                </Text>
                {isCancelled && (
                  <Text style={styles.reason} numberOfLines={2}>{cancellationText(o)}</Text>
                )}
              </View>
              <Text style={styles.price}>₦{total.toLocaleString()}</Text>
            </Pressable>
            <Pressable style={styles.reorder} onPress={() => navigateRoot('Store', { storeId })}>
              <Text style={styles.reorderTxt}>Reorder</Text>
            </Pressable>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    ...typography.sectionTitle,
    marginTop: spacing.lg,
    color: colors.text,
    textAlign: 'center',
  },
  emptySub: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 22,
    maxWidth: 320,
  },
  emptyBtn: {
    marginTop: spacing.xl,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    borderRadius: radii.md,
  },
  emptyBtnTxt: { color: colors.surface, fontWeight: '800' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  main: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  reason: { color: colors.danger, fontSize: 12, fontWeight: '600', marginTop: 2 },
  reorder: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
  },
  reorderTxt: { color: colors.bannerOrange, fontWeight: '700', fontSize: 12 },
  store: { fontWeight: '800', color: colors.text },
  meta: { color: colors.textSecondary, fontSize: 12, marginTop: 4 },
  delivered: { color: colors.open, fontWeight: '700' },
  cancelled: { color: colors.danger, fontWeight: '700' },
  price: { fontWeight: '800', color: colors.primary },
});
