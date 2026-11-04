import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Alert,
  Animated,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GrabitLoader } from '../components/brand/GrabitLoader';
import { GrabitMark } from '../components/brand/GrabitMark';
import { EmptyState } from '../components/common/EmptyState';
import { FadeInUp } from '../components/motion/FadeInUp';
import { PressableScale } from '../components/motion/PressableScale';
import { ProductImage } from '../components/ProductImage';
import { orderService } from '../services/orderService';
import { navigateRoot } from '../navigation/navigationRef';
import { brand, colors, fonts, radii, shadows, spacing } from '../theme';
import { haptic } from '../utils/haptics';
import { parseApiError } from '../utils/parseApiError';
import { cancellationText } from '../utils/orderStatus';

export function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [tab, setTab] = useState<'active' | 'past'>('active');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [segW, setSegW] = useState(0);
  const seg = useRef(new Animated.Value(0)).current;

  const ACTIVE_STATUSES = ['CONFIRMED', 'PREPARING', 'READY', 'RIDER_ASSIGNED', 'PICKED_UP', 'ON_THE_WAY'];
  const PAST_STATUSES = ['DELIVERED', 'CANCELLED'];

  useEffect(() => {
    Animated.spring(seg, { toValue: tab === 'active' ? 0 : 1, friction: 8, tension: 90, useNativeDriver: true }).start();
  }, [tab, seg]);

  useFocusEffect(
    useCallback(() => {
      const fetchOrders = async () => {
        try {
          const param = tab === 'active' ? { activeOnly: true } : { pastOnly: true };
          const data = await orderService.getOrders(param);
          setOrders(data.orders || data || []);
        } catch (error: unknown) {
          Alert.alert(
            'Unable to Load Orders',
            parseApiError(error, {
              fallback: 'Failed to load order history. Please try again.',
            }),
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      };

      setLoading(true);
      fetchOrders();
    }, [tab, reloadKey]),
  );

  const active = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const past = orders.filter((o) => PAST_STATUSES.includes(o.status));

  const switchTab = (t: 'active' | 'past') => {
    if (t === tab) return;
    haptic.select();
    setTab(t);
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.top, { paddingTop: insets.top + spacing.md }]}>
        <View>
          <Text maxFontSizeMultiplier={1.25} style={styles.title}>Your orders</Text>
          <Text style={styles.subtitle}>Track, reorder and relive your grabs</Text>
        </View>
        <GrabitMark size={32} />
      </View>

      <View style={styles.seg} onLayout={(e) => setSegW(e.nativeEvent.layout.width)}>
        {segW > 0 ? (
          <Animated.View
            style={[
              styles.segIndicator,
              {
                width: (segW - 8) / 2,
                transform: [{ translateX: seg.interpolate({ inputRange: [0, 1], outputRange: [0, (segW - 8) / 2] }) }],
              },
            ]}
          />
        ) : null}
        {(['active', 'past'] as const).map((t) => (
          <Pressable
            key={t}
            style={styles.segBtn}
            onPress={() => switchTab(t)}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === t }}
          >
            <Text style={[styles.segTxt, tab === t && styles.segTxtOn]}>{t === 'active' ? 'Active' : 'Past orders'}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.xl, paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              haptic.tap();
              setRefreshing(true);
              setReloadKey((k) => k + 1);
            }}
            tintColor={brand.basil}
            colors={[brand.basil, brand.tomato]}
          />
        }
      >
        {loading && !refreshing ? (
          <View style={styles.loading}>
            <GrabitLoader size={44} />
          </View>
        ) : (
          <>
            {tab === 'active' && active.length === 0 ? (
              <EmptyState
                art="bag"
                title="No active orders"
                body="After you place an order, it will appear here with live tracking and rider updates."
                actionLabel="Start shopping"
                onAction={() => navigation.navigate('Home' as never)}
              />
            ) : null}
            {tab === 'active' ? active.map((o, i) => <ActiveCard key={o.id} order={o} index={i} />) : null}
            {tab === 'past' && past.length === 0 ? (
              <EmptyState
                art="mark"
                title="No past orders yet"
                body="Delivered orders will be listed here for easy reordering."
                actionLabel="Browse supermarkets"
                onAction={() => navigation.navigate('Home' as never)}
              />
            ) : null}
            {tab === 'past' && past.length > 0 ? (
              <>
                <View style={styles.pastHead}>
                  <Text maxFontSizeMultiplier={1.25} style={styles.pastTitle}>Recent</Text>
                  <Pressable onPress={() => navigateRoot('OrderHistory')} hitSlop={8} style={styles.viewAll}>
                    <Text style={styles.viewAllTxt}>View all</Text>
                    <Ionicons name="arrow-forward" size={14} color={colors.primary} />
                  </Pressable>
                </View>
                <View style={styles.pastBox}>
                  {past.map((o, i) => (
                    <PastRow key={o.id} order={o} index={i} last={i === past.length - 1} />
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

function ActiveCard({ order, index }: { order: any; index: number }) {
  const lines = order.lines || order.items || [];
  const firstImage =
    lines[0]?.productImageUrl || lines[0]?.product?.imageUrl || lines[0]?.product?.image || lines[0]?.image || null;
  const storeName = order.storeName || order.supermarket?.name || 'Supermarket';

  const status = order.status || '';
  const isOnTheWay = status === 'ON_THE_WAY' || status === 'PICKED_UP';
  const badge = isOnTheWay ? 'On the way' : 'Processing';

  const displayTotal = Number(order.totalAmount ?? order.total ?? 0);
  const displayDate = order.placedAt || order.createdAt;

  return (
    <FadeInUp index={index}>
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <ProductImage uri={firstImage} style={styles.storeThumb} label={storeName} />
          <View style={{ flex: 1 }}>
            <Text maxFontSizeMultiplier={1.25} style={styles.storeName} numberOfLines={1}>
              {storeName}
            </Text>
            <Text style={styles.time}>{new Date(displayDate).toLocaleDateString()}</Text>
          </View>
          <View style={[styles.badge, isOnTheWay ? styles.badgeGo : styles.badgeWait]}>
            <View style={[styles.badgeDot, { backgroundColor: isOnTheWay ? brand.forest : brand.tomato }]} />
            <Text style={styles.badgeTxt}>{badge}</Text>
          </View>
        </View>
        <View style={styles.mid}>
          <View>
            <Text style={styles.ot}>Order total</Text>
            <Text maxFontSizeMultiplier={1.25} style={styles.op}>₦{displayTotal.toLocaleString()}</Text>
          </View>
          <Text style={styles.items}>{lines.length} items</Text>
        </View>
        <View style={styles.actions}>
          <PressableScale
            containerStyle={{ flex: 1 }}
            style={styles.track}
            hapticFeedback
            onPress={() => navigateRoot('TrackOrder', { orderId: order.id })}
            accessibilityRole="button"
          >
            <Ionicons name="navigate" size={18} color={colors.surface} />
            <Text style={styles.trackTxt}>Track order</Text>
          </PressableScale>
          <PressableScale
            style={styles.phone}
            onPress={() => Alert.alert('Call Rider', 'This would call the assigned rider.')}
            accessibilityRole="button"
            accessibilityLabel="Call rider"
          >
            <Ionicons name="call" size={18} color={colors.primary} />
          </PressableScale>
        </View>
      </View>
    </FadeInUp>
  );
}

function PastRow({ order, index, last }: { order: any; index: number; last: boolean }) {
  const storeName = order.storeName || order.supermarket?.name || 'Supermarket';
  const displayTotal = Number(order.totalAmount ?? order.total ?? 0);
  const displayDate = order.placedAt || order.createdAt;

  const isCancelled = order.status === 'CANCELLED';

  return (
    <FadeInUp index={index}>
      <View style={[styles.pastRow, last && { borderBottomWidth: 0 }]}>
        {/* Tapping the order opens its detail/tracking view; Reorder (below) is a separate button. */}
        <Pressable
          style={styles.pastMain}
          accessibilityRole="button"
          accessibilityLabel={`Open order from ${storeName}`}
          onPress={() => navigateRoot('TrackOrder', { orderId: order.id })}
        >
          <View style={[styles.pastIcon, isCancelled && { backgroundColor: colors.tomatoTint }]}>
            <Ionicons
              name={isCancelled ? 'close' : 'checkmark'}
              size={18}
              color={isCancelled ? colors.danger : colors.primary}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.pastStore} numberOfLines={1}>
              {storeName}
            </Text>
            <Text style={styles.pastDate}>
              {new Date(displayDate).toLocaleDateString()} · ₦{displayTotal.toLocaleString()}
            </Text>
            {isCancelled && (
              <Text style={styles.pastCancel} numberOfLines={2}>
                {cancellationText(order)}
              </Text>
            )}
          </View>
        </Pressable>
        <PressableScale
          style={styles.reorder}
          hapticFeedback
          onPress={() => {
            navigateRoot('Store', { storeId: order.storeId || order.supermarketId });
          }}
          accessibilityRole="button"
          accessibilityLabel={`Reorder from ${storeName}`}
        >
          <Ionicons name="refresh" size={14} color={brand.forest} />
          <Text style={styles.reorderTxt}>Reorder</Text>
        </PressableScale>
      </View>
    </FadeInUp>
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
  },
  title: { fontFamily: fonts.display, fontSize: 30, letterSpacing: -0.8, color: colors.text },
  subtitle: { fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  seg: {
    flexDirection: 'row',
    marginHorizontal: spacing.xl,
    marginTop: spacing.sm,
    backgroundColor: colors.sand,
    borderRadius: radii.lg,
    padding: 4,
  },
  segIndicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    borderRadius: radii.md,
    backgroundColor: brand.forest,
  },
  segBtn: { flex: 1, paddingVertical: spacing.md, alignItems: 'center' },
  segTxt: { fontFamily: fonts.bold, fontSize: 14, color: colors.textSecondary },
  segTxtOn: { color: brand.oat },
  loading: { marginTop: spacing.xxxl * 2, alignItems: 'center' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  storeThumb: { width: 52, height: 52, borderRadius: radii.md },
  storeName: { fontFamily: fonts.display, fontSize: 17, color: colors.text },
  time: { fontFamily: fonts.regular, color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: radii.pill,
  },
  badgeGo: { backgroundColor: brand.lime },
  badgeWait: { backgroundColor: colors.tomatoTint },
  badgeDot: { width: 7, height: 7, borderRadius: 4 },
  badgeTxt: { fontFamily: fonts.bold, fontSize: 12, color: brand.forest },
  mid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
  },
  ot: { fontFamily: fonts.regular, color: colors.textSecondary, fontSize: 12 },
  op: { fontFamily: fonts.display, fontSize: 20, color: colors.text, marginTop: 2 },
  items: { fontFamily: fonts.medium, color: colors.textSecondary, fontSize: 13 },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md + 2,
    borderRadius: radii.lg,
  },
  trackTxt: { fontFamily: fonts.bold, fontSize: 15, color: colors.surface },
  phone: {
    width: 50,
    height: 50,
    borderRadius: radii.lg,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pastHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  pastTitle: { fontFamily: fonts.display, fontSize: 20, color: colors.text },
  viewAll: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewAllTxt: { fontFamily: fonts.bold, fontSize: 14, color: colors.primary },
  pastBox: {
    borderRadius: radii.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
    ...shadows.soft,
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
  pastMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  pastCancel: { fontFamily: fonts.semibold, color: colors.danger, fontSize: 12, marginTop: 2 },
  pastStore: { fontFamily: fonts.bold, fontSize: 15, color: colors.text },
  pastDate: { fontFamily: fonts.regular, color: colors.textSecondary, fontSize: 13, marginTop: 1 },
  reorder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: brand.lime,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
  },
  reorderTxt: { fontFamily: fonts.bold, fontSize: 13, color: brand.forest },
});
