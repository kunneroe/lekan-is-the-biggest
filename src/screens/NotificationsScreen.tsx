import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';

export function NotificationsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      contentContainerStyle={[
        styles.scroll,
        { paddingBottom: insets.bottom + spacing.xxl },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.empty}>
        <Ionicons name="notifications-off-outline" size={56} color={colors.textMuted} />
        <Text style={styles.emptyTitle}>No notifications yet</Text>
        <Text style={styles.emptySub}>
          You're all caught up! Check back here for order updates and offers.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: spacing.xl,
    flexGrow: 1,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontWeight: '700',
    fontSize: 18,
    color: colors.text,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  emptySub: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 22,
  },
});

