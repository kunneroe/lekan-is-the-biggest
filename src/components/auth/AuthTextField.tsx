import { Ionicons } from '@expo/vector-icons';
import { useRef, useState, type ComponentProps } from 'react';
import { Animated, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { brand, colors, fonts, radii, spacing } from '../../theme';

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
  /** Kept for compatibility — every variant now uses the Grabit field style. */
  variant?: AuthFieldVariant;
};

/** Labelled field; the border glows Basil and the icon turns green while focused. */
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
}: Props) {
  const [focused, setFocused] = useState(false);
  const focus = useRef(new Animated.Value(0)).current;

  const animate = (to: number) =>
    Animated.timing(focus, { toValue: to, duration: 180, useNativeDriver: false }).start();

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Animated.View
        style={[
          styles.row,
          {
            borderColor: focus.interpolate({ inputRange: [0, 1], outputRange: [colors.border, brand.basil] }),
            backgroundColor: focus.interpolate({ inputRange: [0, 1], outputRange: [colors.surfaceAlt, colors.surface] }),
          },
        ]}
      >
        <Ionicons name={icon} size={20} color={focused ? brand.basil : colors.textMuted} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !secureVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize ?? 'none'}
          accessibilityLabel={label}
          onFocus={() => {
            setFocused(true);
            animate(1);
          }}
          onBlur={() => {
            setFocused(false);
            animate(0);
          }}
        />
        {onToggleSecure ? (
          <Pressable
            onPress={onToggleSecure}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={secureVisible ? 'Hide password' : 'Show password'}
          >
            <Ionicons name={secureVisible ? 'eye-off-outline' : 'eye-outline'} size={22} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg },
  label: { fontFamily: fonts.bold, color: colors.text, marginBottom: spacing.sm, fontSize: 13 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    paddingHorizontal: spacing.lg,
    minHeight: 54,
  },
  input: { flex: 1, paddingVertical: spacing.md, fontSize: 16, color: colors.text, fontFamily: fonts.regular },
});
