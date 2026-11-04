import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { brand, fonts, radii, spacing } from '../../theme';
import { GrabitMark } from '../brand/GrabitMark';
import { GrabitLogo } from '../brand/GrabitWordmark';

type Props = {
  greeting: string;
  deliveryLine: string;
  onPressDelivery?: () => void;
  onPressNotifications?: () => void;
  /** search bar (sits inside the green panel) */
  children?: ReactNode;
};

/** Basil header panel: logo, delivery address, headline and search. */
export function HomeHeader({ greeting, deliveryLine, onPressDelivery, onPressNotifications, children }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.panel, { paddingTop: insets.top + spacing.md }]}>
      <GrabitMark size={260} variant="mono" color="rgba(196,240,66,0.09)" style={styles.watermark} />

      <View style={styles.topRow}>
        <GrabitLogo size={22} tone="dark" />
        <Pressable
          onPress={onPressNotifications}
          style={({ pressed }) => [styles.bell, pressed && { transform: [{ scale: 0.92 }] }]}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
        >
          <Ionicons name="notifications-outline" size={22} color={brand.oat} />
        </Pressable>
      </View>

      <Pressable
        onPress={onPressDelivery}
        style={styles.delivery}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`Deliver to ${deliveryLine}. Change address`}
      >
        <Text style={styles.deliverLabel}>Deliver to</Text>
        <View style={styles.deliverRow}>
          <Ionicons name="location" size={16} color={brand.lime} />
          <Text style={styles.deliverLine} numberOfLines={1}>
            {deliveryLine}
          </Text>
          <Ionicons name="chevron-down" size={16} color={brand.oat} />
        </View>
      </Pressable>

      <Text style={styles.greeting}>{greeting}</Text>
      <Text style={styles.headline}>What are we grabbing today?</Text>

      {children ? <View style={styles.search}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: brand.basil,
    borderBottomLeftRadius: radii.xxl,
    borderBottomRightRadius: radii.xxl,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
  watermark: { position: 'absolute', right: -70, top: 10 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,246,230,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  delivery: { marginTop: spacing.lg, alignSelf: 'flex-start', maxWidth: '92%' },
  deliverLabel: { fontFamily: fonts.semibold, fontSize: 12, color: brand.lime, letterSpacing: 0.3 },
  deliverRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  deliverLine: { fontFamily: fonts.bold, fontSize: 15, color: brand.oat, flexShrink: 1 },
  greeting: { marginTop: spacing.lg, fontFamily: fonts.medium, fontSize: 15, color: brand.oat, opacity: 0.9 },
  headline: {
    fontFamily: fonts.display,
    fontSize: 30,
    lineHeight: 33,
    letterSpacing: -0.8,
    color: brand.oat,
    marginTop: 2,
    maxWidth: 300,
  },
  search: { marginTop: spacing.lg },
});
