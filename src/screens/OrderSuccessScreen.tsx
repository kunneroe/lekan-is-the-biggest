import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { LoaderView } from '../components/brand/GrabitLoader';
import { EmptyState } from '../components/common/EmptyState';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { BagCelebration } from '../components/motion/BagCelebration';
import { FadeInUp } from '../components/motion/FadeInUp';
import { ProductImage } from '../components/ProductImage';
import { orderService } from '../services/orderService';
import type { RootStackParamList } from '../navigation/navigationRef';
import { brand, colors, fonts, radii, shadows, spacing } from '../theme';

type R = RouteProp<RootStackParamList, 'OrderSuccess'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export function OrderSuccessScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute<R>();
  const navigation = useNavigation<Nav>();
  const { orderId } = route.params;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService
      .getOrderById(orderId)
      .then((res) => {
        setOrder(res.order || res);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return <LoaderView label="Confirming your order…" />;
  }

  if (!order) {
    return (
      <View style={[styles.screen, { justifyContent: 'center' }]}>
        <EmptyState art="mark" title="Order not found" actionLabel="Home" onAction={() => navigation.navigate('MainTabs')} />
      </View>
    );
  }

  const lines = order.lines || order.items || [];
  const thumb = lines[0]?.product?.image || lines[0]?.product?.imageUrl || lines[0]?.productImageUrl || null;
  const name0 = lines[0]?.product?.name ?? 'Items';
  const storeShort = (order.storeName || order.supermarket?.name || '').split(' ')[0];
  const REVEAL = 1900;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingTop: insets.top + spacing.xxl, paddingBottom: insets.bottom + spacing.xl, paddingHorizontal: spacing.xl }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.stage}>
        <BagCelebration />
      </View>

      <FadeInUp delay={REVEAL}>
        <Text style={styles.title}>Order grabbed!</Text>
        <Text style={styles.sub}>
          {storeShort ? (
            <>
              <Text style={styles.bold}>{storeShort}</Text> is packing your bag now.{' '}
            </>
          ) : (
            'We’re packing your bag now. '
          )}
          Estimated delivery <Text style={styles.bold}>{order.etaMins || 15} mins</Text>.
        </Text>
      </FadeInUp>

      <FadeInUp delay={REVEAL + 120}>
        <View style={styles.card}>
          <ProductImage uri={thumb} style={styles.thumb} label={name0} />
          <View style={{ flex: 1 }}>
            <Text style={styles.oid} numberOfLines={1}>
              Order #{order.id}
            </Text>
            <Text style={styles.sum}>
              {lines.length} items · ₦{Number(order.total || order.totalAmount || 0).toLocaleString()}
            </Text>
            <View style={styles.etaRow}>
              <View style={styles.liveDot} />
              <Text style={styles.eta}>Arriving soon</Text>
            </View>
          </View>
        </View>
      </FadeInUp>

      <FadeInUp delay={REVEAL + 220} style={{ gap: spacing.md }}>
        <PrimaryButton
          label="Track order"
          icon="navigate"
          onPress={() => navigation.navigate('TrackOrder', { orderId: order.id })}
        />
        <PrimaryButton label="Keep shopping" variant="secondary" onPress={() => navigation.navigate('MainTabs')} />
      </FadeInUp>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  stage: { alignItems: 'center', marginBottom: spacing.lg },
  title: {
    fontFamily: fonts.display,
    fontSize: 34,
    letterSpacing: -0.9,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  sub: {
    fontFamily: fonts.regular,
    fontSize: 16,
    textAlign: 'center',
    color: colors.textSecondary,
    lineHeight: 23,
    marginBottom: spacing.xl,
  },
  bold: { fontFamily: fonts.bold, color: colors.text },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
    marginBottom: spacing.xl,
    ...shadows.soft,
  },
  thumb: { width: 64, height: 64, borderRadius: radii.md },
  oid: { fontFamily: fonts.medium, fontSize: 12, color: colors.textMuted },
  sum: { fontFamily: fonts.display, fontSize: 17, color: colors.text, marginTop: 4 },
  etaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: brand.tomato },
  eta: { fontFamily: fonts.semibold, color: colors.primary, fontSize: 13 },
});
