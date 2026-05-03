import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDemo } from '../../context/DemoContext';
import { navigateRoot } from '../../navigation/navigationRef';
import { colors, radii, spacing } from '../../theme';

export function OrderHistoryScreen() {
  const insets = useSafeAreaInsets();
  const { orders } = useDemo();
  const list = [...orders].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

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
          <Text style={styles.price}>₦{o.total.toLocaleString()}</Text>
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
