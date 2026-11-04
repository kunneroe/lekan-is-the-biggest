import { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { EmptyState } from '../components/common/EmptyState';
import { SupermarketListCard } from '../components/home/SupermarketListCard';
import { FadeInUp } from '../components/motion/FadeInUp';
import { StoreCardSkeleton } from '../components/motion/Skeleton';
import type { RootStackParamList } from '../navigation/navigationRef';
import { supermarketService } from '../services/supermarketService';
import { colors, spacing } from '../theme';
import { parseApiError } from '../utils/parseApiError';
import type { ApiSupermarket } from '../utils/catalogFormat';

export function AllSupermarketsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [supermarkets, setSupermarkets] = useState<ApiSupermarket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSupermarkets = async () => {
      try {
        const data = await supermarketService.getSupermarkets();
        setSupermarkets(data.supermarkets || data || []);
      } catch (error: unknown) {
        const msg = parseApiError(error, {
          fallback: 'Failed to load supermarkets. Please try again.',
        });
        Alert.alert('Unable to Load Stores', msg);
      } finally {
        setLoading(false);
      }
    };
    fetchSupermarkets();
  }, []);

  if (loading) {
    return (
      <FlatList
        data={[0, 1, 2]}
        keyExtractor={(i) => String(i)}
        renderItem={({ item }) => <StoreCardSkeleton index={item} />}
        contentContainerStyle={styles.list}
        style={styles.screen}
      />
    );
  }

  return (
    <FlatList
      style={styles.screen}
      data={supermarkets}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => (
        <FadeInUp index={index}>
          <SupermarketListCard store={item} onPress={() => navigation.navigate('Store', { storeId: item.id })} />
        </FadeInUp>
      )}
      ListEmptyComponent={
        <EmptyState art="mark" title="No supermarkets yet" body="Stores near you will show up here." />
      }
      contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + spacing.xl }]}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  list: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm },
});
