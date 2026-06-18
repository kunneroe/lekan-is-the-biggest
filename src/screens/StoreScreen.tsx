import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProductImage } from '../components/ProductImage';
import type { RootStackParamList } from '../navigation/navigationRef';
import { categoryService } from '../services/categoryService';
import { supermarketService } from '../services/supermarketService';
import { productService } from '../services/productService';
import { cartService } from '../services/cartService';
import { colors, radii, shadows, spacing } from '../theme';
import {
  getProductCategoryName,
  getProductImageUrl,
  getSupermarketEta,
  getSupermarketImageUrl,
  toCategoryGridItems,
  type ApiCategory,
  type ApiProduct,
} from '../utils/catalogFormat';
import { parseApiError } from '../utils/parseApiError';

type R = RouteProp<RootStackParamList, 'Store'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export function StoreScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute<R>();
  const navigation = useNavigation<Nav>();
  const { storeId, categoryId: routeCategory } = route.params;
  
  const [store, setStore] = useState<any>(null);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [allProducts, setAllProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(routeCategory ?? null);
  const [heroErr, setHeroErr] = useState(false);
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
      (p) =>
        p.name.toLowerCase().includes(q) ||
        getProductCategoryName(p).toLowerCase().includes(q),
    );
  }, [allProducts, search]);

  const handleAddToCart = async (productId: string) => {
    if (addingId) return;
    setAddingId(productId);
    try {
      await cartService.addItem(productId, 1);
      Alert.alert('Success', 'Item added to cart.');
    } catch (error: unknown) {
      Alert.alert(
        'Cart Error',
        parseApiError(error, {
          fallback:
            'Failed to add item to cart. Make sure you only add items from one supermarket.',
        }),
      );
    } finally {
      setAddingId(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.miss}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: spacing.md }}>Loading store...</Text>
      </View>
    );
  }

  if (!store) {
    return (
      <View style={styles.miss}>
        <Text>Store not found.</Text>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={{ color: colors.primary, marginTop: spacing.md, fontWeight: '700' }}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const { min, max } = getSupermarketEta(store);
  const eta = `${min}–${max} mins`;
  const deliveryFee = store.deliveryFee !== undefined ? store.deliveryFee : 500;
  const heroImage = getSupermarketImageUrl(store);
  const categoryChips = toCategoryGridItems(categories);

  return (
    <View style={styles.screen}>
      <View style={[styles.head, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.brand}>Goshop</Text>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80' }}
          style={styles.avatar}
        />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        <ImageBackground
          source={{ uri: heroErr || !heroImage ? 'https://placehold.co/400x200/png?text=No+Image' : heroImage }}
          style={styles.hero}
          imageStyle={styles.heroImg}
          onError={() => setHeroErr(true)}
        >
          <View style={styles.heroGrad} />
          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>{store.name}</Text>
            <Text style={styles.heroMeta}>
              ★ {store.rating || '4.5'} · {eta} · ₦{deliveryFee} delivery
            </Text>
          </View>
        </ImageBackground>
        <View style={styles.body}>
          <View style={styles.searchWrap}>
            <Ionicons name="search-outline" size={20} color={colors.textMuted} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search in store"
              placeholderTextColor={colors.textMuted}
              style={styles.searchIn}
            />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
          >
            <Pressable
              style={[styles.chip, !categoryId && styles.chipOn]}
              onPress={() => setCategoryId(null)}
            >
              <Text style={[styles.chipTxt, !categoryId && styles.chipTxtOn]}>All</Text>
            </Pressable>
            {categoryChips.map((c) => (
              <Pressable
                key={c.id}
                style={[styles.chip, categoryId === c.id && styles.chipOn]}
                onPress={() => setCategoryId(categoryId === c.id ? null : c.id)}
              >
                <Text style={[styles.chipTxt, categoryId === c.id && styles.chipTxtOn]}>
                  {c.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
          <View style={styles.secHead}>
            <Text style={styles.secTitle}>Products</Text>
            <Text style={styles.secSub}>
              {productsLoading ? 'Loading…' : `${filtered.length} items`}
            </Text>
          </View>
          <View style={styles.grid}>
            {filtered.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                isAdding={addingId === p.id}
                onOpen={() => navigation.navigate('ProductDetail', { storeId, productId: p.id })}
                onAdd={() => handleAddToCart(p.id)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function ProductCard({
  product,
  isAdding,
  onOpen,
  onAdd,
}: {
  product: ApiProduct;
  isAdding?: boolean;
  onOpen: () => void;
  onAdd: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardImgWrap}>
        <Pressable onPress={onOpen}>
          <ProductImage
            uri={getProductImageUrl(product)}
            style={styles.cardImg}
            label={product.name}
          />
        </Pressable>
        <Pressable style={styles.addBtn} onPress={onAdd} disabled={isAdding}>
          {isAdding ? (
            <ActivityIndicator size="small" color={colors.surface} />
          ) : (
            <Ionicons name="add" size={22} color={colors.surface} />
          )}
        </Pressable>
      </View>
      <Pressable onPress={onOpen}>
        <Text numberOfLines={2} style={styles.pName}>
          {product.name}
        </Text>
        <Text style={styles.pCat}>{getProductCategoryName(product)}</Text>
        <Text style={styles.pPrice}>₦{Number(product.price || 0).toLocaleString()}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  miss: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  brand: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.border,
  },
  hero: {
    height: 200,
    justifyContent: 'flex-end',
  },
  heroImg: {
    borderBottomLeftRadius: radii.lg,
    borderBottomRightRadius: radii.lg,
  },
  heroGrad: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderBottomLeftRadius: radii.lg,
    borderBottomRightRadius: radii.lg,
  },
  heroText: {
    padding: spacing.xl,
  },
  heroTitle: {
    color: colors.surface,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  heroMeta: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 14,
  },
  body: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  searchIn: {
    flex: 1,
    paddingVertical: spacing.md,
    marginLeft: spacing.sm,
    color: colors.text,
  },
  chips: {
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipOn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipTxt: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 13,
  },
  chipTxtOn: {
    color: colors.surface,
  },
  secHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: spacing.md,
  },
  secTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  secSub: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  card: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.soft,
  },
  cardImgWrap: {
    marginBottom: spacing.sm,
    position: 'relative',
  },
  cardImg: {
    width: '100%',
    height: 120,
    borderRadius: radii.md,
  },
  addBtn: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    backgroundColor: colors.bannerOrange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pName: {
    fontWeight: '600',
    color: colors.text,
    fontSize: 13,
    minHeight: 36,
  },
  pCat: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  pPrice: {
    marginTop: spacing.sm,
    fontWeight: '800',
    color: colors.primary,
    fontSize: 15,
  },
});
