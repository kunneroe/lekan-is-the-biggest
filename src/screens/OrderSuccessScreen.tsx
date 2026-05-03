import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProductImage } from '../components/ProductImage';
import { useDemo } from '../context/DemoContext';
import type { RootStackParamList } from '../navigation/navigationRef';
import { colors, radii, spacing, typography } from '../theme';

type R = RouteProp<RootStackParamList, 'OrderSuccess'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export function OrderSuccessScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute<R>();
  const navigation = useNavigation<Nav>();
  const { orderId } = route.params;
  const { orders } = useDemo();
  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    return (
      <View style={styles.miss}>
        <Text>Order not found.</Text>
        <Pressable onPress={() => navigation.navigate('MainTabs')}>
          <Text style={styles.link}>Home</Text>
        </Pressable>
      </View>
    );
  }

  const thumb = order.lines[0]?.product.image;
  const name0 = order.lines[0]?.product.name ?? 'Items';

  return (
    <View style={[styles.screen, { paddingTop: insets.top + spacing.xl }]}>
      <View style={styles.checkWrap}>
        <View style={styles.checkOuter}>
          <Ionicons name="checkmark" size={48} color={colors.surface} />
        </View>
      </View>
      <Text style={styles.title}>Order placed successfully!</Text>
      <Text style={styles.sub}>
        Your items from <Text style={styles.bold}>{order.storeName.split(' ')[0]}</Text> are
        being prepared. Estimated delivery:{' '}
        <Text style={styles.bold}>{order.etaMins} mins.</Text>
      </Text>
      <View style={styles.card}>
        <ProductImage uri={thumb} style={styles.thumb} label={name0} />
        <View style={{ flex: 1 }}>
          <Text style={styles.oid}>#{order.id}</Text>
          <Text style={styles.sum}>
            {order.lines.length} items · ₦{order.total.toLocaleString()}
          </Text>
          <Text style={styles.eta}>
            <Ionicons name="bicycle" size={14} color={colors.primary} /> Arriving soon
          </Text>
        </View>
      </View>
      <Pressable
        style={styles.primary}
        onPress={() => navigation.navigate('TrackOrder', { orderId: order.id })}
      >
        <Ionicons name="navigate" size={20} color={colors.surface} />
        <Text style={styles.primaryTxt}>Track order</Text>
      </Pressable>
      <Pressable
        style={styles.secondary}
        onPress={() => navigation.navigate('MainTabs')}
      >
        <Ionicons name="home-outline" size={20} color={colors.primary} />
        <Text style={styles.secondaryTxt}>Back to home</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
  },
  miss: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  link: { color: colors.primary, marginTop: spacing.md },
  checkWrap: { alignItems: 'center', marginBottom: spacing.xl },
  checkOuter: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  sub: {
    ...typography.body,
    textAlign: 'center',
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  bold: { fontWeight: '800', color: colors.primary },
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.mint,
    marginBottom: spacing.xl,
  },
  thumb: { width: 64, height: 64, borderRadius: radii.sm },
  oid: { fontSize: 11, color: colors.textMuted, textTransform: 'uppercase' },
  sum: { fontWeight: '800', color: colors.text, marginTop: 4 },
  eta: { color: colors.primary, fontStyle: 'italic', marginTop: 8, fontSize: 13 },
  primary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: radii.md,
    marginBottom: spacing.md,
  },
  primaryTxt: { color: colors.surface, fontWeight: '800', fontSize: 16 },
  secondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.lg,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
  },
  secondaryTxt: { color: colors.primary, fontWeight: '700' },
});
