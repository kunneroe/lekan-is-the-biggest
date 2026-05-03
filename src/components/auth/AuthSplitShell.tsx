import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, shadows, spacing, typography } from '../../theme';

type Props = {
  title: string;
  subtitle: string;
  /** Form + actions that sit inside the white card */
  children: ReactNode;
  /** Sign-up promo / social row — rendered on mint below the card */
  belowCard?: ReactNode;
};

/**
 * Onboarding-style split: pale mint full screen, stacked Goshop branding,
 * floating white card (rounded), optional mint-area content below the card.
 */
export function AuthSplitShell({
  title,
  subtitle,
  children,
  belowCard,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingTop: insets.top + spacing.lg,
          paddingBottom: insets.bottom + spacing.xxl,
        },
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.brandBlock}>
        <View style={styles.logoTile}>
          <Ionicons name="basket-outline" size={30} color={colors.surface} />
        </View>
        <Text style={styles.brandWord}>Goshop</Text>
        <Text style={styles.screenTitle}>{title}</Text>
        <Text style={styles.screenSub}>{subtitle}</Text>
      </View>

      <View style={styles.card}>{children}</View>

      {belowCard ? <View style={styles.below}>{belowCard}</View> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
  },
  brandBlock: {
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.lg,
  },
  logoTile: {
    width: 56,
    height: 56,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  brandWord: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: spacing.lg,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  screenSub: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xl,
    ...shadows.card,
  },
  below: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xs,
  },
});
