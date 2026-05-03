import { Ionicons } from '@expo/vector-icons';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProductImage } from '../components/ProductImage';
import { useDemo } from '../context/DemoContext';
import type { RootStackParamList } from '../navigation/navigationRef';
import { colors, radii, spacing, typography } from '../theme';

type R = RouteProp<RootStackParamList, 'TrackOrder'>;
export function TrackOrderScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute<R>();
  const { orderId } = route.params;
  const { orders, trackingSteps, advanceOrderStep } = useDemo();
  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    return (
      <View style={styles.miss}>
        <Text>Order not found.</Text>
      </View>
    );
  }

  const step = order.stepIndex;
  const progress = (step + 1) / trackingSteps.length;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xxl }}
    >
      <View style={[styles.map, { paddingTop: insets.top }]}>
        <Text style={styles.mapLabel}>Map preview</Text>
        <Ionicons name="map" size={64} color={colors.mintStrong} />
        <Text style={styles.mapSub}>Live maps are mocked for this demo</Text>
        <Pressable
          style={styles.sim}
          onPress={() => advanceOrderStep(order.id)}
        >
          <Text style={styles.simTxt}>Simulate next step (demo)</Text>
        </Pressable>
      </View>
      <View style={styles.sheet}>
        <View style={styles.row1}>
          <Text style={styles.eta}>Arriving in ~{order.etaMins} mins</Text>
          <Text style={styles.price}>₦{order.total.toLocaleString()}</Text>
        </View>
        <View style={styles.barBg}>
          <View style={[styles.barFg, { width: `${progress * 100}%` }]} />
        </View>
        <View style={styles.statusRow}>
          <View style={styles.bike}>
            <Ionicons name="bicycle" size={20} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.stTitle}>
              {trackingSteps[Math.min(step, trackingSteps.length - 1)]}
            </Text>
            <Text style={styles.stSub}>
              {order.rider.name} is handling your order
            </Text>
          </View>
        </View>
        <View style={styles.div} />
        <View style={styles.rider}>
          <View style={styles.riderAvatar}>
            <Ionicons name="person" size={28} color={colors.textSecondary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.riderName}>{order.rider.name}</Text>
            <Text style={styles.riderV}>
              {order.rider.vehicle} · {order.rider.plate}
            </Text>
          </View>
          <Pressable style={styles.iconBtn}>
            <Ionicons name="chatbubble-outline" size={20} color={colors.text} />
          </Pressable>
          <Pressable style={[styles.iconBtn, styles.call]}>
            <Ionicons name="call" size={20} color={colors.surface} />
          </Pressable>
        </View>
        <View style={styles.box}>
          <Ionicons name="location-outline" size={18} color={colors.textSecondary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.boxLab}>DELIVERING TO {order.addressLabel.toUpperCase()}</Text>
            <Text style={styles.boxTxt}>{order.addressLine}</Text>
          </View>
        </View>
        <View style={[styles.box, styles.noteBox]}>
          <Ionicons name="document-text-outline" size={18} color={colors.textSecondary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.boxLab}>DELIVERY NOTE</Text>
            <Text style={styles.noteItalic}>“{order.deliveryNote}”</Text>
          </View>
        </View>
        <Text style={styles.sec}>Order items</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {order.lines.slice(0, 4).map((l) => (
            <ProductImage
              key={l.lineId}
              uri={l.product.image}
              style={styles.mini}
              label={l.product.name}
            />
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  miss: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  map: {
    height: 220,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapLabel: { color: colors.surface, fontWeight: '700', marginBottom: spacing.sm },
  mapSub: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: spacing.sm },
  sim: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radii.pill,
  },
  simTxt: { color: colors.surface, fontSize: 12 },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    padding: spacing.xl,
  },
  row1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  eta: { fontWeight: '600', color: colors.text },
  price: { fontWeight: '700', color: colors.bannerOrange },
  barBg: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  barFg: {
    height: 6,
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  statusRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  bike: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stTitle: { fontWeight: '800', color: colors.primary, fontSize: 16 },
  stSub: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  div: { height: 1, backgroundColor: colors.border, marginVertical: spacing.lg },
  rider: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  riderAvatar: {
    width: 52,
    height: 52,
    borderRadius: radii.md,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  riderName: { fontWeight: '800', color: colors.text },
  riderV: { color: colors.textSecondary, fontSize: 13 },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  call: { backgroundColor: colors.primary },
  box: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.mint,
    padding: spacing.lg,
    borderRadius: radii.lg,
    marginBottom: spacing.md,
  },
  noteBox: { borderLeftWidth: 4, borderLeftColor: colors.bannerOrange },
  boxLab: { fontSize: 10, color: colors.textSecondary, fontWeight: '700' },
  boxTxt: { fontWeight: '700', color: colors.text, marginTop: 4 },
  noteItalic: { fontStyle: 'italic', color: colors.text, marginTop: 4 },
  sec: { fontWeight: '800', marginBottom: spacing.md, color: colors.text },
  mini: {
    width: 56,
    height: 56,
    borderRadius: radii.sm,
    marginRight: spacing.sm,
  },
});
