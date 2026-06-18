import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CategoryPillGrid } from '../components/home/CategoryPillGrid';
import { HomeHeader } from '../components/home/HomeHeader';
import { HomeSearchBar } from '../components/home/HomeSearchBar';
import { PromoBannerCarousel } from '../components/home/PromoBannerCarousel';
import { SectionHeader } from '../components/home/SectionHeader';
import { SupermarketListCard } from '../components/home/SupermarketListCard';
import { useAddresses } from '../context/AddressContext';
import { categoryService } from '../services/categoryService';
import { supermarketService } from '../services/supermarketService';
import { navigateRoot } from '../navigation/navigationRef';
import { colors, radii, spacing } from '../theme';
import {
  formatAddressLabel,
  formatAddressLine,
  formatAddressShortLine,
} from '../utils/addressFormat';
import { toCategoryGridItems, type ApiCategory } from '../utils/catalogFormat';
import { parseApiError } from '../utils/parseApiError';

const TAB_BAR_EXTRA = 64;

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const {
    addresses,
    selectedAddressId,
    setSelectedAddressId,
    refreshAddresses,
    selectAddressAsDefault,
    loading: addressesLoading,
  } = useAddresses();

  const [addrOpen, setAddrOpen] = useState(false);
  const [homeCategory, setHomeCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [supermarkets, setSupermarkets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      void refreshAddresses();
    }, [refreshAddresses]),
  );

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [storeData, categoryList] = await Promise.all([
          supermarketService.getSupermarkets(),
          categoryService.getCategories(),
        ]);
        setSupermarkets(storeData.supermarkets || storeData || []);
        setCategories(categoryList);
      } catch (error: unknown) {
        const msg = parseApiError(error, {
          fallback: 'Failed to load supermarkets. Please try again.',
        });
        Alert.alert('Unable to Load Stores', msg);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
  const deliveryLine = selectedAddress
    ? formatAddressShortLine(selectedAddress)
    : addressesLoading
      ? 'Loading address…'
      : 'Add a delivery address';

  const openStore = (storeId?: string, categoryId?: string) => {
    if (storeId) {
      navigateRoot('Store', { storeId, categoryId });
    }
  };

  const handleSelectAddress = async (id: string) => {
    setSelectedAddressId(id);
    setAddrOpen(false);
    try {
      await selectAddressAsDefault(id);
      const address = addresses.find((a) => a.id === id);
      if (address) {
        Alert.alert('Updated', `Delivering to ${formatAddressLabel(address)}`);
      }
    } catch (error: unknown) {
      Alert.alert(
        'Unable to Update Address',
        parseApiError(error, {
          fallback: 'Could not set your default delivery address.',
        }),
      );
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: Math.max(insets.top, spacing.lg),
            paddingBottom: insets.bottom + TAB_BAR_EXTRA + spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <HomeHeader
          greeting="Good morning!"
          deliveryLine={deliveryLine}
          onPressDelivery={() => setAddrOpen(true)}
          onPressNotifications={() => navigateRoot('Notifications')}
        />
        <HomeSearchBar
          onSubmit={() =>
            Alert.alert(
              'Search',
              'Try opening a supermarket to search products there.',
            )
          }
          onPressFilter={() => Alert.alert('Filters', 'Filter panel.')}
        />
        <PromoBannerCarousel />
        <SectionHeader
          title="Categories"
          actionLabel="View all"
          onPressAction={() =>
            openStore(supermarkets.length > 0 ? supermarkets[0].id : undefined)
          }
        />
        <CategoryPillGrid
          categories={toCategoryGridItems(categories)}
          selectedId={homeCategory}
          onSelect={(id) => {
            setHomeCategory(id);
            openStore(supermarkets.length > 0 ? supermarkets[0].id : undefined, id);
          }}
        />
        <View style={styles.sectionSpacer} />
        <SectionHeader title="Supermarkets Near You" />

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xl }} />
        ) : (
          supermarkets.map((store) => (
            <SupermarketListCard
              key={store.id}
              store={store}
              onPress={() => openStore(store.id)}
            />
          ))
        )}
      </ScrollView>

      <Modal visible={addrOpen} transparent animationType="fade">
        <View style={styles.modalWrap}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setAddrOpen(false)}
          />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Delivery address</Text>
            {addressesLoading ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: spacing.lg }} />
            ) : addresses.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>No saved addresses yet.</Text>
                <Pressable
                  style={styles.addBtn}
                  onPress={() => {
                    setAddrOpen(false);
                    navigateRoot('SavedAddresses');
                  }}
                >
                  <Text style={styles.addBtnTxt}>Add an address</Text>
                </Pressable>
              </View>
            ) : (
              addresses.map((a) => (
                <Pressable
                  key={a.id}
                  style={[
                    styles.modalRow,
                    selectedAddressId === a.id && styles.modalRowOn,
                  ]}
                  onPress={() => void handleSelectAddress(a.id)}
                >
                  <Text style={styles.modalLab}>{formatAddressLabel(a)}</Text>
                  <Text style={styles.modalLine}>{formatAddressLine(a)}</Text>
                </Pressable>
              ))
            )}
            <Pressable onPress={() => setAddrOpen(false)}>
              <Text style={styles.modalClose}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingHorizontal: spacing.xl,
  },
  sectionSpacer: {
    height: spacing.xxl,
  },
  modalWrap: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
    zIndex: 1,
  },
  modalTitle: {
    fontWeight: '800',
    fontSize: 18,
    marginBottom: spacing.lg,
    color: colors.text,
  },
  modalRow: {
    padding: spacing.lg,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  modalRowOn: {
    borderColor: colors.primary,
    backgroundColor: colors.mint,
  },
  modalLab: { fontWeight: '800', color: colors.text },
  modalLine: { color: colors.textSecondary, marginTop: 4, fontSize: 13 },
  modalClose: {
    textAlign: 'center',
    marginTop: spacing.lg,
    color: colors.primary,
    fontWeight: '700',
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  addBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
  },
  addBtnTxt: {
    color: colors.surface,
    fontWeight: '700',
  },
});
