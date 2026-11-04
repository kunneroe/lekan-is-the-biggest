import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { brand, colors, fonts, radii, spacing } from '../../theme';
import { GrabitLoader } from '../brand/GrabitLoader';
import { PressableScale } from '../motion/PressableScale';

type Variant = 'primary' | 'secondary' | 'dark';

type Props = {
  label: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  variant?: Variant;
  style?: StyleProp<ViewStyle>;
};

export function PrimaryButton({
  label,
  onPress,
  icon,
  loading = false,
  disabled = false,
  variant = 'primary',
  style,
}: Props) {
  const fg = variant === 'secondary' ? colors.primary : colors.surface;
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      onPress={disabled || loading ? undefined : onPress}
      disabled={disabled || loading}
      hapticFeedback
      containerStyle={{ width: '100%' }}
      style={[
        styles.btn,
        variant === 'secondary' && styles.secondary,
        variant === 'dark' && styles.dark,
        disabled && !loading && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <View style={styles.row}>
          <GrabitLoader size={22} variant={variant === 'secondary' ? 'color' : 'reverse'} />
          <Text style={[styles.label, { color: fg }]}>{label}</Text>
        </View>
      ) : (
        <View style={styles.row}>
          <Text style={[styles.label, { color: fg }]}>{label}</Text>
          {icon ? <Ionicons name={icon} size={20} color={fg} /> : null}
        </View>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: '100%',
    minHeight: 56,
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.mintStrong,
  },
  dark: { backgroundColor: brand.forest },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  label: { fontFamily: fonts.bold, fontSize: 16 },
  disabled: { opacity: 0.5 },
});
