import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GrabitMark } from '../components/brand/GrabitMark';
import { GrabitLogo } from '../components/brand/GrabitWordmark';
import { FadeInUp } from '../components/motion/FadeInUp';
import { PressableScale } from '../components/motion/PressableScale';
import { useAuth } from '../context/AuthContext';

import { navigateRoot } from '../navigation/navigationRef';
import { brand, colors, fonts, radii, shadows, spacing } from '../theme';
import { haptic } from '../utils/haptics';

import { appAlert } from '../context/DialogContext';
type Row = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  destructive?: boolean;
};

function initials(name?: string) {
  if (!name) return 'G';
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || 'G';
}

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const { user, signOut } = useAuth() as any;

  const quick: { key: string; label: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void }[] = [
    { key: 'hist', label: 'Orders', icon: 'receipt', onPress: () => navigateRoot('OrderHistory') },
    { key: 'fav', label: 'Favorites', icon: 'heart', onPress: () => navigateRoot('Favorites') },
    { key: 'addr', label: 'Addresses', icon: 'location', onPress: () => navigateRoot('SavedAddresses') },
  ];

  const accountRows: Row[] = [
    { key: 'addr', label: 'Saved addresses', icon: 'location-outline', onPress: () => navigateRoot('SavedAddresses') },
    { key: 'fav', label: 'Favorites', icon: 'heart-outline', onPress: () => navigateRoot('Favorites') },
    { key: 'notif', label: 'Notifications', icon: 'notifications-outline', onPress: () => navigateRoot('Notifications') },
    { key: 'pay', label: 'Payment methods', icon: 'wallet-outline', onPress: () => navigateRoot('PaymentMethods') },
    { key: 'hist', label: 'Order history', icon: 'receipt-outline', onPress: () => navigateRoot('OrderHistory') },
  ];

  const supportRows: Row[] = [
    { key: 'help', label: 'Help & support', icon: 'chatbubbles-outline', onPress: () => navigateRoot('HelpSupport') },
    { key: 'set', label: 'Settings', icon: 'settings-outline', onPress: () => navigateRoot('Settings') },
    {
      key: 'out',
      label: 'Log out',
      icon: 'log-out-outline',
      destructive: true,
      onPress: () =>
        appAlert('Log out', 'Sign out and return to the login screen?', [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Log out',
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
      contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      showsVerticalScrollIndicator={false}
    >
      {isFocused ? <StatusBar style="light" /> : null}
      <View style={[styles.panel, { paddingTop: insets.top + spacing.lg }]}>
        <GrabitMark size={250} variant="mono" color="rgba(185,232,58,0.12)" style={styles.watermark} />
        <View style={styles.panelTop}>
          <Text maxFontSizeMultiplier={1.25} style={styles.panelTitle}>Profile</Text>
          <Pressable
            onPress={() => navigateRoot('Notifications')}
            style={styles.bell}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
          >
            <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
          </Pressable>
        </View>
        <FadeInUp style={styles.me}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text maxFontSizeMultiplier={1.25} style={styles.avatarTxt}>{initials(user?.fullName)}</Text>
            </View>
            <PressableScale
              style={styles.edit}
              onPress={() => appAlert('Edit profile', 'Mock profile editor.')}
              accessibilityRole="button"
              accessibilityLabel="Edit profile"
            >
              <Ionicons name="pencil" size={13} color={brand.ink} />
            </PressableScale>
          </View>
          <View style={{ flex: 1 }}>
            <Text maxFontSizeMultiplier={1.25} style={styles.name} numberOfLines={1}>
              {user?.fullName || 'User'}
            </Text>
            {user?.email ? (
              <Text style={styles.contact} numberOfLines={1}>
                {user.email}
              </Text>
            ) : null}
            {user?.phone ? <Text style={styles.contact}>{user.phone}</Text> : null}
          </View>
        </FadeInUp>
      </View>

      <View style={styles.quickRow}>
        {quick.map((q, i) => (
          <FadeInUp key={q.key} index={i} style={{ flex: 1 }}>
            <PressableScale onPress={q.onPress} hapticFeedback style={styles.quick} accessibilityRole="button">
              <View style={styles.quickIcon}>
                <Ionicons name={q.icon} size={20} color={brand.cream} />
              </View>
              <Text style={styles.quickTxt}>{q.label}</Text>
            </PressableScale>
          </FadeInUp>
        ))}
      </View>

      <Text style={styles.sec}>Account</Text>
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
      <View style={styles.footer}>
        <GrabitLogo size={18} />
        <Text style={styles.ver}>Version 2.4.0</Text>
        <Text style={styles.tag}>Made with fresh groceries from Nigeria</Text>
      </View>
    </ScrollView>
  );
}

function MenuRow({ row, showDivider }: { row: Row; showDivider: boolean }) {
  return (
    <>
      <Pressable
        style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.surfaceAlt }]}
        onPress={() => {
          haptic.select();
          row.onPress();
        }}
        accessibilityRole="button"
      >
        <View style={[styles.rowIcon, row.destructive && { backgroundColor: colors.redTint }]}>
          <Ionicons name={row.icon} size={20} color={row.destructive ? colors.danger : colors.primary} />
        </View>
        <Text style={[styles.rowLabel, row.destructive && { color: colors.danger }]}>{row.label}</Text>
        {!row.destructive ? <Ionicons name="chevron-forward" size={18} color={colors.textMuted} /> : null}
      </Pressable>
      {showDivider ? <View style={styles.rowDiv} /> : null}
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  panel: {
    backgroundColor: brand.green,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl + spacing.xl,
    borderBottomLeftRadius: radii.xxl,
    borderBottomRightRadius: radii.xxl,
    overflow: 'hidden',
  },
  watermark: { position: 'absolute', right: -70, top: -20 },
  panelTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  panelTitle: { fontFamily: fonts.display, fontSize: 30, letterSpacing: -0.3, color: '#FFFFFF' },
  bell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  me: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginTop: spacing.xl },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: brand.butter,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  avatarTxt: { fontFamily: fonts.display, fontSize: 28, color: brand.ink },
  edit: {
    position: 'absolute',
    right: -4,
    bottom: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: brand.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontFamily: fonts.display, fontSize: 22, letterSpacing: -0.2, color: '#FFFFFF' },
  contact: { fontFamily: fonts.medium, fontSize: 14, color: brand.cream, opacity: 0.92, marginTop: 2 },
  quickRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginHorizontal: spacing.xl,
    marginTop: -(spacing.xxxl + spacing.sm),
    marginBottom: spacing.xl,
  },
  quick: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
    ...shadows.card,
  },
  quickIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: brand.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickTxt: { fontFamily: fonts.bold, fontSize: 13, color: colors.text },
  sec: {
    marginLeft: spacing.xl,
    marginBottom: spacing.sm,
    fontFamily: fonts.bold,
    color: colors.textSecondary,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  menuCard: {
    marginHorizontal: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    marginBottom: spacing.xl,
    overflow: 'hidden',
    ...shadows.soft,
  },
  row: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, gap: spacing.md },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: { flex: 1, fontFamily: fonts.semibold, color: colors.text, fontSize: 15 },
  rowDiv: { height: 1, backgroundColor: colors.border, marginLeft: 72 },
  footer: { alignItems: 'center', gap: 4, marginTop: spacing.sm },
  ver: { fontFamily: fonts.medium, color: colors.textSecondary, marginTop: spacing.sm, fontSize: 13 },
  tag: { fontFamily: fonts.regular, color: colors.textMuted, fontSize: 12 },
});
