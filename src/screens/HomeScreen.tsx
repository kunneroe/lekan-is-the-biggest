import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GrabitLoader } from '../components/brand/GrabitLoader';
import { BottomSheet } from '../components/common/BottomSheet';
import { EmptyState } from '../components/common/EmptyState';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { CategoryPillGrid } from '../components/home/CategoryPillGrid';
import { HomeHeader } from '../components/home/HomeHeader';
import { HomeSearchBar } from '../components/home/HomeSearchBar';
import { PromoBannerCarousel } from '../components/home/PromoBannerCarousel';
import { SectionHeader } from '../components/home/SectionHeader';
import { SupermarketListCard } from '../components/home/SupermarketListCard';
import { FilterPanelModal, DEFAULT_FILTERS, type FilterState } from '../components/home/FilterPanelModal';
import { FadeInUp } from '../components/motion/FadeInUp';
import { StoreCardSkeleton } from '../components/motion/Skeleton';
import { useAddresses } from '../context/AddressContext';
import { categoryService } from '../services/categoryService';
import { supermarketService } from '../services/supermarketService';
import { navigateRoot } from '../navigation/navigationRef';
import { brand, colors, fonts, radii, spacing } from '../theme';
import { formatAddressLabel, formatAddressLine, formatAddressShortLine } from '../utils/addressFormat';
import { toCategoryGridItems, type ApiCategory } from '../utils/catalogFormat';
import { haptic } from '../utils/haptics';
import { parseApiError } from '../utils/parseApiError';

const TAB_BAR_EXTRA = 72;

function greetingForNow() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const {
    addresses,
    selectedAddressId,
    setSelectedAddressId,
    refreshAddresses,
    selectAddressAsDefault,
    loading: addressesLoading,
  } = useAddresses();

  const [addrOpen, setAddrOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [homeCategory, setHomeCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [supermarkets, setSupermarkets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void refreshAddresses();
    }, [refreshAddresses]),
  );

  const fetchHomeData = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchHomeData();
  }, [fetchHomeData]);

  const onRefresh = useCallback(async () => {
    haptic.tap();
    setRefreshing(true);
    await Promise.all([fetchHomeData(), refreshAddresses()]);
    setRefreshing(false);
  }, [fetchHomeData, refreshAddresses]);

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
  const deliveryLine = selectedAddress
    ? formatAddressShortLine(selectedAddress)
    : addressesLoading
      ? 'Loading address…'
      : 'Add a delivery address';

  // Unique, non-null area values from the raw list for the area chip picker
  const areas = useMemo<string[]>(() => {
    const seen = new Set<string>();
    supermarkets.forEach((s) => {
      if (s.area) seen.add(s.area as string);
    });
    return Array.from(seen).sort();
  }, [supermarkets]);

  // Derived list — filtered and/or sorted from the raw supermarkets state
  const filteredSupermarkets = useMemo(() => {
    let list: any[] = [...supermarkets];

    if (filters.area) {
      list = list.filter((s) => s.area === filters.area);
    }
    if (filters.openNowOnly) {
      list = list.filter((s) => s.status === 'ACTIVE');
    }
    if (filters.freeDeliveryOnly) {
      list = list.filter((s) => Number(s.deliveryFee || 0) === 0);
    }
    if (filters.sortByRating) {
      list = list.slice().sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    }

    return list;
  }, [supermarkets, filters]);

  // True when any filter differs from its default value
  const isFilterActive =
    filters.sortByRating || filters.area !== null || filters.openNowOnly || filters.freeDeliveryOnly;

  const openStore = (storeId?: string, categoryId?: string) => {
    if (storeId) {
      navigateRoot('Store', { storeId, categoryId });
    }
  };

  const handleSelectAddress = async (id: string) => {
    haptic.select();
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
      {isFocused ? <StatusBar style="light" /> : null}
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + TAB_BAR_EXTRA + spacing.xl }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={brand.lime}
            colors={[brand.basil, brand.tomato]}
            progressBackgroundColor={colors.surface}
            progressViewOffset={insets.top}
          />
        }
      >
        <HomeHeader
          greeting={greetingForNow()}
          deliveryLine={deliveryLine}
          onPressDelivery={() => setAddrOpen(true)}
          onPressNotifications={() => navigateRoot('Notifications')}
        >
          <HomeSearchBar
            onSubmit={() => Alert.alert('Search', 'Try opening a supermarket to search products there.')}
            onPressFilter={() => setFilterOpen(true)}
            filterActive={isFilterActive}
          />
        </HomeHeader>

        <View style={styles.body}>
          <PromoBannerCarousel />

          {categories.length > 0 ? (
            <>
              <SectionHeader title="Shop by category" />
              <CategoryPillGrid
                categories={toCategoryGridItems(categories)}
                selectedId={homeCategory}
                onSelect={(id) => {
                  setHomeCategory(id);
                  openStore(supermarkets.length > 0 ? supermarkets[0].id : undefined, id);
                }}
              />
              <View style={styles.sectionSpacer} />
            </>
          ) : null}

          <SectionHeader
            title="Supermarkets near you"
            actionLabel="View all"
            onPressAction={() => navigateRoot('AllSupermarkets')}
            accessory={refreshing ? <GrabitLoader size={20} /> : null}
          />

          {loading ? (
            [0, 1, 2].map((i) => <StoreCardSkeleton key={i} index={i} />)
          ) : filteredSupermarkets.length === 0 ? (
            <EmptyState
              art="search"
              title="No stores match your filters"
              body="Try adjusting or clearing your filters to see more stores."
              actionLabel="Clear filters"
              onAction={() => setFilters(DEFAULT_FILTERS)}
            />
          ) : (
            filteredSupermarkets.map((store, i) => (
              <FadeInUp key={store.id} index={i}>
                <SupermarketListCard store={store} onPress={() => openStore(store.id)} />
              </FadeInUp>
            ))
          )}
        </View>
      </ScrollView>

      <BottomSheet visible={addrOpen} onClose={() => setAddrOpen(false)} title="Deliver to">
        {addressesLoading ? (
          <View style={styles.sheetLoading}>
            <GrabitLoader size={32} />
          </View>
        ) : addresses.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>No saved addresses yet.</Text>
            <PrimaryButton
              label="Add an address"
              icon="add"
              onPress={() => {
                setAddrOpen(false);
                navigateRoot('SavedAddresses');
              }}
            />
          </View>
        ) : (
          <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
            {addresses.map((a) => {
              const on = selectedAddressId === a.id;
              return (
                <Pressable
                  key={a.id}
                  style={[styles.addrRow, on && styles.addrRowOn]}
                  onPress={() => void handleSelectAddress(a.id)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: on }}
                >
                  <View style={[styles.addrIcon, on && { backgroundColor: brand.basil }]}>
                    <Ionicons name="location" size={18} color={on ? brand.oat : brand.basil} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.addrLab}>{formatAddressLabel(a)}</Text>
                    <Text style={styles.addrLine} numberOfLines={2}>
                      {formatAddressLine(a)}
                    </Text>
                  </View>
                  <Ionicons
                    name={on ? 'checkmark-circle' : 'ellipse-outline'}
                    size={22}
                    color={on ? brand.basil : colors.textMuted}
                  />
                </Pressable>
              );
            })}
            <Pressable
              style={styles.manage}
              onPress={() => {
                setAddrOpen(false);
                navigateRoot('SavedAddresses');
              }}
            >
              <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
              <Text style={styles.manageTxt}>Add or manage addresses</Text>
            </Pressable>
          </ScrollView>
        )}
      </BottomSheet>

      <FilterPanelModal
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        areas={areas}
        value={filters}
        onApply={setFilters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  body: { paddingHorizontal: spacing.xl },
  sectionSpacer: { height: spacing.xxl },
  sheetLoading: { paddingVertical: spacing.xl, alignItems: 'center' },
  emptyWrap: { alignItems: 'center', paddingVertical: spacing.md, gap: spacing.lg },
  emptyText: { fontFamily: fonts.regular, fontSize: 15, color: colors.textSecondary, textAlign: 'center' },
  addrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  addrRowOn: { borderColor: colors.primary, backgroundColor: colors.mint },
  addrIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addrLab: { fontFamily: fonts.bold, fontSize: 15, color: colors.text },
  addrLine: { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  manage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  manageTxt: { fontFamily: fonts.bold, fontSize: 15, color: colors.primary },
});
