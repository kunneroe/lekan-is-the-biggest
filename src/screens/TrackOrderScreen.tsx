import { Ionicons } from '@expo/vector-icons';
import { useRoute, type RouteProp, useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProductImage } from '../components/ProductImage';
import { trackingService } from '../services/trackingService';
import type { RootStackParamList } from '../navigation/navigationRef';
import { colors, radii, spacing, typography } from '../theme';

type R = RouteProp<RootStackParamList, 'TrackOrder'>;

export function TrackOrderScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute<R>();
  const navigation = useNavigation();
  const { orderId } = route.params;

  const [trackingData, setTrackingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchTracking = async (isPoll = false) => {
      try {
        const data = await trackingService.getTrackingUpdate(orderId);
        setTrackingData(data.tracking || data || null);
      } catch (error: any) {
        if (!isPoll) {
          Alert.alert('Error', error.response?.data?.message || 'Failed to load tracking data.');
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

  if (loading) {
    return (
      <View style={styles.miss}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!trackingData) {
    return (
      <View style={styles.miss}>
        <Text>Order tracking not found.</Text>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={{ color: colors.primary, marginTop: spacing.md, fontWeight: '700' }}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  // Extract from backend payload, falling back to safe defaults
  const order = trackingData.order || trackingData;
  const step = trackingData.stepIndex || order.stepIndex || 0;
  
  // Example steps, ideally backend provides this
  const trackingSteps = trackingData.trackingSteps || [
    'Order placed',
    'Store accepted order',
    'Rider at store',
    'Heading to you',
    'Arrived',
  ];
  
  const progress = Math.min((step + 1) / trackingSteps.length, 1);
  const rider = trackingData.rider || order.rider || { name: 'Assigning rider...', vehicle: 'N/A', plate: 'N/A' };
  const lines = order.lines || order.items || [];
  const etaMins = trackingData.etaMins || order.etaMins || 15;
  const total = order.total || 0;
  const addressLabel = order.addressLabel || 'YOUR ADDRESS';
  const addressLine = order.addressLine || '';
  const deliveryNote = order.deliveryNote || 'No note provided';

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xxl }}
    >
      <View style={[styles.map, { paddingTop: insets.top }]}>
        <Text style={styles.mapLabel}>Map preview</Text>
        <Ionicons name="map" size={64} color={colors.mintStrong} />
        <Text style={styles.mapSub}>Live maps are simulated. Polling backend every 10s.</Text>
        {trackingData.riderLocation && (
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 4 }}>
            Rider GPS: {trackingData.riderLocation.lat}, {trackingData.riderLocation.lng}
          </Text>
        )}
      </View>
      <View style={styles.sheet}>
        <View style={styles.row1}>
          <Text style={styles.eta}>Arriving in ~{etaMins} mins</Text>
          <Text style={styles.price}>₦{Number(total || 0).toLocaleString()}</Text>
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
              {rider.name !== 'Assigning rider...' 
                ? `${rider.name} is handling your order` 
                : 'Waiting for rider assignment...'}
            </Text>
          </View>
        </View>
        <View style={styles.div} />
        <View style={styles.rider}>
          <View style={styles.riderAvatar}>
            <Ionicons name="person" size={28} color={colors.textSecondary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.riderName}>{rider.name}</Text>
            <Text style={styles.riderV}>
              {rider.vehicle} · {rider.plate}
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
            <Text style={styles.boxLab}>DELIVERING TO {addressLabel.toUpperCase()}</Text>
            <Text style={styles.boxTxt}>{addressLine}</Text>
          </View>
        </View>
        <View style={[styles.box, styles.noteBox]}>
          <Ionicons name="document-text-outline" size={18} color={colors.textSecondary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.boxLab}>DELIVERY NOTE</Text>
            <Text style={styles.noteItalic}>“{deliveryNote}”</Text>
          </View>
        </View>
        <Text style={styles.sec}>Order items</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {lines.slice(0, 4).map((l: any) => (
            <ProductImage
              key={l.id || l.product?.id || Math.random()}
              uri={l.product?.image}
              style={styles.mini}
              label={l.product?.name || 'Item'}
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
  mapSub: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: spacing.sm, textAlign: 'center', paddingHorizontal: spacing.xl },
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
