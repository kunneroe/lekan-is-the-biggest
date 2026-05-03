import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import {
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
import { useDemo } from '../context/DemoContext';
import {
  getCategoryLabel,
  getProductsForStore,
  type Product,
} from '../data/products';
import { CATEGORY_ITEMS } from '../data/supermarkets';
import type { RootStackParamList } from '../navigation/navigationRef';
import { colors, radii, shadows, spacing, typography } from '../theme';

type R = RouteProp<RootStackParamList, 'Store'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export function StoreScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute<R>();
  const navigation = useNavigation<Nav>();
  const { storeId, categoryId: routeCategory } = route.params;
  const { getSupermarket, addToCart } = useDemo();
  const store = getSupermarket(storeId);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(
    routeCategory ?? null,
  );

  useEffect(() => {
    setCategoryId(routeCategory ?? null);
  }, [storeId, routeCategory]);

  const allProducts = useMemo(() => getProductsForStore(storeId), [storeId]);

  const filtered = useMemo(() => {
    let list = allProducts;
    if (categoryId) {
      list = list.filter((p) => p.categoryId === categoryId);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          getCategoryLabel(p.categoryId).toLowerCase().includes(q),
      );
    }
    return list;
  }, [allProducts, categoryId, search]);

  if (!store) {
    return (
      <View style={styles.miss}>
        <Text>Store not found.</Text>
      </View>
    );
  }

  const eta = `${store.etaMin}–${store.etaMax} mins`;

  return (
    <View style={styles.screen}>
      <View style={[styles.head, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.brand}>Goshop</Text>
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
          }}
          style={styles.avatar}
        />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        <ImageBackground
          source={{ uri: store.image }}
          style={styles.hero}
          imageStyle={styles.heroImg}
        >
          <View style={styles.heroGrad} />
          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>{store.name}</Text>
            <Text style={styles.heroMeta}>
              ★ {store.rating} · {eta} · ₦{store.deliveryFee} delivery
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
              <Text style={[styles.chipTxt, !categoryId && styles.chipTxtOn]}>
                All
              </Text>
            </Pressable>
            {CATEGORY_ITEMS.map((c) => (
              <Pressable
                key={c.id}
                style={[styles.chip, categoryId === c.id && styles.chipOn]}
                onPress={() =>
                  setCategoryId(categoryId === c.id ? null : c.id)
                }
              >
                <Text
                  style={[
                    styles.chipTxt,
                    categoryId === c.id && styles.chipTxtOn,
                  ]}
                >
                  {c.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
          <View style={styles.secHead}>
            <Text style={styles.secTitle}>Products</Text>
            <Text style={styles.secSub}>{filtered.length} items</Text>
          </View>
          <View style={styles.grid}>
            {filtered.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onOpen={() =>
                  navigation.navigate('ProductDetail', {
                    storeId,
                    productId: p.id,
                  })
                }
                onAdd={() => {
                  addToCart(storeId, p, 1);
                }}
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
  onOpen,
  onAdd,
}: {
  product: Product;
  onOpen: () => void;
  onAdd: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardImgWrap}>
        <Pressable onPress={onOpen}>
          <ProductImage
            uri={product.image}
            style={styles.cardImg}
            label={product.name}
          />
        </Pressable>
        <Pressable style={styles.addBtn} onPress={onAdd}>
          <Ionicons name="add" size={22} color={colors.surface} />
        </Pressable>
      </View>
      <Pressable onPress={onOpen}>
        <Text numberOfLines={2} style={styles.pName}>
          {product.name}
        </Text>
        <Text style={styles.pCat}>{getCategoryLabel(product.categoryId)}</Text>
        <Text style={styles.pPrice}>₦{product.price.toLocaleString()}</Text>
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
