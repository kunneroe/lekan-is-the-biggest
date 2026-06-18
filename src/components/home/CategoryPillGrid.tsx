import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing, typography } from '../../theme';

export type CategoryGridItem = {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
};

type Props = {
  categories: CategoryGridItem[];
  selectedId?: string | null;
  onSelect?: (categoryId: string) => void;
};

function chunk<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
}

export function CategoryPillGrid({ categories, selectedId, onSelect }: Props) {
  const rows = chunk(categories.slice(0, 8), 4);

  if (categories.length === 0) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      {rows.map((row, idx) => (
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
                  {cat.name}
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
