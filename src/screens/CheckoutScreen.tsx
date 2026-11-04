import { Ionicons } from '@expo/vector-icons';
import {
  useRoute,
  useNavigation,
  type RouteProp,
  useFocusEffect,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LoaderView } from '../components/brand/GrabitLoader';
import { EmptyState } from '../components/common/EmptyState';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { SummaryRow } from '../components/common/SummaryRow';
import { FadeInUp } from '../components/motion/FadeInUp';
import { ProductImage } from '../components/ProductImage';

import { cartService } from '../services/cartService';
import { supermarketService } from '../services/supermarketService';
import { orderService } from '../services/orderService';
import { paymentService } from '../services/paymentService';
import { useAddresses } from '../context/AddressContext';
import type { RootStackParamList } from '../navigation/navigationRef';
import { brand, colors, fonts, radii, shadows, spacing } from '../theme';
import {
  getCartItemImageUrl,
  getCartLineTotal,
  mapPaymentMethodToBackend,
  type ApiCartItem,
} from '../utils/catalogFormat';
import { formatAddressLabel, formatAddressLine } from '../utils/addressFormat';
import { haptic } from '../utils/haptics';
import { parseApiError } from '../utils/parseApiError';
import { useBarHeight, useLayout } from '../utils/responsive';
import { appAlert } from '../context/DialogContext';
type Nav = NativeStackNavigationProp<RootStackParamList>;
type R = RouteProp<RootStackParamList, 'Checkout'>;

const PAYMENTS = [
  { id: 'card', label: 'Debit/Credit Card', sub: 'Pay securely now', icon: 'card' as const },
  { id: 'transfer', label: 'Bank Transfer', sub: 'Transfer from your bank app', icon: 'business' as const },
  { id: 'pod', label: 'Pay on Delivery', sub: 'Cash or POS at your door', icon: 'cash' as const },
];

function Section({ n, title, right, children }: { n: number; title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <FadeInUp index={n} style={{ marginBottom: spacing.xl }}>
      <View style={styles.rowHead}>
        <View style={styles.rowHeadLeft}>
          <View style={styles.num}>
            <Text style={styles.numTxt}>{n}</Text>
          </View>
          <Text maxFontSizeMultiplier={1.25} style={styles.h}>{title}</Text>
        </View>
        {right}
      </View>
      {children}
    </FadeInUp>
  );
}

export function CheckoutScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute<R>();
  const navigation = useNavigation() as Nav;
  const { storeId } = route.params;
  const { selectedAddress, selectedAddressId, refreshAddresses, loading: addressesLoading } = useAddresses();

  const [cart, setCart] = useState<any>(null);
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [note, setNote] = useState('Call me when you get to the gate');
  const [payId, setPayId] = useState('card');
  const [placing, setPlacing] = useState(false);
  const [barH, onBarLayout] = useBarHeight(110);
  const { gutter } = useLayout();

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
    return <LoaderView label="Getting your order ready…" />;
  }

  if (!store || items.length === 0) {
    return (
      <View style={styles.missWrap}>
        <EmptyState art="bag" title="Nothing to checkout" actionLabel="Go back" onAction={() => navigation.goBack()} />
      </View>
    );
  }

  if (!addr || !selectedAddressId) {
    return (
      <View style={styles.missWrap}>
        <EmptyState
          art="mark"
          title="Where should we deliver?"
          body="Add a delivery address to continue."
          actionLabel="Add or select address"
          onAction={() => navigation.navigate('SavedAddresses')}
        />
      </View>
    );
  }

  const subtotal = Number(cart.subtotal || 0);
  const deliveryFee = Number(cart.deliveryFee || store?.deliveryFee || 0);
  const serviceFee = Number(cart.serviceFee || 0);
  const total = Number(cart.total || subtotal + deliveryFee + serviceFee);

  const handlePlaceOrder = async () => {
    if (placing) return;

    if (!selectedAddressId || !addr) {
      appAlert('Delivery address required', 'Please add and select a delivery address first.');
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

      // The success screen does the celebrating (bag fill + check + confetti).
      navigation.reset({
        index: 1,
        routes: [{ name: 'MainTabs' }, { name: 'OrderSuccess', params: { orderId } }],
      });
    } catch (error: unknown) {
      haptic.error();
      appAlert(
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
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={{ padding: gutter, paddingTop: spacing.xl, paddingBottom: barH + spacing.xl }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Section
          n={1}
          title="Deliver to"
          right={
            <Pressable disabled={placing} onPress={() => navigation.navigate('SavedAddresses')} hitSlop={8}>
              <Text style={[styles.change, placing && styles.changeDisabled]}>Change</Text>
            </Pressable>
          }
        >
          <View style={styles.card}>
            <View style={styles.addrRow}>
              <View style={styles.pin}>
                <Ionicons name="location" size={22} color={brand.cream} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.addrTitle}>{formatAddressLabel(addr)}</Text>
                <Text style={styles.addrLine}>{formatAddressLine(addr)}</Text>
              </View>
            </View>
            <View style={styles.noteWrap}>
              <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.textSecondary} style={{ marginTop: 2 }} />
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="Instructions for your rider"
                placeholderTextColor={colors.textMuted}
                multiline
                editable={!placing}
                style={[styles.note, placing && styles.inputDisabled]}
                accessibilityLabel="Delivery note"
              />
            </View>
          </View>
        </Section>

        <Section n={2} title="Payment">
          {PAYMENTS.map((p) => {
            const on = payId === p.id;
            return (
              <Pressable
                key={p.id}
                style={[styles.payRow, on && styles.payOn, placing && styles.payDisabled]}
                disabled={placing}
                onPress={() => {
                  haptic.select();
                  setPayId(p.id);
                }}
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
              >
                <View style={[styles.payIcon, on && { backgroundColor: brand.green }]}>
                  <Ionicons name={p.icon} size={20} color={on ? brand.cream : brand.green} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.payLab}>{p.label}</Text>
                  <Text style={styles.paySub}>{p.sub}</Text>
                </View>
                <View style={[styles.radio, on && styles.radioOn]}>{on ? <View style={styles.radioDot} /> : null}</View>
              </Pressable>
            );
          })}
        </Section>

        <Section
          n={3}
          title="Your order"
          right={
            <View style={styles.tag}>
              <Ionicons name="storefront" size={13} color={colors.primary} />
              <Text style={styles.tagTxt} numberOfLines={1}>
                {store.name.split(' ')[0]}
              </Text>
            </View>
          }
        >
          <View style={styles.card}>
            {items.map((l: ApiCartItem) => (
              <View key={l.id || l.product?.id} style={styles.itemRow}>
                <ProductImage uri={getCartItemImageUrl(l)} style={styles.thumb} label={l.product?.name} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.iname} numberOfLines={1}>
                    {l.product?.name}
                  </Text>
                  <Text style={styles.iqty}>Qty {l.quantity}</Text>
                </View>
                <Text style={styles.iprice}>₦{getCartLineTotal(l).toLocaleString()}</Text>
              </View>
            ))}
            <View style={styles.div} />
            <SummaryRow label="Subtotal" value={`₦${Number(subtotal || 0).toLocaleString()}`} />
            <SummaryRow label="Delivery fee" value={`₦${Number(deliveryFee || 0).toLocaleString()}`} />
            <SummaryRow label="Service fee" value={`₦${Number(serviceFee || 0).toLocaleString()}`} />
            <View style={styles.div} />
            <SummaryRow label="Total" emphasis value={`₦${Number(total || 0).toLocaleString()}`} />
          </View>
        </Section>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + spacing.md }]} onLayout={onBarLayout}>
        <PrimaryButton
          label={placing ? 'Placing your order…' : `Place order · ₦${Number(total || 0).toLocaleString()}`}
          icon={placing ? undefined : 'arrow-forward'}
          loading={placing}
          disabled={placing}
          onPress={handlePlaceOrder}
        />
        <View style={styles.secure}>
          <Ionicons name="lock-closed" size={12} color={colors.textSecondary} />
          <Text style={styles.secureTxt}>Secure checkout</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  missWrap: { flex: 1, justifyContent: 'center', backgroundColor: colors.background },
  rowHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  rowHeadLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  num: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: brand.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numTxt: { fontFamily: fonts.black, fontSize: 13, color: brand.sprout },
  h: { fontFamily: fonts.display, fontSize: 20, letterSpacing: -0.2, color: colors.text },
  change: { fontFamily: fonts.bold, fontSize: 14, color: colors.primary },
  changeDisabled: { opacity: 0.45 },
  card: { backgroundColor: colors.surface, borderRadius: radii.xl, padding: spacing.lg, ...shadows.soft },
  addrRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  pin: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: brand.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addrTitle: { fontFamily: fonts.bold, fontSize: 16, color: colors.text },
  addrLine: { fontFamily: fonts.regular, color: colors.textSecondary, marginTop: 4, lineHeight: 20, fontSize: 14 },
  noteWrap: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  note: {
    flex: 1,
    minHeight: 64,
    textAlignVertical: 'top',
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 15,
    padding: 0,
  },
  inputDisabled: { opacity: 0.65 },
  payRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  payOn: { borderColor: colors.primary, backgroundColor: colors.tint },
  payDisabled: { opacity: 0.55 },
  payIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payLab: { fontFamily: fonts.bold, fontSize: 15, color: colors.text },
  paySub: { fontFamily: fonts.regular, fontSize: 12, color: colors.textSecondary, marginTop: 1 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { borderColor: colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.tint,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radii.pill,
    maxWidth: 140,
  },
  tagTxt: { fontFamily: fonts.bold, fontSize: 12, color: colors.primary },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  thumb: { width: 48, height: 48, borderRadius: radii.sm },
  iname: { fontFamily: fonts.bold, color: colors.text, fontSize: 14 },
  iqty: { fontFamily: fonts.regular, color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  iprice: { fontFamily: fonts.bold, color: colors.text, fontSize: 14 },
  div: { borderBottomWidth: 1.5, borderStyle: 'dashed', borderColor: colors.border, marginVertical: spacing.md },
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    ...shadows.lifted,
  },
  secure: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: spacing.sm },
  secureTxt: { fontFamily: fonts.medium, fontSize: 12, color: colors.textSecondary },
});
