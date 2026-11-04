import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GrabitLogo } from '../../components/brand/GrabitWordmark';
import { appAlert } from '../../context/DialogContext';
import { navigateRoot } from '../../navigation/navigationRef';
import { colors, fonts, radii, shadows, spacing } from '../../theme';
import { haptic } from '../../utils/haptics';

export function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [push, setPush] = useState(true);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ padding: spacing.xl, paddingBottom: insets.bottom + spacing.xxl }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.sec}>Notifications</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.icon}>
            <Ionicons name="notifications" size={19} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.lab}>Push notifications</Text>
            <Text style={styles.sub}>Order updates and rider messages</Text>
          </View>
          <Switch
            value={push}
            onValueChange={(v) => {
              haptic.select();
              setPush(v);
            }}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#FFFFFF"
            accessibilityLabel="Push notifications"
          />
        </View>
      </View>

      <Text style={styles.sec}>App</Text>
      <View style={styles.card}>
        <Pressable
          style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          onPress={() => navigateRoot('Favorites')}
          accessibilityRole="button"
        >
          <View style={styles.icon}>
            <Ionicons name="heart" size={19} color={colors.primary} />
          </View>
          <Text style={[styles.lab, { flex: 1 }]}>Manage favorites</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>
        <View style={styles.divider} />
        <Pressable
          style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          onPress={() =>
            appAlert('Clear app cache?', 'This removes saved images and data on this phone. Your account and orders stay safe.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Clear cache', style: 'destructive', onPress: () => appAlert('Cache cleared', 'Mock: cache cleared.') },
            ])
          }
          accessibilityRole="button"
        >
          <View style={styles.icon}>
            <Ionicons name="trash" size={19} color={colors.primary} />
          </View>
          <Text style={[styles.lab, { flex: 1 }]}>Clear app cache</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>
      </View>

      <View style={styles.footer}>
        <GrabitLogo size={18} />
        <Text style={styles.ver}>Build demo · no cloud sync</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  sec: {
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  card: { backgroundColor: colors.surface, borderRadius: radii.xl, marginBottom: spacing.xl, overflow: 'hidden', ...shadows.soft },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg },
  pressed: { backgroundColor: colors.surfaceAlt },
  icon: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lab: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text },
  sub: { fontFamily: fonts.regular, fontSize: 12, color: colors.textSecondary, marginTop: 1 },
  divider: { height: 1, backgroundColor: colors.border, marginLeft: 72 },
  footer: { alignItems: 'center', gap: spacing.sm, marginTop: spacing.md },
  ver: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted },
});
