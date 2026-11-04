import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing } from '../../theme';
import { TEXT_CAP } from '../../utils/responsive';

type Props = {
  label: string;
  /** a string, or an element such as <AnimatedPrice /> */
  value: ReactNode;
  emphasis?: boolean;
  valueColor?: string;
};

/**
 * One line of an order summary. The label takes the free space and wraps if it must;
 * the amount never shrinks or gets cut, on any screen width or system font size.
 */
export function SummaryRow({ label, value, emphasis = false, valueColor }: Props) {
  return (
    <View style={styles.row}>
      <Text style={[styles.label, emphasis && styles.labelStrong]} maxFontSizeMultiplier={TEXT_CAP.body}>
        {label}
      </Text>
      {typeof value === 'string' ? (
        <Text
          style={[styles.value, emphasis && styles.valueStrong, valueColor ? { color: valueColor } : null]}
          maxFontSizeMultiplier={TEXT_CAP.control}
        >
          {value}
        </Text>
      ) : (
        value
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  label: { flex: 1, flexShrink: 1, fontFamily: fonts.regular, fontSize: 15, color: colors.textSecondary },
  labelStrong: { fontFamily: fonts.bold, fontSize: 16, color: colors.text },
  value: { flexShrink: 0, textAlign: 'right', fontFamily: fonts.semibold, fontSize: 15, color: colors.text },
  valueStrong: { fontFamily: fonts.display, fontSize: 20, color: colors.primary },
});
