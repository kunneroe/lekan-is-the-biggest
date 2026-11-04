import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/navigationRef';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProductImage } from '../../components/ProductImage';

import { useFavorites } from '../../context/FavoriteContext';
import { cartService } from '../../services/cartService';
import { navigateRoot } from '../../navigation/navigationRef';
import { GrabitLoader } from '../../components/brand/GrabitLoader';
import { colors, radii, shadows, spacing, typography, fonts } from '../../theme';
import { getProductImageUrl } from '../../utils/catalogFormat';
import { parseApiError } from '../../utils/parseApiError';

export function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { favorites, loading, toggleFavorite } = useFavorites();

  if (loading) {
    return (
      <View style={styles.centered}>
        <GrabitLoader size={44} />
      </View>
    );
  }

  const handleAddToCart = async (productId: string) => {
    try {
      await cartService.addItem(productId, 1);
      Alert.alert('Added to cart', 'Item added successfully!');
    } catch (error: unknown) {
      Alert.alert(
        'Unable to Add to Cart',
        parseApiError(error, {
          fallback:
            'Failed to add item to cart. Make sure you only add items from one supermarket.',
        }),
      );
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        padding: spacing.xl,
        paddingBottom: insets.bottom + spacing.xxl,
      }}
    >
      {favorites.length === 0 ? (
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

      {favorites.map((fav) => {
        const p = fav.product;
        const storeId = p.supermarket?.id ?? p.supermarketId;
        const imageUri = getProductImageUrl(p);

        return (
          <View key={fav.id} style={styles.card}>
            <Pressable
              style={styles.row}
              onPress={() =>
                navigateRoot('ProductDetail', {
                  storeId: storeId ?? '',
                  productId: p.id,
                })
              }
            >
              <ProductImage uri={imageUri} style={styles.img} label={p.name} />
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{p.name}</Text>
                {p.supermarket?.name ? (
                  <Text style={styles.store}>{p.supermarket.name}</Text>
                ) : null}
                <Text style={styles.price}>
                  ₦{Number(p.price || 0).toLocaleString()}
                </Text>
              </View>
            </Pressable>
            <View style={styles.actions}>
              <Pressable
                onPress={() => void toggleFavorite(p.id)}
                hitSlop={12}
              >
                <Ionicons name="heart" size={22} color={colors.danger} />
              </Pressable>
              <Pressable
                style={styles.add}
                onPress={() => void handleAddToCart(p.id)}
              >
                <Ionicons name="cart" size={18} color={colors.surface} />
                <Text style={styles.addTxt}>Add</Text>
              </Pressable>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  emptyBtnTxt: { color: colors.surface, fontFamily: fonts.black },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...shadows.soft,
  },
  row: { flexDirection: 'row', gap: spacing.md, padding: spacing.lg },
  img: { width: 88, height: 88, borderRadius: radii.md },
  name: { fontFamily: fonts.black, color: colors.text },
  store: { color: colors.textSecondary, fontSize: 12, marginTop: 4 },
  price: { fontFamily: fonts.black, color: colors.primary, marginTop: spacing.sm },
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
  addTxt: { color: colors.surface, fontFamily: fonts.black },
});
