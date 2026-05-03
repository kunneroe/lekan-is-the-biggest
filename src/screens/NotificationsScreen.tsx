import { Ionicons } from '@expo/vector-icons';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MOCK_NOTIFICATIONS } from '../data/mockNotifications';
import { colors, radii, spacing, typography } from '../theme';

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
      {MOCK_NOTIFICATIONS.map((n) => (
        <Pressable
          key={n.id}
          style={[styles.row, !n.read && styles.unread]}
          onPress={() =>
            Alert.alert(n.title, n.body, [{ text: 'OK' }])
          }
        >
          <View style={styles.icon}>
            <Ionicons name="notifications" size={22} color={colors.primary} />
          </View>
          <View style={styles.textCol}>
            <Text style={styles.title}>{n.title}</Text>
            <Text style={styles.body}>{n.body}</Text>
            <Text style={styles.time}>{n.time}</Text>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radii.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  unread: {
    borderColor: colors.primary,
    backgroundColor: colors.mint,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: { flex: 1 },
  title: {
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  time: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
