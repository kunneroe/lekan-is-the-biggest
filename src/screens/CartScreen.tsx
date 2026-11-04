import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GrabitLoader, LoaderView } from '../components/brand/GrabitLoader';
import { GrabitMark } from '../components/brand/GrabitMark';
import { EmptyState } from '../components/common/EmptyState';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { SummaryRow } from '../components/common/SummaryRow';
import { AnimatedPrice } from '../components/motion/AnimatedPrice';
import { FadeInUp } from '../components/motion/FadeInUp';
import { PressableScale } from '../components/motion/PressableScale';
import { ProductImage } from '../components/ProductImage';
import { navigateRoot } from '../navigation/navigationRef';
import { cartService } from '../services/cartService';
import { supermarketService } from '../services/supermarketService';
import { brand, colors, fonts, radii, shadows, spacing } from '../theme';
import { getCartItemImageUrl, getCartUnitPrice, type ApiCartItem } from '../utils/catalogFormat';
import { haptic } from '../utils/haptics';
import { parseApiError } from '../utils/parseApiError';
import { TEXT_CAP, useBarHeight, useLayout } from '../utils/responsive';

export function CartScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [cart, setCart] = useState<any>(null);
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [barH, onBarLayout] = useBarHeight(84);
  const { gutter } = useLayout();

  const fetchCart = useCallback(async () => {
    try {
      const cartData = await cartService.getCart();
      const cartObj = cartData.cart || cartData;
      setCart(cartObj);

      if (cartObj?.supermarketId) {
        const storeData = await supermarketService.getSupermarketById(cartObj.supermarketId);
        setStore(storeData.supermarket || storeData);
      }
    } catch (error: any) {
      console.log('Error fetching cart:', error.message);
      // Backend might return 404 if cart is empty, handle gracefully
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchCart();
    }, [fetchCart]),
  );

  const updateLineQty = async (itemId: string, qty: number) => {
    if (updating) return;
    haptic.select();
    setUpdating(true);
    try {
      await cartService.updateItemQuantity(itemId, qty);
      await fetchCart();
    } catch (error: unknown) {
      Alert.alert(
        'Unable to Update Cart',
        parseApiError(error, {
          fallback: 'Failed to update quantity. Please try again.',
        }),
      );
    } finally {
      setUpdating(false);
    }
  };

  const removeLine = async (itemId: string) => {
    if (updating) return;
    haptic.tap();
    setUpdating(true);
    try {
      await cartService.removeItem(itemId);
      await fetchCart();
    } catch (error: unknown) {
      Alert.alert(
        'Unable to Update Cart',
        parseApiError(error, {
          fallback: 'Failed to remove item. Please try again.',
        }),
      );
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <LoaderView label="Opening your cart…" />;
  }

  const items = cart?.items || [];

  if (!cart || !store || items.length === 0) {
    return (
      <View style={[styles.screen, styles.emptyScreen, { paddingTop: insets.top + spacing.xl }]}>
        <EmptyState
          art="bag"
          title="Your cart is empty"
          body="Pick a supermarket, grab what you need, and it will show up here with quantities and totals."
          actionLabel="Browse supermarkets"
          onAction={() => navigation.navigate('Home' as never)}
        />
      </View>
    );
  }

  const subtotal = Number(cart.subtotal || 0);
  const deliveryFee = Number(cart.deliveryFee || store?.deliveryFee || 0);
  const serviceFee = Number(cart.serviceFee || 0);
  const total = Number(cart.total || subtotal + deliveryFee + serviceFee);
  const count = items.reduce((acc: number, l: ApiCartItem) => acc + l.quantity, 0);

  return (
    <View style={styles.screen}>
      <View style={[styles.head, { paddingTop: insets.top + spacing.md }]}>
        <View>
          <Text maxFontSizeMultiplier={1.25} style={styles.headTitle}>Your cart</Text>
          <Text style={styles.headSub}>
            {count} {count === 1 ? 'item' : 'items'}
          </Text>
        </View>
        {updating ? <GrabitLoader size={28} /> : <GrabitMark size={30} />}
      </View>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: gutter,
          paddingTop: spacing.sm,
          // reserve exactly the floating bar's height (it grows with big fonts)
          paddingBottom: barH + spacing.md * 2 + spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.banner}>
          <View style={styles.bannerIcon}>
            <Ionicons name="storefront" size={18} color={brand.oat} />
          </View>
          <Text style={styles.bannerTxt}>
            Grabbing from <Text style={styles.bannerBold}>{store.name}</Text>. Delivery times may vary.
          </Text>
        </View>

        {items.map((l: ApiCartItem, i: number) => (
          <FadeInUp key={l.id || l.product?.id} index={i}>
            <View style={[styles.line, updating && { opacity: 0.7 }]}>
              <ProductImage uri={getCartItemImageUrl(l)} style={styles.thumb} label={l.product?.name} />
              <View style={{ flex: 1 }}>
                <Text style={styles.pname} numberOfLines={2}>
                  {l.product?.name}
                </Text>
                {l.product?.unit ? <Text style={styles.psub}>{l.product?.unit}</Text> : null}
                <Text maxFontSizeMultiplier={1.25} style={styles.pprice}>₦{getCartUnitPrice(l).toLocaleString()}</Text>
              </View>
              <View style={styles.step}>
                <PressableScale
                  scaleTo={0.8}
                  style={styles.stepBtn}
                  accessibilityRole="button"
                  accessibilityLabel={l.quantity <= 1 ? `Remove ${l.product?.name}` : 'Decrease quantity'}
                  onPress={() =>
                    l.quantity <= 1
                      ? Alert.alert('Remove item?', '', [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Remove', style: 'destructive', onPress: () => removeLine(l.id) },
                        ])
                      : updateLineQty(l.id, l.quantity - 1)
                  }
                >
                  <Ionicons name={l.quantity <= 1 ? 'trash-outline' : 'remove'} size={17} color={colors.text} />
                </PressableScale>
                <Text style={styles.stepNum}>{l.quantity}</Text>
                <PressableScale
                  scaleTo={0.8}
                  style={[styles.stepBtn, styles.stepPlus]}
                  accessibilityRole="button"
                  accessibilityLabel="Increase quantity"
                  onPress={() => updateLineQty(l.id, l.quantity + 1)}
                >
                  <Ionicons name="add" size={17} color={colors.surface} />
                </PressableScale>
              </View>
            </View>
          </FadeInUp>
        ))}

        <Pressable
          style={({ pressed }) => [styles.addMore, pressed && { opacity: 0.7 }]}
          onPress={() => navigateRoot('Store', { storeId: store.id })}
          accessibilityRole="button"
        >
          <Ionicons name="add-circle" size={22} color={colors.primary} />
          <Text style={styles.addMoreTxt}>Grab more from {store.name.split(' ')[0]}</Text>
        </Pressable>

        <View style={styles.summary}>
          <Text maxFontSizeMultiplier={1.25} style={styles.sumTitle}>Order summary</Text>
          <SummaryRow label="Subtotal" value={<AnimatedPrice value={subtotal} style={styles.sumVal} />} />
          <SummaryRow
            label="Delivery fee"
            value={deliveryFee === 0 ? 'Free' : `₦${Number(deliveryFee || 0).toLocaleString()}`}
            valueColor={deliveryFee === 0 ? colors.primary : undefined}
          />
          <SummaryRow label="Service fee" value={`₦${Number(serviceFee || 0).toLocaleString()}`} />
          <View style={styles.div} />
          <SummaryRow label="Total" emphasis value={<AnimatedPrice value={total} style={styles.totVal} />} />
        </View>
      </ScrollView>
      <View style={styles.checkoutBar} onLayout={onBarLayout}>
        <View style={styles.barLeft}>
          <Text style={styles.barLab} maxFontSizeMultiplier={TEXT_CAP.control}>
            Total
          </Text>
          <AnimatedPrice value={total} style={styles.barTot} fit />
        </View>
        <View style={styles.barBtn}>
          <PrimaryButton
            label="Checkout"
            icon="arrow-forward"
            onPress={() => navigateRoot('Checkout', { storeId: store.id })}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  emptyScreen: { justifyContent: 'center' },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  headTitle: { fontFamily: fonts.display, fontSize: 30, letterSpacing: -0.8, color: colors.text },
  headSub: { fontFamily: fonts.medium, fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.mint,
    padding: spacing.md,
    borderRadius: radii.lg,
    marginBottom: spacing.lg,
  },
  bannerIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTxt: { flex: 1, fontFamily: fonts.regular, color: colors.text, fontSize: 13, lineHeight: 18 },
  bannerBold: { fontFamily: fonts.bold },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radii.xl,
    marginBottom: spacing.md,
    ...shadows.soft,
  },
  thumb: { width: 76, height: 76, borderRadius: radii.md },
  pname: { fontFamily: fonts.bold, fontSize: 15, color: colors.text },
  psub: { fontFamily: fonts.regular, color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  pprice: { fontFamily: fonts.display, fontSize: 16, color: colors.text, marginTop: 6 },
  step: {
    alignItems: 'center',
    backgroundColor: colors.sand,
    borderRadius: radii.pill,
    padding: 4,
    gap: 2,
  },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepPlus: { backgroundColor: colors.primary },
  stepNum: { fontFamily: fonts.black, fontSize: 15, minWidth: 24, textAlign: 'center', color: colors.text },
  addMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.mintStrong,
    padding: spacing.lg,
    borderRadius: radii.lg,
    marginBottom: spacing.xl,
  },
  addMoreTxt: { fontFamily: fonts.bold, color: colors.primary, fontSize: 15 },
  summary: { backgroundColor: colors.surface, borderRadius: radii.xl, padding: spacing.lg, ...shadows.soft },
  sumTitle: { fontFamily: fonts.display, fontSize: 18, marginBottom: spacing.md, color: colors.text },
  sumVal: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text, textAlign: 'right' },
  barLeft: { flexShrink: 1, minWidth: 84 },
  barBtn: { flexGrow: 1, flexShrink: 0, flexBasis: 150, maxWidth: 230 },
  div: {
    borderBottomWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
    marginVertical: spacing.md,
  },
  totVal: { fontFamily: fonts.display, fontSize: 20, color: colors.primary, textAlign: 'right' },
  checkoutBar: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
    backgroundColor: brand.forest,
    borderRadius: radii.xl,
    paddingVertical: spacing.sm,
    paddingLeft: spacing.xl,
    paddingRight: spacing.sm,
    ...shadows.lifted,
  },
  barLab: { fontFamily: fonts.medium, fontSize: 12, color: brand.lime },
  barTot: { fontFamily: fonts.display, fontSize: 21, color: brand.oat },
});
