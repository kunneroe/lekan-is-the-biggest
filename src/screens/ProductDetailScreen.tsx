import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProductImage } from '../components/ProductImage';
import { useEffect } from 'react';
import { supermarketService } from '../services/supermarketService';
import { productService } from '../services/productService';
import { cartService } from '../services/cartService';
import type { RootStackParamList } from '../navigation/navigationRef';
import { colors, radii, shadows, spacing, typography } from '../theme';

type R = RouteProp<RootStackParamList, 'ProductDetail'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export function ProductDetailScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute<R>();
  const navigation = useNavigation<Nav>();
  const { storeId, productId } = route.params;
  const favoriteIds = new Set();
  const toggleFavorite = () => Alert.alert('Favorites', 'Mock favorites list.');
  const [qty, setQty] = useState(1);
  const [store, setStore] = useState<any>(null);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    Promise.all([
      supermarketService.getSupermarketById(storeId).catch(() => null),
      productService.getProductById(productId).catch(() => null)
    ]).then(([sRes, pRes]) => {
      if (sRes) setStore(sRes.supermarket || sRes);
      if (pRes) setProduct(pRes.product || pRes);
      setLoading(false);
    });
  }, [storeId, productId]);

  if (loading) {
    return (
      <View style={styles.miss}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!store || !product) {
    return (
      <View style={styles.miss}>
        <Text>Product not found.</Text>
      </View>
    );
  }

  const lineTotal = Number(product.price || 0) * qty;
  const related: any[] = []; // related is removed for now or handled by api

  return (
    <View style={styles.screen}>
      <View style={[styles.top, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable style={styles.iconCircle} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <View style={styles.topRight}>
          <Pressable
            style={styles.iconCircle}
            onPress={() => Alert.alert('Share', 'Share sheet (mock).')}
          >
            <Ionicons name="share-outline" size={20} color={colors.text} />
          </Pressable>
          <Pressable
            style={styles.iconCircle}
            onPress={() => toggleFavorite(product.id)}
          >
            <Ionicons
              name={favoriteIds.has(product.id) ? 'heart' : 'heart-outline'}
              size={20}
              color={
                favoriteIds.has(product.id) ? colors.danger : colors.text
              }
            />
          </Pressable>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + 120,
          paddingHorizontal: spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imgCard}>
          <ProductImage
            uri={product.image}
            style={styles.heroImg}
            label={product.name}
          />
        </View>
        <Text style={styles.storeLine}>
          ● {store.name}
        </Text>
        <Text style={styles.title}>{product.name}</Text>
        <Text style={styles.price}>₦{Number(product.price || 0).toLocaleString()}</Text>
        <View style={styles.stepRow}>
          <View>
            <Text style={styles.stepLab}>Total quantity</Text>
            <Text style={styles.stepVal}>
              {qty} × {product.unit}
            </Text>
          </View>
          <View style={styles.stepper}>
            <Pressable
              style={styles.stepBtn}
              onPress={() => setQty((q) => Math.max(1, q - 1))}
            >
              <Text style={styles.stepBtnTxt}>−</Text>
            </Pressable>
            <Text style={styles.stepNum}>{qty}</Text>
            <Pressable
              style={[styles.stepBtn, styles.stepBtnPlus]}
              onPress={() => setQty((q) => q + 1)}
            >
              <Text style={[styles.stepBtnTxt, { color: colors.surface }]}>+</Text>
            </Pressable>
          </View>
        </View>
        <Text style={styles.sec}>Description</Text>
        <Text style={styles.desc}>{product.description}</Text>
        <Text style={styles.sec}>More from this store</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {related.map((p) => (
            <Pressable
              key={p.id}
              style={styles.rel}
              onPress={() =>
                navigation.replace('ProductDetail', {
                  storeId,
                  productId: p.id,
                })
              }
            >
              <ProductImage
                uri={p.image}
                style={styles.relImg}
                label={p.name}
              />
              <Text numberOfLines={1} style={styles.relName}>
                {p.name}
              </Text>
              <Text style={styles.relPrice}>₦{Number(p.price || 0).toLocaleString()}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </ScrollView>
      <View style={[styles.bar, { paddingBottom: insets.bottom + spacing.md }]}>
        <View>
          <Text style={styles.barLab}>Total</Text>
          <Text style={styles.barTot}>₦{lineTotal.toLocaleString()}</Text>
        </View>
        <Pressable
          style={[styles.barBtn, adding && { opacity: 0.8 }]}
          disabled={adding}
          onPress={async () => {
            if (adding) return;
            setAdding(true);
            try {
              await cartService.addItem(productId, qty);
              Alert.alert('Success', 'Added to cart!', [
                { text: 'Continue shopping', style: 'cancel', onPress: () => navigation.goBack() },
                { text: 'View cart', onPress: () => navigation.navigate('Cart' as never) }
              ]);
            } catch (error: any) {
              let msg = 'Failed to add item to cart. Make sure you only add items from one supermarket.';
              if (error.response?.data) {
                if (typeof error.response.data.message === 'string') {
                  msg = error.response.data.message;
                } else if (Array.isArray(error.response.data.errors) && error.response.data.errors.length > 0) {
                  msg = error.response.data.errors[0].msg || error.response.data.errors[0].message || msg;
                } else if (typeof error.response.data === 'string' && error.response.data.length < 100) {
                  msg = error.response.data;
                }
              }
              Alert.alert('Error', msg);
            } finally {
              setAdding(false);
            }
          }}
        >
          {adding ? (
            <ActivityIndicator size="small" color={colors.surface} />
          ) : (
            <Ionicons name="bag-handle-outline" size={20} color={colors.surface} />
          )}
          <Text style={styles.barBtnTxt}>
            Add to cart – ₦{lineTotal.toLocaleString()}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  miss: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  topRight: { flexDirection: 'row', gap: spacing.sm },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  imgCard: {
    backgroundColor: colors.surface,
    borderRadius: 28,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  heroImg: {
    width: '100%',
    height: 220,
    borderRadius: radii.xl,
  },
  storeLine: {
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    fontSize: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  price: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: spacing.lg,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.mint,
    padding: spacing.lg,
    borderRadius: radii.lg,
    marginBottom: spacing.xl,
  },
  stepLab: { color: colors.textSecondary, fontSize: 12 },
  stepVal: { fontWeight: '700', color: colors.text, marginTop: 4 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnPlus: { backgroundColor: colors.primary },
  stepBtnTxt: { fontSize: 20, fontWeight: '700', color: colors.text },
  stepNum: { fontWeight: '800', fontSize: 16 },
  sec: {
    fontWeight: '700',
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  desc: {
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  rel: {
    width: 120,
    marginRight: spacing.md,
  },
  relImg: {
    width: 120,
    height: 100,
    borderRadius: radii.md,
    marginBottom: spacing.sm,
  },
  relName: { fontSize: 12, fontWeight: '600', color: colors.text },
  relPrice: { fontWeight: '700', color: colors.primary, marginTop: 4 },
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadows.soft,
  },
  barLab: { fontSize: 11, color: colors.textSecondary },
  barTot: { fontSize: 18, fontWeight: '800', color: colors.text },
  barBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
    maxWidth: '62%',
  },
  barBtnTxt: {
    color: colors.surface,
    fontWeight: '700',
    flexShrink: 1,
  },
});
