import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radii, spacing } from '../../theme';

export type AuthFieldVariant = 'mintBorder' | 'mintFlat' | 'outlined';

type Props = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: ComponentProps<typeof TextInput>['keyboardType'];
  autoCapitalize?: ComponentProps<typeof TextInput>['autoCapitalize'];
  onToggleSecure?: () => void;
  secureVisible?: boolean;
  /** Login: light mint + hairline border. Register: mint fill, no border. Forgot: white + border. */
  variant?: AuthFieldVariant;
};

export function AuthTextField({
  label,
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  onToggleSecure,
  secureVisible,
  variant = 'mintBorder',
}: Props) {
  const rowStyle = [
    styles.row,
    variant === 'mintFlat' && styles.rowMintFlat,
    variant === 'outlined' && styles.rowOutlined,
  ];

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={rowStyle}>
        <Ionicons name={icon} size={20} color={colors.textMuted} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !secureVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize ?? 'none'}
        />
        {onToggleSecure ? (
          <Pressable onPress={onToggleSecure} hitSlop={12}>
            <Ionicons
              name={secureVisible ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color={colors.textMuted}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg },
  label: {
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    fontSize: 13,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.mint,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    minHeight: 52,
  },
  rowMintFlat: {
    borderWidth: 0,
    backgroundColor: '#EEF5F0',
  },
  rowOutlined: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
});
