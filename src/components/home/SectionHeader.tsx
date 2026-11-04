import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, typography } from '../../theme';

type Props = {
  title: string;
  actionLabel?: string;
  onPressAction?: () => void;
  /** small element shown next to the title (e.g. a loader while refreshing) */
  accessory?: ReactNode;
};

export function SectionHeader({ title, actionLabel, onPressAction, accessory }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text style={[styles.title, typography.sectionTitle]}>{title}</Text>
        {accessory}
      </View>
      {actionLabel ? (
        <Pressable onPress={onPressAction} hitSlop={10} style={styles.action} accessibilityRole="button">
          <Text style={styles.actionTxt}>{actionLabel}</Text>
          <Ionicons name="arrow-forward" size={15} color={colors.primary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md + 2,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { color: colors.text },
  action: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionTxt: { fontFamily: fonts.bold, fontSize: 14, color: colors.primary },
});
