import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SupermarketListCard } from '../components/home/SupermarketListCard';
import type { RootStackParamList } from '../navigation/navigationRef';
import { supermarketService } from '../services/supermarketService';
import { colors, spacing } from '../theme';
import { parseApiError } from '../utils/parseApiError';
import type { ApiSupermarket } from '../utils/catalogFormat';

export function AllSupermarketsScreen() {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

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
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (supermarkets.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No supermarkets available.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={supermarkets}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <SupermarketListCard
          store={item}
          onPress={() => navigation.navigate('Store', { storeId: item.id })}
        />
      )}
      contentContainerStyle={[
        styles.list,
        { paddingBottom: insets.bottom + spacing.xl },
      ]}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  list: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    backgroundColor: colors.background,
  },
});
