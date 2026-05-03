import { Ionicons } from '@expo/vector-icons';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useDemo } from '../context/DemoContext';
import { navigateRoot } from '../navigation/navigationRef';
import { colors, radii, shadows, spacing, typography } from '../theme';

type Row = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  badge?: number;
  destructive?: boolean;
};

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();
  const { user, favoriteIds } = useDemo();

  const accountRows: Row[] = [
    {
      key: 'addr',
      label: 'Saved addresses',
      icon: 'location-outline',
      onPress: () => navigateRoot('SavedAddresses'),
    },
    {
      key: 'fav',
      label: 'Favorites',
      icon: 'heart-outline',
      onPress: () => navigateRoot('Favorites'),
    },
    {
      key: 'notif',
      label: 'Notifications',
      icon: 'notifications-outline',
      onPress: () => navigateRoot('Notifications'),
      badge: 12,
    },
    {
      key: 'pay',
      label: 'Payment methods',
      icon: 'wallet-outline',
      onPress: () => navigateRoot('PaymentMethods'),
    },
    {
      key: 'hist',
      label: 'Order history',
      icon: 'receipt-outline',
      onPress: () => navigateRoot('OrderHistory'),
    },
  ];

  const supportRows: Row[] = [
    {
      key: 'help',
      label: 'Help & support',
      icon: 'help-circle-outline',
      onPress: () => navigateRoot('HelpSupport'),
    },
    {
      key: 'set',
      label: 'Settings',
      icon: 'settings-outline',
      onPress: () => navigateRoot('Settings'),
    },
    {
      key: 'out',
      label: 'Logout',
      icon: 'log-out-outline',
      destructive: true,
      onPress: () =>
        Alert.alert('Logout', 'Sign out and return to the login screen?', [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Logout',
            style: 'destructive',
            onPress: () => {
              void signOut();
            },
          },
        ]),
    },
  ];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{
        paddingBottom: insets.bottom + spacing.xxl,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.top, { paddingTop: insets.top + spacing.md }]}>
        <Pressable onPress={() => Alert.alert('Menu', 'Mock menu.')}>
          <Ionicons name="menu" size={26} color={colors.primary} />
        </Pressable>
        <Text style={styles.brand}>Goshop</Text>
        <View style={styles.topRight}>
          <Pressable onPress={() => navigateRoot('Notifications')}>
            <View>
              <Ionicons name="notifications-outline" size={22} color={colors.primary} />
              <View style={styles.dot} />
            </View>
          </Pressable>
          <Image source={{ uri: user.avatar }} style={styles.avatarSm} />
        </View>
      </View>
      <View style={styles.card}>
        <View style={styles.avatarWrap}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          <Pressable
            style={styles.edit}
            onPress={() => Alert.alert('Edit profile', 'Mock profile editor.')}
          >
            <Ionicons name="pencil" size={14} color={colors.surface} />
          </Pressable>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.phone}>{user.phone}</Text>
      </View>
      <Text style={styles.sec}>Account settings</Text>
      <View style={styles.menuCard}>
        {accountRows.map((r, i) => (
          <MenuRow key={r.key} row={r} showDivider={i < accountRows.length - 1} />
        ))}
      </View>
      <Text style={styles.sec}>Support & app</Text>
      <View style={styles.menuCard}>
        {supportRows.map((r, i) => (
          <MenuRow key={r.key} row={r} showDivider={i < supportRows.length - 1} />
        ))}
      </View>
      <Text style={styles.ver}>Goshop v2.4.0</Text>
      <Text style={styles.tag}>Made with fresh groceries from Nigeria</Text>
      <Text style={styles.favCount}>
        {favoriteIds.size} items in favorites
      </Text>
    </ScrollView>
  );
}

function MenuRow({ row, showDivider }: { row: Row; showDivider: boolean }) {
  return (
    <>
      <Pressable style={styles.row} onPress={row.onPress}>
        <View
          style={[
            styles.rowIcon,
            row.destructive && { backgroundColor: '#FFEBEE' },
          ]}
        >
          <Ionicons
            name={row.icon}
            size={20}
            color={row.destructive ? colors.danger : colors.primary}
          />
        </View>
        <Text
          style={[styles.rowLabel, row.destructive && { color: colors.danger }]}
        >
          {row.label}
        </Text>
        {row.badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeTxt}>{row.badge}</Text>
          </View>
        ) : null}
        {!row.destructive ? (
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        ) : null}
      </Pressable>
      {showDivider ? <View style={styles.rowDiv} /> : null}
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  brand: { fontSize: 18, fontWeight: '800', color: colors.primary },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  dot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.bannerOrange,
  },
  avatarSm: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.border },
  card: {
    margin: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xxl,
    alignItems: 'center',
    ...shadows.card,
  },
  avatarWrap: { position: 'relative', marginBottom: spacing.lg },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.border,
  },
  edit: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: 20, fontWeight: '800', color: colors.text },
  phone: { color: colors.textSecondary, marginTop: spacing.xs },
  sec: {
    marginLeft: spacing.xl,
    marginBottom: spacing.sm,
    color: colors.textSecondary,
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuCard: {
    marginHorizontal: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    marginBottom: spacing.xl,
    ...shadows.soft,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: { flex: 1, fontWeight: '600', color: colors.text, fontSize: 15 },
  rowDiv: { height: 1, backgroundColor: colors.border, marginLeft: 72 },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.bannerOrange,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeTxt: { color: colors.surface, fontSize: 11, fontWeight: '800' },
  ver: { textAlign: 'center', color: colors.textSecondary, marginTop: spacing.lg },
  tag: { textAlign: 'center', color: colors.textMuted, fontSize: 12, marginTop: 4 },
  favCount: {
    textAlign: 'center',
    color: colors.primary,
    fontWeight: '600',
    marginTop: spacing.md,
  },
});
