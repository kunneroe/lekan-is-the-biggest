import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GrabitLoader, LoaderView } from '../components/brand/GrabitLoader';
import { CartBubble } from '../components/common/CartBubble';
import { EmptyState } from '../components/common/EmptyState';
import { FadeInUp } from '../components/motion/FadeInUp';
import { PressableScale } from '../components/motion/PressableScale';
import { ProductCardSkeleton } from '../components/motion/Skeleton';
import { ProductImage } from '../components/ProductImage';
import { measureView, useCartFly } from '../context/CartFlyContext';
import { showToast } from '../context/ToastContext';
import type { RootStackParamList } from '../navigation/navigationRef';
import { categoryService } from '../services/categoryService';
import { supermarketService } from '../services/supermarketService';
import { productService } from '../services/productService';
import { cartService } from '../services/cartService';
import { brand, colors, fonts, radii, shadows, spacing } from '../theme';
import {
  getProductCategoryName,
  getProductImageUrl,
  getSupermarketEta,
  getSupermarketImageUrl,
  toCategoryGridItems,
  type ApiCategory,
  type ApiProduct,
} from '../utils/catalogFormat';
import { haptic } from '../utils/haptics';
import { parseApiError } from '../utils/parseApiError';

type R = RouteProp<RootStackParamList, 'Store'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

const HERO_H = 270;

export function StoreScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute<R>();
  const navigation = useNavigation<Nav>();
  const { storeId, categoryId: routeCategory } = route.params;
  const { fly } = useCartFly();
  const scrollY = useRef(new Animated.Value(0)).current;
  const cartRef = useRef<View>(null);
  const [landSignal, setLandSignal] = useState(0);

  const [store, setStore] = useState<any>(null);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [allProducts, setAllProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(routeCategory ?? null);
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    setCategoryId(routeCategory ?? null);
  }, [storeId, routeCategory]);

  useEffect(() => {
    const loadStoreMeta = async () => {
      try {
        setLoading(true);
        const [storeData, categoryList] = await Promise.all([
          supermarketService.getSupermarketById(storeId),
          categoryService.getCategories(),
        ]);
        setStore(storeData.supermarket || storeData);
        setCategories(categoryList);
      } catch (error: unknown) {
        Alert.alert(
          'Unable to Load Store',
          parseApiError(error, {
            fallback: 'Failed to load store details. Please try again.',
          }),
        );
      } finally {
        setLoading(false);
      }
    };
    loadStoreMeta();
  }, [storeId]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setProductsLoading(true);
        const params = categoryId ? { categoryId } : undefined;
        const productsData = await productService.getProductsBySupermarket(storeId, params);
        setAllProducts(productsData.products || productsData || []);
      } catch (error: unknown) {
        Alert.alert(
          'Unable to Load Products',
          parseApiError(error, {
            fallback: 'Failed to load products. Please try again.',
          }),
        );
      } finally {
        setProductsLoading(false);
      }
    };
    if (!loading) {
      loadProducts();
    }
  }, [storeId, categoryId, loading]);

  const filtered = useMemo(() => {
    if (!search.trim()) return allProducts;
    const q = search.trim().toLowerCase();
    return allProducts.filter(
      (p) => p.name.toLowerCase().includes(q) || getProductCategoryName(p).toLowerCase().includes(q),
    );
  }, [allProducts, search]);

  const handleAddToCart = async (product: ApiProduct, imageRef: { current: View | null }) => {
    if (addingId) return;
    setAddingId(product.id);
    try {
      await cartService.addItem(product.id, 1);
      fly(await measureView(imageRef), getProductImageUrl(product), {
        to: await measureView(cartRef),
        onLand: () => setLandSignal((n) => n + 1),
      });
      showToast(`${product.name} added`, {
        action: { label: 'View cart', onPress: () => navigation.navigate('MainTabs', { screen: 'Cart' }) },
      });
    } catch (error: unknown) {
      haptic.error();
      Alert.alert(
        'Cart Error',
        parseApiError(error, {
          fallback: 'Failed to add item to cart. Make sure you only add items from one supermarket.',
        }),
      );
    } finally {
      setAddingId(null);
    }
  };

  if (loading) {
    return <LoaderView label="Opening store…" />;
  }

  if (!store) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top + spacing.xxl }]}>
        <EmptyState
          art="mark"
          title="Store not found"
          body="This store may be closed or no longer on Grabit."
          actionLabel="Go back"
          onAction={() => navigation.goBack()}
        />
      </View>
    );
  }

  const { min, max } = getSupermarketEta(store);
  const deliveryFee = store.deliveryFee !== undefined ? store.deliveryFee : 500;
  const categoryChips = toCategoryGridItems(categories);

  const heroScale = scrollY.interpolate({ inputRange: [-200, 0], outputRange: [1.6, 1], extrapolateRight: 'clamp' });
  const heroShift = scrollY.interpolate({ inputRange: [0, HERO_H], outputRange: [0, HERO_H * 0.4], extrapolateLeft: 'clamp' });
  const barBg = scrollY.interpolate({ inputRange: [HERO_H - 140, HERO_H - 80], outputRange: [0, 1], extrapolate: 'clamp' });

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={[styles.hero, { transform: [{ translateY: heroShift }, { scale: heroScale }] }]}>
          <ProductImage uri={getSupermarketImageUrl(store)} style={StyleSheet.absoluteFillObject} label={store.name} />
          <View style={styles.heroScrim} />
          <View style={[styles.heroText, { paddingBottom: spacing.xxl + spacing.xl }]}>
            <Text maxFontSizeMultiplier={1.25} style={styles.heroTitle} numberOfLines={2}>
              {store.name}
            </Text>
            <View style={styles.heroChips}>
              <View style={styles.heroChip}>
                <Ionicons name="star" size={13} color={colors.star} />
                <Text style={styles.heroChipTxt}>{store.rating || '4.5'}</Text>
              </View>
              <View style={styles.heroChip}>
                <Ionicons name="time-outline" size={13} color={brand.oat} />
                <Text style={styles.heroChipTxt}>
                  {min}–{max} min
                </Text>
              </View>
              <View style={[styles.heroChip, Number(deliveryFee) === 0 && { backgroundColor: brand.lime }]}>
                <Ionicons name="bicycle" size={13} color={Number(deliveryFee) === 0 ? brand.forest : brand.oat} />
                <Text style={[styles.heroChipTxt, Number(deliveryFee) === 0 && { color: brand.forest }]}>
                  {Number(deliveryFee) === 0 ? 'Free delivery' : `₦${Number(deliveryFee).toLocaleString()} delivery`}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        <View style={styles.body}>
          <View style={styles.searchWrap}>
            <Ionicons name="search" size={20} color={colors.textMuted} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder={`Search ${store.name}`}
              placeholderTextColor={colors.textMuted}
              style={styles.searchIn}
              accessibilityLabel="Search in store"
            />
            {search ? (
              <Pressable onPress={() => setSearch('')} hitSlop={10} accessibilityLabel="Clear search">
                <Ionicons name="close-circle" size={20} color={colors.textMuted} />
              </Pressable>
            ) : null}
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
            style={styles.chipsScroll}
          >
            {[{ id: null as string | null, name: 'All' }, ...categoryChips].map((c) => {
              const on = c.id === null ? !categoryId : categoryId === c.id;
              return (
                <Pressable
                  key={c.id ?? '__all'}
                  style={[styles.chip, on && styles.chipOn]}
                  onPress={() => {
                    haptic.select();
                    setCategoryId(c.id === null ? null : categoryId === c.id ? null : c.id);
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                >
                  <Text style={[styles.chipTxt, on && styles.chipTxtOn]}>{c.name}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <View style={styles.secHead}>
            <Text maxFontSizeMultiplier={1.25} style={styles.secTitle}>Products</Text>
            {productsLoading ? (
              <GrabitLoader size={20} />
            ) : (
              <Text style={styles.secSub}>{filtered.length} items</Text>
            )}
          </View>

          {productsLoading && allProducts.length === 0 ? (
            <View style={styles.grid}>
              {[0, 1, 2, 3].map((i) => (
                <ProductCardSkeleton key={i} index={i} />
              ))}
            </View>
          ) : filtered.length === 0 ? (
            <EmptyState
              art="search"
              title={search ? 'Nothing matches that' : 'No products here yet'}
              body={search ? `We couldn't find "${search}" in this store.` : 'Try another category.'}
            />
          ) : (
            <View style={styles.grid}>
              {filtered.map((p, i) => (
                <ProductCard
                  key={p.id}
                  index={i}
                  product={p}
                  isAdding={addingId === p.id}
                  onOpen={() => navigation.navigate('ProductDetail', { storeId, productId: p.id })}
                  onAdd={(ref) => handleAddToCart(p, ref)}
                />
              ))}
            </View>
          )}
        </View>
      </Animated.ScrollView>

      <Animated.View pointerEvents="none" style={[styles.topBar, { height: insets.top + 60, opacity: barBg }]}>
        <Text maxFontSizeMultiplier={1.25} style={[styles.topBarTitle, { marginTop: insets.top }]} numberOfLines={1}>
          {store.name}
        </Text>
      </Animated.View>
      <View style={[styles.topButtons, { top: insets.top + spacing.sm }]}>
        <PressableScale
          onPress={() => navigation.goBack()}
          style={styles.roundBtn}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </PressableScale>
        <CartBubble
          ref={cartRef}
          landSignal={landSignal}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Cart' })}
        />
      </View>
    </View>
  );
}

function ProductCard({
  product,
  index,
  isAdding,
  onOpen,
  onAdd,
}: {
  product: ApiProduct;
  index: number;
  isAdding?: boolean;
  onOpen: () => void;
  onAdd: (imageRef: { current: View | null }) => void;
}) {
  const imageRef = useRef<View>(null);
  return (
    <FadeInUp index={index} style={styles.cardCell}>
      <PressableScale onPress={onOpen} scaleTo={0.97} style={styles.card} accessibilityRole="button" accessibilityLabel={product.name}>
        <View ref={imageRef} collapsable={false} style={styles.cardImgWrap}>
          <ProductImage uri={getProductImageUrl(product)} style={styles.cardImg} label={product.name} />
        </View>
        <Text numberOfLines={2} style={styles.pName}>
          {product.name}
        </Text>
        <Text style={styles.pCat} numberOfLines={1}>
          {getProductCategoryName(product)}
        </Text>
        <View style={styles.priceRow}>
          <Text maxFontSizeMultiplier={1.25} style={styles.pPrice}>₦{Number(product.price || 0).toLocaleString()}</Text>
          <PressableScale
            scaleTo={0.82}
            hapticFeedback
            style={styles.addBtn}
            onPress={() => onAdd(imageRef)}
            disabled={isAdding}
            accessibilityRole="button"
            accessibilityLabel={`Add ${product.name} to cart`}
          >
            {isAdding ? (
              <GrabitLoader size={20} variant="reverse" />
            ) : (
              <Ionicons name="add" size={24} color={colors.surface} />
            )}
          </PressableScale>
        </View>
      </PressableScale>
    </FadeInUp>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  hero: { height: HERO_H, justifyContent: 'flex-end', backgroundColor: brand.forest, overflow: 'hidden' },
  heroScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10,46,31,0.5)' },
  heroText: { paddingHorizontal: spacing.xl },
  heroTitle: {
    fontFamily: fonts.display,
    fontSize: 30,
    lineHeight: 33,
    letterSpacing: -0.8,
    color: brand.oat,
    marginBottom: spacing.md,
  },
  heroChips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  heroChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,246,230,0.18)',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
  },
  heroChipTxt: { fontFamily: fonts.bold, fontSize: 13, color: brand.oat },
  body: {
    marginTop: -spacing.xxl,
    backgroundColor: colors.background,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    minHeight: 52,
    ...shadows.soft,
  },
  searchIn: { flex: 1, paddingVertical: spacing.md, color: colors.text, fontFamily: fonts.regular, fontSize: 15 },
  chipsScroll: { marginHorizontal: -spacing.xl, marginTop: spacing.lg },
  chips: { gap: spacing.sm, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipOn: { backgroundColor: brand.forest, borderColor: brand.forest },
  chipTxt: { fontFamily: fonts.semibold, fontSize: 14, color: colors.text },
  chipTxtOn: { color: brand.oat },
  secHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  secTitle: { fontFamily: fonts.display, fontSize: 20, letterSpacing: -0.4, color: colors.text },
  secSub: { fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  cardCell: { width: '48%', marginBottom: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.sm, ...shadows.soft },
  cardImgWrap: { borderRadius: radii.md, overflow: 'hidden', marginBottom: spacing.sm },
  cardImg: { width: '100%', height: 124, borderRadius: radii.md },
  pName: { fontFamily: fonts.bold, fontSize: 14, color: colors.text, minHeight: 38, paddingHorizontal: 4 },
  pCat: { fontFamily: fonts.regular, fontSize: 12, color: colors.textSecondary, marginTop: 2, paddingHorizontal: 4 },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingLeft: 4,
  },
  pPrice: { fontFamily: fonts.display, fontSize: 17, letterSpacing: -0.2, color: colors.text },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: brand.forest,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 72,
  },
  topBarTitle: { fontFamily: fonts.display, fontSize: 17, color: brand.oat },
  topButtons: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
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
});
