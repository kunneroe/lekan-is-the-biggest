import { Ionicons } from '@expo/vector-icons';
import {
  useRoute,
  useNavigation,
  type RouteProp,
  useFocusEffect,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProductImage } from '../components/ProductImage';

import { cartService } from '../services/cartService';
import { supermarketService } from '../services/supermarketService';
import { orderService } from '../services/orderService';
import { paymentService } from '../services/paymentService';
import { useAddresses } from '../context/AddressContext';
import type { RootStackParamList } from '../navigation/navigationRef';
import { colors, radii, shadows, spacing, typography } from '../theme';
import {
  getCartItemImageUrl,
  getCartLineTotal,
  mapPaymentMethodToBackend,
  type ApiCartItem,
} from '../utils/catalogFormat';
import { formatAddressLabel, formatAddressLine } from '../utils/addressFormat';
import { parseApiError } from '../utils/parseApiError';
type Nav = NativeStackNavigationProp<RootStackParamList>;

const PAYMENTS = [
  { id: 'card', label: 'Debit/Credit Card', icon: 'card-outline' as const },
  { id: 'transfer', label: 'Bank Transfer', icon: 'business-outline' as const },
  { id: 'pod', label: 'Pay on Delivery', icon: 'cash-outline' as const },
];

export function CheckoutScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute<R>();
  const navigation = useNavigation() as Nav;
  const { storeId } = route.params;
  const {
    selectedAddress,
    selectedAddressId,
    refreshAddresses,
    loading: addressesLoading,
  } = useAddresses();

  const [cart, setCart] = useState<any>(null);
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [note, setNote] = useState('Call me when you get to the gate');
  const [payId, setPayId] = useState('card');
  const [placing, setPlacing] = useState(false);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const cartData = await cartService.getCart();
      const cartObj = cartData.cart || cartData;
      setCart(cartObj);
      
      const storeData = await supermarketService.getSupermarketById(storeId);
      setStore(storeData.supermarket || storeData);
    } catch (error) {
      console.log('Error fetching checkout data:', error);
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useFocusEffect(
    useCallback(() => {
      void refreshAddresses();
      fetchCart();
    }, [fetchCart, refreshAddresses]),
  );

  const addr = selectedAddress;
  const items = cart?.items || [];

  if (loading || addressesLoading) {
    return (
      <View style={styles.miss}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!store || items.length === 0) {
    return (
      <View style={styles.miss}>
        <Text style={typography.body}>Nothing to checkout.</Text>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.link}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  if (!addr || !selectedAddressId) {
    return (
      <View style={styles.miss}>
        <Text style={typography.body}>Add a delivery address to continue.</Text>
        <Pressable onPress={() => navigation.navigate('SavedAddresses')}>
          <Text style={styles.link}>Add or select address</Text>
        </Pressable>
        <Pressable onPress={() => navigation.goBack()} style={{ marginTop: spacing.md }}>
          <Text style={styles.link}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const subtotal = Number(cart.subtotal || 0);
  const deliveryFee = Number(cart.deliveryFee || store?.deliveryFee || 0);
  const serviceFee = Number(cart.serviceFee || 0);
  const total = Number(cart.total || (subtotal + deliveryFee + serviceFee));

  const handlePlaceOrder = async () => {
    if (placing) return;
    
    if (!selectedAddressId || !addr) {
      Alert.alert('Delivery address required', 'Please add and select a delivery address first.');
      return;
    }

    setPlacing(true);

    try {
      const orderRes = await orderService.createOrder({
        addressId: addr.id,
        paymentMethod: mapPaymentMethodToBackend(payId),
        deliveryNote: note,
      });
      
      // Assume backend returns { order: { id: '...' } } or similar
      const orderId = orderRes.order?.id || orderRes.id;
      
      if (!orderId) throw new Error('Order creation failed on backend.');

      // Only call mock-confirm for online payments, not pay-on-delivery
      if (mapPaymentMethodToBackend(payId) !== 'PAY_ON_DELIVERY') {
        await paymentService.mockConfirm(orderId);
      }

      // Clear the local cart UI state via the API (or rely on backend auto-clear depending on architecture)
      try {
        await cartService.clearCart();
      } catch (e) {
        // Ignore errors if backend already cleared it on successful order
      }

      Alert.alert(
        'Order placed',
        `Your order is confirmed. Track it anytime from the Orders tab.`,
        [
          {
            text: 'Continue',
            onPress: () =>
              navigation.reset({
                index: 1,
                routes: [
                  { name: 'MainTabs' },
                  { name: 'OrderSuccess', params: { orderId } },
                ],
              }),
          },
        ]
      );
    } catch (error: unknown) {
      Alert.alert(
        'Checkout Error',
        parseApiError(error, {
          fallback: 'Failed to place order. Please try again.',
        }),
      );
    } finally {
      setPlacing(false);
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{
        padding: spacing.xl,
        paddingBottom: insets.bottom + 100,
      }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.rowHead}>
        <Text style={styles.h}>Delivery address</Text>
        <Pressable
          disabled={placing}
          onPress={() => navigation.navigate('SavedAddresses')}
        >
          <Text style={[styles.change, placing && styles.changeDisabled]}>
            Change
          </Text>
        </Pressable>
      </View>
      <View style={styles.card}>
        <View style={styles.addrRow}>
          <View style={styles.pin}>
            <Ionicons name="location" size={22} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.addrTitle}>{formatAddressLabel(addr)}</Text>
            <Text style={styles.addrLine}>{formatAddressLine(addr)}</Text>
          </View>
        </View>
      </View>
      <Text style={[styles.h, { marginTop: spacing.xl }]}>Delivery note</Text>
      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="Instructions for rider"
        placeholderTextColor={colors.textMuted}
        multiline
        editable={!placing}
        style={[styles.note, placing && styles.inputDisabled]}
      />
      <Text style={[styles.h, { marginTop: spacing.lg }]}>Payment method</Text>
      {PAYMENTS.map((p) => (
        <Pressable
          key={p.id}
          style={[
            styles.payRow,
            payId === p.id && styles.payOn,
            placing && styles.payDisabled,
          ]}
          disabled={placing}
          onPress={() => setPayId(p.id)}
        >
          <Ionicons name={p.icon} size={22} color={colors.primary} />
          <Text style={styles.payLab}>{p.label}</Text>
          <Ionicons
            name={payId === p.id ? 'radio-button-on' : 'radio-button-off'}
            size={22}
            color={payId === p.id ? colors.primary : colors.textMuted}
          />
        </Pressable>
      ))}
      <View style={styles.rowHead}>
        <Text style={styles.h}>Order summary</Text>
        <View style={styles.tag}>
          <Ionicons name="storefront-outline" size={14} color={colors.primary} />
          <Text style={styles.tagTxt}>{store.name.split(' ')[0]}</Text>
        </View>
      </View>
      <View style={styles.card}>
        {items.map((l: ApiCartItem) => (
          <View key={l.id || l.product?.id} style={styles.itemRow}>
            <ProductImage
              uri={getCartItemImageUrl(l)}
              style={styles.thumb}
              label={l.product?.name}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.iname}>{l.product?.name}</Text>
              <Text style={styles.iqty}>Qty: {l.quantity}</Text>
            </View>
            <Text style={styles.iprice}>
              ₦{getCartLineTotal(l).toLocaleString()}
            </Text>
          </View>
        ))}
        <View style={styles.div} />
        <View style={styles.sumRow}>
          <Text style={styles.sumLab}>Subtotal</Text>
          <Text style={styles.sumVal}>₦{Number(subtotal || 0).toLocaleString()}</Text>
        </View>
        <View style={styles.sumRow}>
          <Text style={styles.sumLab}>Delivery fee</Text>
          <Text style={styles.sumVal}>₦{Number(deliveryFee || 0).toLocaleString()}</Text>
        </View>
        <View style={styles.sumRow}>
          <Text style={styles.sumLab}>Service fee</Text>
          <Text style={styles.sumVal}>₦{Number(serviceFee || 0).toLocaleString()}</Text>
        </View>
        <View style={styles.div} />
        <View style={styles.sumRow}>
          <Text style={styles.totalLab}>Total</Text>
          <Text style={styles.totalVal}>₦{Number(total || 0).toLocaleString()}</Text>
        </View>
      </View>
      <Pressable
        style={[styles.cta, placing && styles.ctaDisabled]}
        disabled={placing}
        onPress={handlePlaceOrder}
      >
        {placing ? (
          <>
            <ActivityIndicator color={colors.surface} />
            <Text style={styles.ctaTxt}>Placing order…</Text>
          </>
        ) : (
          <>
            <Text style={styles.ctaTxt}>Place order</Text>
            <Ionicons name="arrow-forward" size={20} color={colors.surface} />
          </>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  miss: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  link: { color: colors.primary, fontWeight: '700' },
  rowHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  h: { fontWeight: '800', fontSize: 16, color: colors.text },
  change: { color: colors.primary, fontWeight: '600' },
  changeDisabled: { opacity: 0.45 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    ...shadows.soft,
  },
  addrRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  pin: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addrTitle: { fontWeight: '700', color: colors.text },
  addrLine: { color: colors.textSecondary, marginTop: 4, lineHeight: 20 },
  note: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    minHeight: 100,
    textAlignVertical: 'top',
    color: colors.text,
    marginTop: spacing.sm,
  },
  inputDisabled: { opacity: 0.65 },
  payRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  payOn: { borderColor: colors.primary, borderWidth: 2 },
  payDisabled: { opacity: 0.55 },
  payLab: { flex: 1, fontWeight: '600', color: colors.text },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.mint,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  tagTxt: { fontSize: 12, fontWeight: '600', color: colors.primary },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  thumb: { width: 48, height: 48, borderRadius: radii.sm },
  iname: { fontWeight: '700', color: colors.text, fontSize: 13 },
  iqty: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  iprice: { fontWeight: '700', color: colors.text },
  div: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  sumRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sumLab: { color: colors.textSecondary },
  sumVal: { color: colors.text },
  totalLab: { fontWeight: '800', color: colors.text },
  totalVal: { fontWeight: '800', color: colors.primary, fontSize: 18 },
  cta: {
    marginTop: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  ctaTxt: { color: colors.surface, fontWeight: '800', fontSize: 16 },
  ctaDisabled: { opacity: 0.88 },
});
