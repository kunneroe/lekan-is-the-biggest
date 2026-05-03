import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { colors, radii, shadows, spacing, typography } from '../../theme';

type Props = {
  value?: string;
  onChangeText?: (t: string) => void;
  onPressFilter?: () => void;
  onSubmit?: () => void;
  placeholder?: string;
};

export function HomeSearchBar({
  value,
  onChangeText,
  onPressFilter,
  onSubmit,
  placeholder = 'Search supermarkets or products',
}: Props) {
  return (
    <View style={styles.wrap}>
      <Ionicons name="search-outline" size={20} color={colors.textMuted} style={styles.searchIcon} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, typography.body]}
        returnKeyType="search"
        onSubmitEditing={onSubmit}
      />
      <Pressable
        onPress={onPressFilter}
        hitSlop={8}
        style={styles.filterBtn}
        accessibilityRole="button"
        accessibilityLabel="Filters"
      >
        <Ionicons name="options-outline" size={22} color={colors.primary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xl,
    ...shadows.soft,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    color: colors.text,
  },
  filterBtn: {
    padding: spacing.xs,
  },
});
