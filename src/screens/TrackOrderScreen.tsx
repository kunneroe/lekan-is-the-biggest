import { Ionicons } from '@expo/vector-icons';
import { useRoute, type RouteProp, useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { LoaderView } from '../components/brand/GrabitLoader';
import { GrabitMark } from '../components/brand/GrabitMark';
import { EmptyState } from '../components/common/EmptyState';
import { FadeInUp } from '../components/motion/FadeInUp';
import { PressableScale } from '../components/motion/PressableScale';
import { ProductImage } from '../components/ProductImage';
import { trackingService } from '../services/trackingService';
import { orderService } from '../services/orderService';
import type { RootStackParamList } from '../navigation/navigationRef';
import { brand, colors, fonts, radii, shadows, spacing } from '../theme';
import { ease, useReducedMotion } from '../utils/motion';
import { parseApiError } from '../utils/parseApiError';

import { appAlert } from '../context/DialogContext';
type R = RouteProp<RootStackParamList, 'TrackOrder'>;

const MAP_H = 250;

export function TrackOrderScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute<R>();
  const navigation = useNavigation();
  const { orderId } = route.params;
  const { width: W } = useWindowDimensions();
  const reduced = useReducedMotion();

  const [trackingData, setTrackingData] = useState<any>(null);
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  // Must cover every backend OrderStatus except CANCELLED (handled separately below).
  const STATUS_TO_STEP: Record<string, number> = {
    CONFIRMED: 0,
    PREPARING: 1,
    READY: 2,
    RIDER_ASSIGNED: 3,
    PICKED_UP: 4,
    ON_THE_WAY: 5,
    DELIVERED: 6,
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchTracking = async (isPoll = false) => {
      try {
        const [trackRes, orderRes] = await Promise.all([
          trackingService.getTrackingUpdate(orderId),
          orderService.getOrderById(orderId),
        ]);
        setTrackingData(trackRes.tracking || trackRes || null);
        setOrderData(orderRes.order || orderRes || null);
      } catch (error: unknown) {
        if (!isPoll) {
          appAlert(
            'Unable to Load Tracking',
            parseApiError(error, {
              fallback: 'Failed to load tracking data. Please try again.',
            }),
          );
        }
      } finally {
        if (!isPoll) {
          setLoading(false);
        }
      }
    };

    fetchTracking(); // initial fetch

    intervalId = setInterval(() => {
      fetchTracking(true);
    }, 10000); // Poll every 10 seconds

    return () => {
      clearInterval(intervalId); // Cleanup interval on unmount
    };
  }, [orderId]);

  useEffect(() => {
    if (reduced) return;
    const loop = Animated.loop(
      Animated.timing(pulse, { toValue: 1, duration: 1600, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, reduced]);

  const status = trackingData?.status || orderData?.status || '';
  const step = STATUS_TO_STEP[status] ?? 0;
  const isCancelled = status === 'CANCELLED';

  const trackingSteps = [
    'Order placed',
    'Store accepted order',
    'Packed, waiting for rider',
    'Rider assigned',
    'Rider at store',
    'Heading to you',
    'Delivered',
  ];

  const progress = isCancelled ? 0 : Math.min((step + 1) / trackingSteps.length, 1);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 900,
      easing: ease.settle,
      useNativeDriver: false,
    }).start();
  }, [progress, progressAnim]);

  if (loading) {
    return <LoaderView label="Finding your order…" />;
  }

  if (!trackingData) {
    return (
      <View style={[styles.screen, { justifyContent: 'center' }]}>
        <EmptyState
          art="mark"
          title="Tracking not found"
          body="We couldn't find live updates for this order."
          actionLabel="Go back"
          onAction={() => navigation.goBack()}
        />
      </View>
    );
  }

  const cancelledBy = trackingData.cancelledBy || orderData?.cancelledBy;
  const reasonText = trackingData.cancellationReason || orderData?.cancellationReason;
  const cancelReason =
    cancelledBy === 'SYSTEM'
      ? "The store didn't accept your order in time."
      : cancelledBy === 'ADMIN'
        ? `Cancelled by Grabit support${reasonText ? `: ${reasonText}` : '.'}`
        : reasonText || 'This order was cancelled.';

  // Rider info — backend uses rider.fullName, rider.vehicleType, rider.vehiclePlate
  const riderRaw = trackingData.rider || orderData?.rider || null;
  const riderName = riderRaw?.fullName || 'Assigning rider...';
  const riderVehicle = riderRaw?.vehicleType || 'N/A';
  const riderPlate = riderRaw?.vehiclePlate || 'N/A';

  // Items from order details fetch
  const lines = orderData?.items || orderData?.lines || [];

  // ETA — display the string as-is from backend
  const eta = trackingData.eta || 'Calculating...';

  // Total from order details
  const total = orderData?.totalAmount ?? orderData?.total ?? 0;

  // Address from tracking payload
  const deliveryAddress = trackingData.deliveryAddress || orderData?.deliveryAddress || null;
  const addressLabel = deliveryAddress?.label || 'YOUR ADDRESS';
  const addressLine = deliveryAddress?.line1 || '';

  const deliveryNote = orderData?.deliveryNote || trackingData.deliveryNote || 'No note provided';

  // Route illustration: store (left) → home (right), rider rides along with progress.
  const pad = 44;
  const routeW = W - pad * 2;
  const riderX = progressAnim.interpolate({ inputRange: [0, 1], outputRange: [pad - 20, pad + routeW - 20] });
  const curve = `M${pad} ${MAP_H * 0.68} C ${pad + routeW * 0.3} ${MAP_H * 0.25}, ${pad + routeW * 0.6} ${MAP_H * 0.95}, ${pad + routeW} ${MAP_H * 0.55}`;

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xxl }} showsVerticalScrollIndicator={false}>
        <View style={[styles.map, { height: MAP_H + insets.top }]}>
          <GrabitMark size={300} variant="mono" color="rgba(255,201,77,0.08)" style={styles.mapWatermark} />
          <View style={{ marginTop: insets.top, height: MAP_H }}>
            <Svg width={W} height={MAP_H} style={StyleSheet.absoluteFill}>
              <Path d={curve} stroke="rgba(255,246,230,0.25)" strokeWidth={4} strokeDasharray="2 10" strokeLinecap="round" fill="none" />
              <Circle cx={pad} cy={MAP_H * 0.68} r={9} fill={brand.sprout} />
              <Circle cx={pad + routeW} cy={MAP_H * 0.55} r={9} fill={brand.butter} />
            </Svg>
            <View style={[styles.pinLabel, { left: pad - 24, top: MAP_H * 0.68 + 14 }]}>
              <Ionicons name="storefront" size={12} color={brand.sprout} />
              <Text style={styles.pinTxt}>Store</Text>
            </View>
            <View style={[styles.pinLabel, { right: pad - 24, top: MAP_H * 0.55 + 14 }]}>
              <Ionicons name="home" size={12} color={brand.butter} />
              <Text style={styles.pinTxt}>You</Text>
            </View>
            {!isCancelled ? (
              <Animated.View style={[styles.rider, { top: MAP_H * 0.42, transform: [{ translateX: riderX }] }]}>
                <Animated.View
                  style={[
                    styles.riderPulse,
                    {
                      opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }),
                      transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 2.2] }) }],
                    },
                  ]}
                />
                <View style={styles.riderBubble}>
                  <Ionicons name="bicycle" size={20} color={brand.ink} />
                </View>
              </Animated.View>
            ) : null}
            {trackingData.latestLocation && (
              <Text style={styles.gps}>
                Rider GPS: {trackingData.latestLocation.latitude}, {trackingData.latestLocation.longitude}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.sheet}>
          <FadeInUp>
            <View style={styles.row1}>
              <View style={{ flex: 1 }}>
                <Text style={styles.etaLab}>{isCancelled ? 'Status' : 'Arriving in'}</Text>
                <Text maxFontSizeMultiplier={1.25} style={[styles.eta, isCancelled && { color: colors.danger }]}>{isCancelled ? 'Cancelled' : eta}</Text>
              </View>
              <View style={styles.pricePill}>
                <Text maxFontSizeMultiplier={1.25} style={styles.price}>₦{Number(total || 0).toLocaleString()}</Text>
              </View>
            </View>
            <View style={styles.barBg}>
              <Animated.View
                style={[
                  styles.barFg,
                  { width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
                ]}
              />
            </View>
          </FadeInUp>

          {isCancelled ? (
            <FadeInUp index={1}>
              <View style={styles.cancelCard}>
                <View style={styles.cancelIcon}>
                  <Ionicons name="close" size={20} color={colors.danger} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text maxFontSizeMultiplier={1.25} style={styles.cancelTitle}>Order cancelled</Text>
                  <Text style={styles.stSub}>{cancelReason}</Text>
                </View>
              </View>
            </FadeInUp>
          ) : (
            <FadeInUp index={1}>
              <View style={styles.timeline}>
                {trackingSteps.map((label, i) => {
                  const done = i < step || step === trackingSteps.length - 1;
                  const current = i === step && step !== trackingSteps.length - 1;
                  return (
                    <View key={label} style={styles.tlRow}>
                      <View style={styles.tlRail}>
                        {current && !reduced ? (
                          <Animated.View
                            style={[
                              styles.tlPulse,
                              {
                                opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }),
                                transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 2] }) }],
                              },
                            ]}
                          />
                        ) : null}
                        <View style={[styles.tlDot, done && styles.tlDotDone, current && styles.tlDotNow]}>
                          {done ? <Ionicons name="checkmark" size={12} color={brand.cream} /> : null}
                        </View>
                        {i < trackingSteps.length - 1 ? <View style={[styles.tlLine, done && styles.tlLineDone]} /> : null}
                      </View>
                      <View style={styles.tlTextWrap}>
                        <Text style={[styles.tlLabel, (done || current) && styles.tlLabelOn]}>{label}</Text>
                        {current ? (
                          <Text style={styles.stSub}>
                            {riderName !== 'Assigning rider...'
                              ? `${riderName} is handling your order`
                              : 'Waiting for rider assignment...'}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                  );
                })}
              </View>
            </FadeInUp>
          )}

          <FadeInUp index={2}>
            <View style={styles.rider2}>
              <View style={styles.riderAvatar}>
                <Ionicons name="person" size={26} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.riderName}>{riderName}</Text>
                <Text style={styles.riderV}>
                  {riderVehicle} · {riderPlate}
                </Text>
              </View>
              <PressableScale style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="Message rider">
                <Ionicons name="chatbubble-ellipses" size={20} color={colors.primary} />
              </PressableScale>
              <PressableScale style={[styles.iconBtn, styles.call]} accessibilityRole="button" accessibilityLabel="Call rider">
                <Ionicons name="call" size={20} color={colors.surface} />
              </PressableScale>
            </View>

            <View style={styles.box}>
              <Ionicons name="location" size={18} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.boxLab}>DELIVERING TO {addressLabel.toUpperCase()}</Text>
                <Text style={styles.boxTxt}>{addressLine}</Text>
              </View>
            </View>
            <View style={styles.box}>
              <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.boxLab}>DELIVERY NOTE</Text>
                <Text style={styles.noteItalic}>“{deliveryNote}”</Text>
              </View>
            </View>

            {lines.length > 0 ? (
              <>
                <Text maxFontSizeMultiplier={1.25} style={styles.sec}>In your bag</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
                  {lines.slice(0, 4).map((l: any, i: number) => (
                    <ProductImage
                      key={l.id || l.product?.id || i}
                      uri={l.productImageUrl || l.product?.imageUrl || l.product?.image || null}
                      style={styles.mini}
                      label={l.product?.name || 'Item'}
                    />
                  ))}
                  {lines.length > 4 ? (
                    <View style={[styles.mini, styles.more]}>
                      <Text style={styles.moreTxt}>+{lines.length - 4}</Text>
                    </View>
                  ) : null}
                </ScrollView>
              </>
            ) : null}
          </FadeInUp>
        </View>
      </ScrollView>

      <View style={[styles.topButtons, { top: insets.top + spacing.sm }]}>
        <PressableScale onPress={() => navigation.goBack()} style={styles.roundBtn} accessibilityRole="button" accessibilityLabel="Back">
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </PressableScale>
        <View style={styles.livePill}>
          <View style={styles.liveDot} />
          <Text style={styles.liveTxt}>Live tracking</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  map: { backgroundColor: brand.ink, overflow: 'hidden' },
  mapWatermark: { position: 'absolute', right: -80, bottom: -90 },
  pinLabel: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,246,230,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.pill,
  },
  pinTxt: { fontFamily: fonts.bold, fontSize: 11, color: brand.cream },
  rider: { position: 'absolute', left: 0, width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  riderPulse: { position: 'absolute', width: 40, height: 40, borderRadius: 20, backgroundColor: brand.sprout },
  riderBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: brand.sprout,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: brand.ink,
  },
  gps: {
    position: 'absolute',
    bottom: spacing.xxl + spacing.sm,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontFamily: fonts.medium,
    fontSize: 11,
    color: 'rgba(255,246,230,0.7)',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    marginTop: -spacing.xxl,
    padding: spacing.xl,
  },
  row1: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: spacing.md },
  etaLab: { fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary },
  eta: { fontFamily: fonts.display, fontSize: 30, letterSpacing: -0.2, color: colors.text },
  pricePill: { backgroundColor: colors.tint, paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radii.pill },
  price: { fontFamily: fonts.display, fontSize: 16, color: colors.primaryDark },
  barBg: { height: 8, backgroundColor: colors.sand, borderRadius: 4, overflow: 'hidden', marginBottom: spacing.xl },
  barFg: { height: 8, backgroundColor: colors.primary, borderRadius: 4 },
  cancelCard: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.redTint,
    padding: spacing.lg,
    borderRadius: radii.lg,
    marginBottom: spacing.xl,
  },
  cancelIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelTitle: { fontFamily: fonts.display, fontSize: 17, color: colors.danger },
  stSub: { fontFamily: fonts.regular, color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  timeline: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.soft,
  },
  tlRow: { flexDirection: 'row', gap: spacing.md, minHeight: 40 },
  tlRail: { width: 22, alignItems: 'center' },
  tlPulse: { position: 'absolute', top: 0, width: 22, height: 22, borderRadius: 11, backgroundColor: colors.primary },
  tlDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tlDotDone: { backgroundColor: colors.primary, borderColor: colors.primary },
  tlDotNow: { borderColor: colors.primary, borderWidth: 6 },
  tlLine: { flex: 1, width: 2, backgroundColor: colors.border, marginVertical: 2 },
  tlLineDone: { backgroundColor: colors.primary },
  tlTextWrap: { flex: 1, paddingBottom: spacing.md },
  tlLabel: { fontFamily: fonts.medium, fontSize: 15, color: colors.textMuted, marginTop: 1 },
  tlLabelOn: { fontFamily: fonts.bold, color: colors.text },
  rider2: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.soft,
  },
  riderAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  riderName: { fontFamily: fonts.bold, fontSize: 15, color: colors.text },
  riderV: { fontFamily: fonts.regular, color: colors.textSecondary, fontSize: 13 },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  call: { backgroundColor: colors.primary },
  box: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radii.lg,
    marginBottom: spacing.md,
  },
  boxLab: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 0.5, color: colors.textSecondary },
  boxTxt: { fontFamily: fonts.bold, fontSize: 15, color: colors.text, marginTop: 4 },
  noteItalic: { fontFamily: fonts.regular, fontStyle: 'italic', color: colors.text, marginTop: 4, fontSize: 15 },
  sec: { fontFamily: fonts.display, fontSize: 18, marginTop: spacing.md, marginBottom: spacing.md, color: colors.text },
  mini: { width: 60, height: 60, borderRadius: radii.md },
  more: { backgroundColor: colors.sand, alignItems: 'center', justifyContent: 'center' },
  moreTxt: { fontFamily: fonts.bold, color: colors.text },
  topButtons: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roundBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,246,230,0.14)',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
  },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: brand.butter },
  liveTxt: { fontFamily: fonts.bold, fontSize: 13, color: brand.cream },
});
