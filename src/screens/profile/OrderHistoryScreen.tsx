import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LoaderView } from '../../components/brand/GrabitLoader';
import { EmptyState } from '../../components/common/EmptyState';
import { FadeInUp } from '../../components/motion/FadeInUp';
import { PressableScale } from '../../components/motion/PressableScale';
import { navigateRoot } from '../../navigation/navigationRef';
import { orderService } from '../../services/orderService';
import { brand, colors, fonts, radii, shadows, spacing } from '../../theme';
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

  const list = [...orders].sort((a, b) => ((a.placedAt || a.createdAt) < (b.placedAt || b.createdAt) ? 1 : -1));

  if (loading) {
    return <LoaderView label="Finding your orders…" />;
  }

  if (list.length === 0) {
    return (
      <View style={[styles.screen, { justifyContent: 'center' }]}>
        <EmptyState
          art="bag"
          title="No past orders yet"
          body="Delivered orders show up here so you can grab them again in one tap."
          actionLabel="Browse supermarkets"
          onAction={() => navigateRoot('MainTabs', { screen: 'Home' })}
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ padding: spacing.xl, paddingBottom: insets.bottom + spacing.xxl }}
      showsVerticalScrollIndicator={false}
    >
      {list.map((o, i) => {
        const storeName = o.storeName || o.supermarket?.name || 'Supermarket';
        const total = Number(o.totalAmount ?? o.total ?? 0);
        const rawDate = o.placedAt || o.createdAt;
        const date = rawDate ? new Date(rawDate).toLocaleDateString() : '—';
        const isCancelled = o.status === 'CANCELLED';
        const storeId = o.storeId || o.supermarketId;

        return (
          <FadeInUp key={o.id} index={i}>
            <View style={styles.card}>
              {/* Tapping the order opens its detail/tracking view; Reorder is a separate button. */}
              <Pressable
                style={styles.main}
                accessibilityRole="button"
                accessibilityLabel={`Open order from ${storeName}`}
                onPress={() => navigateRoot('TrackOrder', { orderId: o.id })}
              >
                <View style={[styles.iconWrap, isCancelled && { backgroundColor: colors.redTint }]}>
                  <Ionicons
                    name={isCancelled ? 'close' : 'checkmark'}
                    size={18}
                    color={isCancelled ? colors.danger : brand.leaf}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.store} numberOfLines={1}>
                    {storeName}
                  </Text>
                  <Text style={styles.meta}>{date}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Text style={styles.price}>₦{total.toLocaleString()}</Text>
                  <View style={[styles.pill, isCancelled ? styles.pillCancel : styles.pillDone]}>
                    <Text style={[styles.pillTxt, { color: isCancelled ? colors.danger : brand.leaf }]}>
                      {isCancelled ? 'Cancelled' : 'Delivered'}
                    </Text>
                  </View>
                </View>
              </Pressable>
              {isCancelled ? (
                <Text style={styles.reason} numberOfLines={2}>
                  {cancellationText(o)}
                </Text>
              ) : null}
              <PressableScale
                style={styles.reorder}
                hapticFeedback
                onPress={() => navigateRoot('Store', { storeId })}
                accessibilityRole="button"
                accessibilityLabel={`Reorder from ${storeName}`}
              >
                <Ionicons name="refresh" size={15} color={brand.ink} />
                <Text style={styles.reorderTxt}>Grab it again</Text>
              </PressableScale>
            </View>
          </FadeInUp>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
    ...shadows.soft,
  },
  main: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.leafTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  store: { fontFamily: fonts.display, fontSize: 17, color: colors.text },
  meta: { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  price: { fontFamily: fonts.display, fontSize: 17, color: colors.text },
  pill: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radii.pill },
  pillDone: { backgroundColor: colors.leafTint },
  pillCancel: { backgroundColor: colors.redTint },
  pillTxt: { fontFamily: fonts.bold, fontSize: 11 },
  reason: { fontFamily: fonts.semibold, fontSize: 12, color: colors.danger },
  reorder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: brand.butter,
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.pill,
  },
  reorderTxt: { fontFamily: fonts.bold, fontSize: 14, color: brand.ink },
});
