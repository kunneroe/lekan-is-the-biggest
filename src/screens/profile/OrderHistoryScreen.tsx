import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { navigateRoot } from '../../navigation/navigationRef';
import { orderService } from '../../services/orderService';
import { colors, radii, spacing } from '../../theme';

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

  const list = [...orders].sort((a, b) => (a.placedAt || a.createdAt) < (b.placedAt || b.createdAt) ? 1 : -1);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
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
      {list.map((o) => (
        <Pressable
          key={o.id}
          style={styles.row}
          onPress={() => {
            if (o.status === 'active') {
              navigateRoot('TrackOrder', { orderId: o.id });
            } else {
              navigateRoot('Store', { storeId: o.storeId });
            }
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.store}>{o.storeName}</Text>
            <Text style={styles.meta}>
              {o.createdAt} · {o.status === 'active' ? 'Active' : 'Delivered'}
            </Text>
          </View>
          <Text style={styles.price}>₦{Number(o.total || 0).toLocaleString()}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  store: { fontWeight: '800', color: colors.text },
  meta: { color: colors.textSecondary, fontSize: 12, marginTop: 4 },
  price: { fontWeight: '800', color: colors.primary },
});
