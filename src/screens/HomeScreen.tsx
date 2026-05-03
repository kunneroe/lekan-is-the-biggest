import { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CategoryPillGrid } from '../components/home/CategoryPillGrid';
import { HomeHeader } from '../components/home/HomeHeader';
import { HomeSearchBar } from '../components/home/HomeSearchBar';
import { PromoBannerCarousel } from '../components/home/PromoBannerCarousel';
import { SectionHeader } from '../components/home/SectionHeader';
import { SupermarketListCard } from '../components/home/SupermarketListCard';
import { useDemo } from '../context/DemoContext';
import { SUPERMARKETS } from '../data/supermarkets';
import { navigateRoot } from '../navigation/navigationRef';
import { colors, radii, spacing } from '../theme';

const TAB_BAR_EXTRA = 64;

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const {
    savedAddresses,
    selectedAddressId,
    setSelectedAddressId,
  } = useDemo();
  const [addrOpen, setAddrOpen] = useState(false);
  const [homeCategory, setHomeCategory] = useState<string | null>(null);

  const addr = savedAddresses.find((a) => a.id === selectedAddressId);
  const deliveryLine = addr
    ? `${addr.label}, ${addr.line.split(',').slice(0, 1).join('').trim()}`
    : 'Select address';

  const openStore = (storeId: string, categoryId?: string) => {
    navigateRoot('Store', { storeId, categoryId });
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
              'Try opening a supermarket to search products there (demo).',
            )
          }
          onPressFilter={() => Alert.alert('Filters', 'Filter panel (mock).')}
        />
        <PromoBannerCarousel />
        <SectionHeader
          title="Categories"
          actionLabel="View all"
          onPressAction={() =>
            openStore(SUPERMARKETS[0].id)
          }
        />
        <CategoryPillGrid
          selectedId={homeCategory}
          onSelect={(id) => {
            setHomeCategory(id);
            openStore(SUPERMARKETS[0].id, id);
          }}
        />
        <View style={styles.sectionSpacer} />
        <SectionHeader title="Supermarkets Near You" />
        {SUPERMARKETS.map((store) => (
          <SupermarketListCard
            key={store.id}
            store={store}
            onPress={() => openStore(store.id)}
          />
        ))}
      </ScrollView>
      <Modal visible={addrOpen} transparent animationType="fade">
        <View style={styles.modalWrap}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setAddrOpen(false)}
          />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Delivery address</Text>
            {savedAddresses.map((a) => (
              <Pressable
                key={a.id}
                style={[
                  styles.modalRow,
                  selectedAddressId === a.id && styles.modalRowOn,
                ]}
                onPress={() => {
                  setSelectedAddressId(a.id);
                  setAddrOpen(false);
                  Alert.alert('Updated', `Delivering to ${a.label}`);
                }}
              >
                <Text style={styles.modalLab}>{a.label}</Text>
                <Text style={styles.modalLine}>{a.line}</Text>
              </Pressable>
            ))}
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
});
