import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
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
import { navigateRoot } from '../navigation/navigationRef';
import { cartService } from '../services/cartService';
import { supermarketService } from '../services/supermarketService';
import { colors, radii, shadows, spacing, typography } from '../theme';
import {
  getCartItemImageUrl,
  getCartUnitPrice,
  type ApiCartItem,
} from '../utils/catalogFormat';
import { parseApiError } from '../utils/parseApiError';

export function CartScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  
  const [cart, setCart] = useState<any>(null);
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

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
    }, [fetchCart])
  );

  const updateLineQty = async (itemId: string, qty: number) => {
    if (updating) return;
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
    return (
      <View style={[styles.empty, { paddingTop: insets.top + spacing.xxl }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const items = cart?.items || [];

  if (!cart || !store || items.length === 0) {
    return (
      <View style={[styles.empty, { paddingTop: insets.top + spacing.xxl }]}>
        <Ionicons name="cart-outline" size={64} color={colors.textMuted} />
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySub}>
          Pick a supermarket on Home, add products to your cart, and they will
          show up here with quantities and totals.
        </Text>
        <Pressable
          style={styles.emptyBtn}
          onPress={() => navigation.navigate('Home' as never)}
        >
          <Text style={styles.emptyBtnTxt}>Browse supermarkets</Text>
        </Pressable>
      </View>
    );
  }

  const subtotal = Number(cart.subtotal || 0);
  const deliveryFee = Number(cart.deliveryFee || store?.deliveryFee || 0);
  const serviceFee = Number(cart.serviceFee || 0);
  const total = Number(cart.total || (subtotal + deliveryFee + serviceFee));

  return (
    <View style={styles.screen}>
      <View style={[styles.head, { paddingTop: insets.top + spacing.md }]}>
        <View style={{ width: 24 }} />
        <Text style={styles.headTitle}>My cart · {store.name.split(' ')[0]}</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView
        contentContainerStyle={{
          padding: spacing.xl,
          paddingBottom: insets.bottom + 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.banner}>
          <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
          <Text style={styles.bannerTxt}>
            Items from <Text style={styles.bannerBold}>{store.name}</Text>. Delivery times
            may vary.
          </Text>
        </View>
        {items.map((l: ApiCartItem) => (
          <View key={l.id || l.product?.id} style={styles.line}>
            <ProductImage
              uri={getCartItemImageUrl(l)}
              style={styles.thumb}
              label={l.product?.name}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.pname}>{l.product?.name}</Text>
              <Text style={styles.psub}>{l.product?.unit}</Text>
              <Text style={styles.pprice}>
                ₦{getCartUnitPrice(l).toLocaleString()} each
              </Text>
            </View>
            <View style={styles.step}>
              <Pressable
                onPress={() =>
                  l.quantity <= 1
                    ? Alert.alert('Remove item?', '', [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Remove', onPress: () => removeLine(l.id) },
                      ])
                    : updateLineQty(l.id, l.quantity - 1)
                }
              >
                <Text style={styles.stepTxt}>−</Text>
              </Pressable>
              <Text style={styles.stepNum}>{l.quantity}</Text>
              <Pressable onPress={() => updateLineQty(l.id, l.quantity + 1)}>
                <Text style={styles.stepTxt}>+</Text>
              </Pressable>
            </View>
          </View>
        ))}
        <Pressable
          style={styles.addMore}
          onPress={() => navigateRoot('Store', { storeId: store.id })}
        >
          <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
          <Text style={styles.addMoreTxt}>Add more from {store.name.split(' ')[0]}</Text>
        </Pressable>
        <View style={styles.summary}>
          <Text style={styles.sumTitle}>Order summary</Text>
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
            <Text style={styles.totLab}>Total</Text>
            <Text style={styles.totVal}>₦{Number(total || 0).toLocaleString()}</Text>
          </View>
        </View>
      </ScrollView>
      <Pressable
        style={[styles.checkout, { paddingBottom: insets.bottom + spacing.md }]}
        onPress={() => navigateRoot('Checkout', { storeId: store.id })}
      >
        <Text style={styles.checkoutTxt}>Proceed to checkout</Text>
        <Ionicons name="chevron-forward" size={22} color={colors.surface} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headTitle: {
    fontWeight: '800',
    color: colors.primary,
    fontSize: 16,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  emptyTitle: {
    ...typography.sectionTitle,
    marginTop: spacing.lg,
    color: colors.text,
  },
  emptySub: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  emptyBtn: {
    marginTop: spacing.xl,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    borderRadius: radii.md,
  },
  emptyBtnTxt: { color: colors.surface, fontWeight: '800' },
  banner: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.mint,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.lg,
  },
  bannerTxt: { flex: 1, color: colors.text, fontSize: 13, lineHeight: 18 },
  bannerBold: { fontWeight: '800' },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radii.lg,
    marginBottom: spacing.md,
    ...shadows.soft,
  },
  thumb: { width: 72, height: 72, borderRadius: radii.sm },
  pname: { fontWeight: '800', color: colors.text },
  psub: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  pprice: { color: colors.primary, fontWeight: '700', marginTop: 4 },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.mint,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
  },
  stepTxt: { fontSize: 18, fontWeight: '700', paddingHorizontal: spacing.sm },
  stepNum: { fontWeight: '800', minWidth: 24, textAlign: 'center' },
  addMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    padding: spacing.lg,
    borderRadius: radii.md,
    marginBottom: spacing.xl,
  },
  addMoreTxt: { color: colors.primary, fontWeight: '700' },
  summary: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    ...shadows.soft,
  },
  sumTitle: { fontWeight: '800', marginBottom: spacing.md, color: colors.text },
  sumRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sumLab: { color: colors.textSecondary },
  sumVal: { color: colors.text },
  div: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  totLab: { fontWeight: '800', color: colors.text },
  totVal: { fontWeight: '800', color: colors.primary, fontSize: 18 },
  checkout: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  checkoutTxt: { color: colors.surface, fontWeight: '800', fontSize: 16 },
});
