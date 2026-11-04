import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii, spacing } from '../../theme';
import { FadeInUp } from '../motion/FadeInUp';
import { PressableScale } from '../motion/PressableScale';

export type CategoryGridItem = {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: { bg: string; icon: string };
};

type Props = {
  categories: CategoryGridItem[];
  selectedId?: string | null;
  onSelect?: (categoryId: string) => void;
};

export function CategoryPillGrid({ categories, selectedId, onSelect }: Props) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <View style={styles.grid}>
      {categories.slice(0, 8).map((cat, i) => {
        const on = selectedId === cat.id;
        return (
          <FadeInUp key={cat.id} index={i} distance={10} style={styles.cell}>
            <PressableScale
              onPress={() => onSelect?.(cat.id)}
              hapticFeedback
              scaleTo={0.9}
              accessibilityRole="button"
              accessibilityLabel={cat.name}
              style={styles.inner}
            >
              <View style={[styles.iconWrap, { backgroundColor: cat.color.bg }, on && { borderColor: cat.color.icon }]}>
                <Ionicons name={cat.icon} size={26} color={cat.color.icon} />
              </View>
              <Text style={[styles.label, on && styles.labelOn]} numberOfLines={1}>
                {cat.name}
              </Text>
            </PressableScale>
          </FadeInUp>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: spacing.lg },
  cell: { width: '25%' },
  inner: { alignItems: 'center' },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  label: { fontFamily: fonts.semibold, fontSize: 12, color: colors.text, textAlign: 'center', paddingHorizontal: 2 },
  labelOn: { color: colors.primary, fontFamily: fonts.black },
});
