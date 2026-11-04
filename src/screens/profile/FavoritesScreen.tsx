import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GrabitLoader, LoaderView } from '../../components/brand/GrabitLoader';
import { EmptyState } from '../../components/common/EmptyState';
import { FadeInUp } from '../../components/motion/FadeInUp';
import { PressableScale } from '../../components/motion/PressableScale';
import { ProductImage } from '../../components/ProductImage';
import { appAlert } from '../../context/DialogContext';
import { useFavorites } from '../../context/FavoriteContext';
import { showToast } from '../../context/ToastContext';
import { navigateRoot, type RootStackParamList } from '../../navigation/navigationRef';
import { cartService } from '../../services/cartService';
import { brand, colors, fonts, radii, shadows, spacing } from '../../theme';
import { getProductImageUrl } from '../../utils/catalogFormat';
import { haptic } from '../../utils/haptics';
import { parseApiError } from '../../utils/parseApiError';
import { useLayout } from '../../utils/responsive';

export function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { favorites, loading, toggleFavorite } = useFavorites();
  const { gutter } = useLayout();
  const [addingId, setAddingId] = useState<string | null>(null);

  if (loading) {
    return <LoaderView />;
  }

  const handleAddToCart = async (productId: string, name: string) => {
    if (addingId) return;
    setAddingId(productId);
    try {
      await cartService.addItem(productId, 1);
      haptic.success();
      showToast(`${name} added`, {
        action: { label: 'View cart', onPress: () => navigation.navigate('MainTabs', { screen: 'Cart' }) },
      });
    } catch (error: unknown) {
      appAlert(
        'Unable to Add to Cart',
        parseApiError(error, {
          fallback: 'Failed to add item to cart. Make sure you only add items from one supermarket.',
        }),
      );
    } finally {
      setAddingId(null);
    }
  };

  if (favorites.length === 0) {
    return (
      <View style={[styles.screen, { justifyContent: 'center' }]}>
        <EmptyState
          art="bag"
          title="No favorites yet"
          body="Tap the heart on any product and it will wait for you here, ready to grab again."
          actionLabel="Explore products"
          onAction={() => navigation.navigate('MainTabs', { screen: 'Home' })}
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ padding: gutter, paddingBottom: insets.bottom + spacing.xxl }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.count}>
        {favorites.length} saved {favorites.length === 1 ? 'item' : 'items'}
      </Text>
      <View style={styles.grid}>
        {favorites.map((fav, i) => {
          const p = fav.product;
          const storeId = p.supermarket?.id ?? p.supermarketId;
          return (
            <FadeInUp key={fav.id} index={i} style={styles.cell}>
              <PressableScale
                scaleTo={0.97}
                style={styles.card}
                onPress={() => navigateRoot('ProductDetail', { storeId: storeId ?? '', productId: p.id })}
                accessibilityRole="button"
                accessibilityLabel={p.name}
              >
                <View>
                  <ProductImage uri={getProductImageUrl(p)} style={styles.img} label={p.name} />
                  <HeartButton onPress={() => void toggleFavorite(p.id)} />
                </View>
                <Text style={styles.name} numberOfLines={2}>
                  {p.name}
                </Text>
                {p.supermarket?.name ? (
                  <Text style={styles.store} numberOfLines={1}>
                    {p.supermarket.name}
                  </Text>
                ) : null}
                <View style={styles.priceRow}>
                  <Text style={styles.price}>₦{Number(p.price || 0).toLocaleString()}</Text>
                  <PressableScale
                    scaleTo={0.85}
                    hapticFeedback
                    style={styles.add}
                    onPress={() => void handleAddToCart(p.id, p.name)}
                    accessibilityRole="button"
                    accessibilityLabel={`Add ${p.name} to cart`}
                  >
                    {addingId === p.id ? (
                      <GrabitLoader size={20} variant="reverse" />
                    ) : (
                      <Ionicons name="add" size={22} color="#FFFFFF" />
                    )}
                  </PressableScale>
                </View>
              </PressableScale>
            </FadeInUp>
          );
        })}
      </View>
    </ScrollView>
  );
}

/** Filled heart; tapping it pops and removes the item from favorites. */
function HeartButton({ onPress }: { onPress: () => void }) {
  const s = useRef(new Animated.Value(1)).current;
  return (
    <Pressable
      onPress={() => {
        haptic.tap();
        s.setValue(0.6);
        Animated.spring(s, { toValue: 1, friction: 3, tension: 200, useNativeDriver: true }).start();
        onPress();
      }}
      hitSlop={8}
      style={styles.heart}
      accessibilityRole="button"
      accessibilityLabel="Remove from favorites"
    >
      <Animated.View style={{ transform: [{ scale: s }] }}>
        <Ionicons name="heart" size={18} color={brand.green} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  count: { fontFamily: fonts.semibold, fontSize: 13, color: colors.textSecondary, marginBottom: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  cell: { width: '48%', marginBottom: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.sm, ...shadows.soft },
  img: { width: '100%', height: 120, borderRadius: radii.md },
  heart: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.overlayWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontFamily: fonts.bold, fontSize: 14, color: colors.text, marginTop: spacing.sm, minHeight: 38, paddingHorizontal: 4 },
  store: { fontFamily: fonts.regular, fontSize: 12, color: colors.textSecondary, paddingHorizontal: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm, paddingLeft: 4 },
  price: { fontFamily: fonts.display, fontSize: 17, color: colors.text },
  add: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
