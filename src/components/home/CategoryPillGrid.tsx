import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CATEGORY_ITEMS } from '../../data/supermarkets';
import { colors, radii, spacing, typography } from '../../theme';

const ROWS = [
  CATEGORY_ITEMS.slice(0, 4),
  CATEGORY_ITEMS.slice(4, 8),
] as const;

type Props = {
  selectedId?: string | null;
  onSelect?: (categoryId: string) => void;
};

export function CategoryPillGrid({ selectedId, onSelect }: Props) {
  return (
    <View style={styles.wrap}>
      {ROWS.map((row, idx) => (
        <View key={idx} style={styles.row}>
          {row.map((cat) => {
            const on = selectedId === cat.id;
            return (
              <Pressable
                key={cat.id}
                style={styles.cell}
                onPress={() => onSelect?.(cat.id)}
              >
                <View style={[styles.iconWrap, on && styles.iconOn]}>
                  <Ionicons
                    name={cat.icon}
                    size={26}
                    color={on ? colors.surface : colors.primary}
                  />
                </View>
                <Text
                  style={[styles.label, typography.categoryLabel, on && styles.labelOn]}
                  numberOfLines={1}
                >
                  {cat.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    maxWidth: '25%',
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: radii.sm,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconOn: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  label: {
    color: colors.text,
    textAlign: 'center',
  },
  labelOn: {
    color: colors.primary,
    fontWeight: '800',
  },
});
