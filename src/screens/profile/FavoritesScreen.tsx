import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/navigationRef';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProductImage } from '../../components/ProductImage';

import { getCategoryLabel, getProductById } from '../../data/products';
import { navigateRoot } from '../../navigation/navigationRef';
import { colors, radii, shadows, spacing, typography } from '../../theme';

export function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const favoriteIds = new Set<string>();
  const toggleFavorite = (id: string) => {};
  const addToCart = async (storeId: string, product: any, qty: number) => {};
  const products = [...favoriteIds]
    .map((id) => getProductById(id))
    .filter(Boolean);

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        padding: spacing.xl,
        paddingBottom: insets.bottom + spacing.xxl,
      }}
    >
      {products.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="heart-outline" size={64} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No favorites yet</Text>
          <Text style={styles.emptySub}>
            Save items you love by tapping the heart on any product. They will
            appear here for quick add-to-cart.
          </Text>
          <Pressable
            style={styles.emptyBtn}
            onPress={() =>
              navigation.navigate('MainTabs', { screen: 'Home' })
            }
          >
            <Text style={styles.emptyBtnTxt}>Explore products</Text>
          </Pressable>
        </View>
      ) : null}
      {products.map((p) =>
        p ? (
          <View key={p.id} style={styles.card}>
            <Pressable
              style={styles.row}
              onPress={() =>
                navigateRoot('ProductDetail', {
                  storeId: p.storeId,
                  productId: p.id,
                })
              }
            >
              <ProductImage uri={p.image} style={styles.img} label={p.name} />
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{p.name}</Text>
                <Text style={styles.cat}>{getCategoryLabel(p.categoryId)}</Text>
                <Text style={styles.price}>₦{Number(p.price || 0).toLocaleString()}</Text>
              </View>
            </Pressable>
            <View style={styles.actions}>
              <Pressable onPress={() => toggleFavorite(p.id)} hitSlop={12}>
                <Ionicons name="heart" size={22} color={colors.danger} />
              </Pressable>
              <Pressable
                style={styles.add}
                onPress={() => {
                  addToCart(p.storeId, p, 1);
                }}
              >
                <Ionicons name="cart" size={18} color={colors.surface} />
                <Text style={styles.addTxt}>Add</Text>
              </Pressable>
            </View>
          </View>
        ) : null,
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.md,
  },
  emptyTitle: {
    ...typography.sectionTitle,
    marginTop: spacing.lg,
    color: colors.text,
    textAlign: 'center',
  },
  emptySub: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 22,
    maxWidth: 320,
  },
  emptyBtn: {
    marginTop: spacing.xl,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    borderRadius: radii.md,
  },
  emptyBtnTxt: { color: colors.surface, fontWeight: '800' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...shadows.soft,
  },
  row: { flexDirection: 'row', gap: spacing.md, padding: spacing.lg },
  img: { width: 88, height: 88, borderRadius: radii.md },
  name: { fontWeight: '800', color: colors.text },
  cat: { color: colors.textSecondary, fontSize: 12, marginTop: 4 },
  price: { fontWeight: '800', color: colors.primary, marginTop: spacing.sm },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  add: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
  },
  addTxt: { color: colors.surface, fontWeight: '800' },
});
