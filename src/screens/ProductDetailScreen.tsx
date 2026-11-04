import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Alert, Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useRef, useState } from 'react';
import { LoaderView } from '../components/brand/GrabitLoader';
import { CartBubble } from '../components/common/CartBubble';
import { EmptyState } from '../components/common/EmptyState';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { FadeInUp } from '../components/motion/FadeInUp';
import { PressableScale } from '../components/motion/PressableScale';
import { ProductImage } from '../components/ProductImage';
import { measureView, useCartFly } from '../context/CartFlyContext';
import { useFavorites } from '../context/FavoriteContext';
import { showToast } from '../context/ToastContext';
import type { RootStackParamList } from '../navigation/navigationRef';
import { cartService } from '../services/cartService';
import { productService } from '../services/productService';
import { supermarketService } from '../services/supermarketService';
import { brand, colors, fonts, radii, shadows, spacing } from '../theme';
import { getProductImageUrl } from '../utils/catalogFormat';
import { haptic } from '../utils/haptics';
import { parseApiError } from '../utils/parseApiError';

type R = RouteProp<RootStackParamList, 'ProductDetail'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export function ProductDetailScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute<R>();
  const navigation = useNavigation<Nav>();
  const { storeId, productId } = route.params;
  const { isFavorite, toggleFavorite } = useFavorites();
  const { fly } = useCartFly();
  const [qty, setQty] = useState(1);
  const [store, setStore] = useState<any>(null);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [landSignal, setLandSignal] = useState(0);
  const imageRef = useRef<View>(null);
  const cartRef = useRef<View>(null);
  const heart = useRef(new Animated.Value(1)).current;
  const qtyPop = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Promise.all([
      supermarketService.getSupermarketById(storeId).catch(() => null),
      productService.getProductById(productId).catch(() => null),
    ]).then(([sRes, pRes]) => {
      if (sRes) setStore(sRes.supermarket || sRes);
      if (pRes) setProduct(pRes.product || pRes);
      setLoading(false);
    });
  }, [storeId, productId]);

  const bumpQty = (next: number) => {
    haptic.select();
    setQty(next);
    qtyPop.setValue(0.7);
    Animated.spring(qtyPop, { toValue: 1, friction: 4, tension: 220, useNativeDriver: true }).start();
  };

  if (loading) {
    return <LoaderView />;
  }

  if (!store || !product) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top + spacing.xxl }]}>
        <EmptyState art="search" title="Product not found" actionLabel="Go back" onAction={() => navigation.goBack()} />
      </View>
    );
  }

  const fav = isFavorite(product.id);
  const lineTotal = Number(product.price || 0) * qty;

  const onToggleFavorite = () => {
    haptic.tap();
    heart.setValue(0.6);
    Animated.spring(heart, { toValue: 1, friction: 3, tension: 200, useNativeDriver: true }).start();
    toggleFavorite(product.id);
  };

  const onAdd = async () => {
    if (adding) return;
    setAdding(true);
    try {
      await cartService.addItem(productId, qty);
      fly(await measureView(imageRef), getProductImageUrl(product), {
        to: await measureView(cartRef),
        onLand: () => setLandSignal((n) => n + 1),
      });
      showToast(`${qty} × ${product.name} added`, {
        action: { label: 'View cart', onPress: () => navigation.navigate('MainTabs', { screen: 'Cart' }) },
      });
    } catch (error: unknown) {
      haptic.error();
      Alert.alert(
        'Unable to Add to Cart',
        parseApiError(error, {
          fallback: 'Failed to add item to cart. Make sure you only add items from one supermarket.',
        }),
      );
    } finally {
      setAdding(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 130 }} showsVerticalScrollIndicator={false}>
        <View style={[styles.imageStage, { paddingTop: insets.top + 64 }]}>
          <View ref={imageRef} collapsable={false} style={styles.imageCard}>
            <ProductImage uri={getProductImageUrl(product)} style={styles.heroImg} label={product.name} />
          </View>
        </View>

        <View style={styles.body}>
          <FadeInUp>
            <View style={styles.storeChip}>
              <Ionicons name="storefront" size={14} color={colors.primary} />
              <Text style={styles.storeName} numberOfLines={1}>
                {store.name}
              </Text>
            </View>
            <Text style={styles.title}>{product.name}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.price}>₦{Number(product.price || 0).toLocaleString()}</Text>
              {product.unit ? <Text style={styles.unit}>/ {product.unit}</Text> : null}
            </View>
          </FadeInUp>

          <FadeInUp index={1}>
            <View style={styles.stepRow}>
              <View>
                <Text style={styles.stepLab}>Quantity</Text>
                <Text style={styles.stepVal}>
                  {qty} × {product.unit || 'item'}
                </Text>
              </View>
              <View style={styles.stepper}>
                <PressableScale
                  scaleTo={0.85}
                  style={styles.stepBtn}
                  onPress={() => bumpQty(Math.max(1, qty - 1))}
                  accessibilityRole="button"
                  accessibilityLabel="Decrease quantity"
                >
                  <Ionicons name="remove" size={20} color={colors.text} />
                </PressableScale>
                <Animated.Text style={[styles.stepNum, { transform: [{ scale: qtyPop }] }]}>{qty}</Animated.Text>
                <PressableScale
                  scaleTo={0.85}
                  style={[styles.stepBtn, styles.stepBtnPlus]}
                  onPress={() => bumpQty(qty + 1)}
                  accessibilityRole="button"
                  accessibilityLabel="Increase quantity"
                >
                  <Ionicons name="add" size={20} color={colors.surface} />
                </PressableScale>
              </View>
            </View>
          </FadeInUp>

          {product.description ? (
            <FadeInUp index={2}>
              <Text style={styles.sec}>About this item</Text>
              <Text style={styles.desc}>{product.description}</Text>
            </FadeInUp>
          ) : null}
        </View>
      </ScrollView>

      <View style={[styles.top, { paddingTop: insets.top + spacing.sm }]}>
        <PressableScale style={styles.iconCircle} onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Back">
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </PressableScale>
        <View style={styles.topRight}>
          <PressableScale
            style={styles.iconCircle}
            onPress={() => Alert.alert('Share', 'Share sheet (mock).')}
            accessibilityRole="button"
            accessibilityLabel="Share"
          >
            <Ionicons name="share-outline" size={20} color={colors.text} />
          </PressableScale>
          <Pressable
            style={styles.iconCircle}
            onPress={onToggleFavorite}
            accessibilityRole="button"
            accessibilityLabel={fav ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Animated.View style={{ transform: [{ scale: heart }] }}>
              <Ionicons name={fav ? 'heart' : 'heart-outline'} size={21} color={fav ? brand.tomato : colors.text} />
            </Animated.View>
          </Pressable>
          <CartBubble
            ref={cartRef}
            landSignal={landSignal}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Cart' })}
          />
        </View>
      </View>

      <View style={[styles.bar, { paddingBottom: insets.bottom + spacing.md }]}>
        <View>
          <Text style={styles.barLab}>Total</Text>
          <Text style={styles.barTot}>₦{lineTotal.toLocaleString()}</Text>
        </View>
        <View style={styles.barBtn}>
          <PrimaryButton
            label={adding ? 'Adding…' : 'Add to cart'}
            icon="bag-add"
            loading={adding}
            disabled={adding}
            onPress={onAdd}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  imageStage: {
    backgroundColor: colors.sand,
    borderBottomLeftRadius: radii.xxl,
    borderBottomRightRadius: radii.xxl,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  imageCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xxl,
    padding: spacing.md,
    ...shadows.card,
  },
  heroImg: { width: '100%', height: 260, borderRadius: radii.xl },
  body: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl },
  top: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  topRight: { flexDirection: 'row', gap: spacing.sm },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  storeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: colors.mint,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
    marginBottom: spacing.md,
    maxWidth: '100%',
  },
  storeName: { fontFamily: fonts.bold, fontSize: 13, color: colors.primaryDark },
  title: { fontFamily: fonts.display, fontSize: 28, lineHeight: 31, letterSpacing: -0.6, color: colors.text },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: spacing.sm, marginBottom: spacing.xl },
  price: { fontFamily: fonts.display, fontSize: 28, letterSpacing: -0.5, color: colors.primary },
  unit: { fontFamily: fonts.medium, fontSize: 15, color: colors.textSecondary },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radii.xl,
    marginBottom: spacing.xl,
    ...shadows.soft,
  },
  stepLab: { fontFamily: fonts.medium, fontSize: 12, color: colors.textSecondary },
  stepVal: { fontFamily: fonts.bold, fontSize: 15, color: colors.text, marginTop: 4 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.sand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnPlus: { backgroundColor: colors.primary },
  stepNum: { fontFamily: fonts.display, fontSize: 22, minWidth: 28, textAlign: 'center', color: colors.text },
  sec: { fontFamily: fonts.display, fontSize: 19, letterSpacing: -0.3, color: colors.text, marginBottom: spacing.sm },
  desc: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 23, color: colors.textSecondary },
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    ...shadows.lifted,
  },
  barLab: { fontFamily: fonts.medium, fontSize: 12, color: colors.textSecondary },
  barTot: { fontFamily: fonts.display, fontSize: 22, letterSpacing: -0.4, color: colors.text },
  barBtn: { flex: 1, maxWidth: 230 },
});
