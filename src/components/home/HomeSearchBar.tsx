import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { brand, colors, fonts, radii, shadows, spacing } from '../../theme';

type Props = {
  value?: string;
  onChangeText?: (t: string) => void;
  onPressFilter?: () => void;
  onSubmit?: () => void;
  placeholder?: string;
  filterActive?: boolean;
};

export function HomeSearchBar({
  value,
  onChangeText,
  onPressFilter,
  onSubmit,
  placeholder = 'Search supermarkets or products',
  filterActive = false,
}: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.wrap}>
        <Ionicons name="search" size={20} color={colors.textMuted} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          returnKeyType="search"
          onSubmitEditing={onSubmit}
          accessibilityLabel="Search"
        />
      </View>
      <Pressable
        onPress={onPressFilter}
        hitSlop={6}
        style={({ pressed }) => [styles.filterBtn, pressed && { transform: [{ scale: 0.94 }] }]}
        accessibilityRole="button"
        accessibilityLabel={filterActive ? 'Filters, active' : 'Filters'}
      >
        <Ionicons name="options" size={22} color={brand.forest} />
        {filterActive && <View style={styles.activeDot} />}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  wrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    minHeight: 52,
    ...shadows.soft,
  },
  input: { flex: 1, paddingVertical: spacing.md, color: colors.text, fontFamily: fonts.regular, fontSize: 15 },
  filterBtn: {
    width: 52,
    height: 52,
    borderRadius: radii.lg,
    backgroundColor: brand.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: brand.tomato,
    borderWidth: 2,
    borderColor: brand.lime,
  },
});
