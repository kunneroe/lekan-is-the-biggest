import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProductImage } from '../components/ProductImage';
import { orderService } from '../services/orderService';
import { navigateRoot } from '../navigation/navigationRef';
import { colors, radii, shadows, spacing, typography } from '../theme';

export function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [tab, setTab] = useState<'active' | 'past'>('active');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchOrders = async () => {
        try {
          const data = await orderService.getOrders();
          setOrders(data.orders || data || []);
        } catch (error: any) {
          Alert.alert('Error', error.response?.data?.message || 'Failed to load order history.');
        } finally {
          setLoading(false);
        }
      };
      
      setLoading(true);
      fetchOrders();
    }, [])
  );

  const isActiveStatus = (status: string) => {
    const s = (status || '').toLowerCase();
    return ['active', 'pending', 'processing', 'on_the_way', 'out_for_delivery', 'accepted'].includes(s);
  };

  const active = orders.filter((o) => isActiveStatus(o.status));
  const past = orders.filter((o) => !isActiveStatus(o.status));

  return (
    <View style={styles.screen}>
      <View style={[styles.top, { paddingTop: insets.top + spacing.md }]}>
        <Pressable onPress={() => Alert.alert('Menu', 'Drawer is mocked for demo.')}>
          <Ionicons name="menu" size={26} color={colors.primary} />
        </Pressable>
        <Text style={styles.brand}>Goshop</Text>
        <ImageAvatar />
      </View>
      <Text style={styles.title}>My orders</Text>
      <View style={styles.seg}>
        <Pressable
          style={[styles.segBtn, tab === 'active' && styles.segOn]}
          onPress={() => setTab('active')}
        >
          <Text style={[styles.segTxt, tab === 'active' && styles.segTxtOn]}>
            Active orders
          </Text>
        </Pressable>
        <Pressable
          style={[styles.segBtn, tab === 'past' && styles.segOn]}
          onPress={() => setTab('past')}
        >
          <Text style={[styles.segTxt, tab === 'past' && styles.segTxtOn]}>
            Past orders
          </Text>
        </Pressable>
      </View>
      <ScrollView
        contentContainerStyle={{
          padding: spacing.xl,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={{ marginTop: spacing.xxxl, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <>
            {tab === 'active' && active.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Ionicons name="cube-outline" size={56} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>No active orders</Text>
                <Text style={styles.emptySub}>
                  After you place an order at checkout, it will appear here with
                  tracking and rider updates.
                </Text>
                <Pressable
                  style={styles.emptyBtn}
                  onPress={() => navigation.navigate('Home' as never)}
                >
                  <Text style={styles.emptyBtnTxt}>Start shopping</Text>
                </Pressable>
              </View>
            ) : null}
            {tab === 'active'
              ? active.map((o) => <ActiveCard key={o.id} order={o} />)
              : null}
            {tab === 'past' && past.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Ionicons name="time-outline" size={56} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>No past orders yet</Text>
                <Text style={styles.emptySub}>
                  Completed and delivered orders will be listed here for easy
                  reordering.
                </Text>
                <Pressable
                  style={styles.emptyBtn}
                  onPress={() => navigation.navigate('Home' as never)}
                >
                  <Text style={styles.emptyBtnTxt}>Browse supermarkets</Text>
                </Pressable>
              </View>
            ) : null}
            {tab === 'past' && past.length > 0 ? (
              <>
                <View style={styles.pastHead}>
                  <Text style={styles.pastTitle}>Past orders</Text>
                  <Pressable onPress={() => Alert.alert('View all', 'Showing all past orders.')}>
                    <Text style={styles.viewAll}>View all</Text>
                  </Pressable>
                </View>
                <View style={styles.pastBox}>
                  {past.map((o) => (
                    <PastRow key={o.id} order={o} />
                  ))}
                </View>
              </>
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function ImageAvatar() {
  return (
    <View style={styles.avatar}>
      <Ionicons name="person" size={18} color={colors.textSecondary} />
    </View>
  );
}

function ActiveCard({ order }: { order: any }) {
  // If the backend provides lines, use them, otherwise fallback to empty array
  const lines = order.lines || order.items || [];
  const firstImage = lines[0]?.product?.image || lines[0]?.image || 'https://via.placeholder.com/100';
  const storeName = order.storeName || order.supermarket?.name || 'Supermarket';
  
  const stepIndex = order.stepIndex || 0;
  const badge = stepIndex >= 4 ? 'ON THE WAY' : 'PROCESSING';
  const badgeStyle = stepIndex >= 4 ? styles.badgeGreen : styles.badgeOrange;

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <ProductImage
          uri={firstImage}
          style={styles.storeThumb}
          label={storeName}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.storeName}>{storeName}</Text>
          <Text style={styles.time}>{new Date(order.createdAt).toLocaleDateString()}</Text>
        </View>
        <View style={[styles.badge, badgeStyle]}>
          <Text
            style={[
              styles.badgeTxt,
              stepIndex >= 4 ? styles.badgeTxtDark : styles.badgeTxtOrange,
            ]}
          >
            {badge}
          </Text>
        </View>
      </View>
      <View style={styles.div} />
      <View style={styles.mid}>
        <View>
          <Text style={styles.ot}>Order total</Text>
          <Text style={styles.op}>₦{Number(order.total || 0).toLocaleString()}</Text>
        </View>
        <Text style={styles.items}>{lines.length} items</Text>
      </View>
      <View style={styles.actions}>
        <Pressable
          style={styles.track}
          onPress={() => navigateRoot('TrackOrder', { orderId: order.id })}
        >
          <Ionicons name="bicycle" size={18} color={colors.surface} />
          <Text style={styles.trackTxt}>Track order</Text>
        </Pressable>
        <Pressable
          style={styles.phone}
          onPress={() => Alert.alert('Call Rider', 'This would call the assigned rider.')}
        >
          <Ionicons name="call" size={18} color={colors.text} />
        </Pressable>
      </View>
    </View>
  );
}

function PastRow({ order }: { order: any }) {
  const storeName = order.storeName || order.supermarket?.name || 'Supermarket';

  return (
    <View style={styles.pastRow}>
      <View style={styles.pastIcon}>
        <Ionicons name="storefront-outline" size={20} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.pastStore}>{storeName}</Text>
        <Text style={styles.pastDate}>{new Date(order.createdAt).toLocaleDateString()}</Text>
      </View>
      <Text style={styles.pastPrice}>₦{Number(order.total || 0).toLocaleString()}</Text>
      <Pressable
        style={styles.reorder}
        onPress={() => {
          navigateRoot('Store', { storeId: order.storeId || order.supermarketId });
        }}
      >
        <Text style={styles.reorderTxt}>Reorder</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  brand: { fontSize: 18, fontWeight: '800', color: colors.primary },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  seg: {
    flexDirection: 'row',
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    backgroundColor: colors.mint,
    borderRadius: radii.lg,
    padding: 4,
  },
  segBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: radii.md,
  },
  segOn: { backgroundColor: colors.surface, ...shadows.soft },
  segTxt: { color: colors.textSecondary, fontWeight: '600' },
  segTxtOn: { color: colors.primary },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  storeThumb: { width: 48, height: 48, borderRadius: radii.sm },
  storeName: { fontWeight: '800', color: colors.text },
  time: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radii.pill },
  badgeGreen: { backgroundColor: colors.mint },
  badgeOrange: { backgroundColor: '#FFF3E0' },
  badgeTxt: { fontSize: 10, fontWeight: '800' },
  badgeTxtDark: { color: colors.primary },
  badgeTxtOrange: { color: '#C2410C' },
  div: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  mid: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ot: { color: colors.textSecondary, fontSize: 12 },
  op: { fontWeight: '800', color: colors.text, marginTop: 2 },
  items: { color: colors.textSecondary, fontSize: 13 },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  track: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
  },
  trackTxt: { color: colors.surface, fontWeight: '800' },
  phone: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.md,
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
  pastHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  pastTitle: { fontWeight: '800', fontSize: 16, color: colors.text },
  viewAll: { color: colors.primary, fontWeight: '600' },
  pastBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  pastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  pastIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pastStore: { fontWeight: '700', color: colors.text },
  pastDate: { color: colors.textSecondary, fontSize: 12 },
  pastPrice: { fontWeight: '800', color: colors.primary },
  reorder: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
  },
  reorderTxt: { color: colors.bannerOrange, fontWeight: '700', fontSize: 12 },
});
