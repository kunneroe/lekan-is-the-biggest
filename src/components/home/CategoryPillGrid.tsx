import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { brand, colors, fonts, radii } from '../../theme';
import { haptic } from '../../utils/haptics';
import { useReducedMotion } from '../../utils/motion';
import { useLayout } from '../../utils/responsive';
import { categoryArt } from './categoryGlyphs';

export type CategoryGridItem = {
  id: string;
  name: string;
  slug?: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: { bg: string; icon: string };
};

type Props = {
  categories: CategoryGridItem[];
  selectedId?: string | null;
  onSelect?: (categoryId: string) => void;
};

const COLS = 4;
const MAX_COLLAPSED = 8;

/**
 * Shop by category: 4 even columns that size themselves to the screen. Names get two
 * lines instead of being cut with "…". Tiles pop in one after another, and the icon
 * hops up when tapped, as if it just got grabbed.
 */
export function CategoryPillGrid({ categories, selectedId, onSelect }: Props) {
  const { width, gutter, isSmall } = useLayout();
  const [expanded, setExpanded] = useState(false);

  if (categories.length === 0) {
    return null;
  }

  const gap = isSmall ? 8 : 12;
  const cellW = Math.floor((width - gutter * 2 - gap * (COLS - 1)) / COLS);
  const tileH = Math.min(76, Math.max(58, cellW - 6));
  const collapsed = categories.length > MAX_COLLAPSED && !expanded;
  const visible = collapsed ? categories.slice(0, MAX_COLLAPSED - 1) : categories;

  return (
    <View style={[styles.grid, { columnGap: gap }]}>
      {visible.map((cat, i) => (
        <CategoryTile
          key={cat.id}
          item={cat}
          index={i}
          width={cellW}
          height={tileH}
          selected={selectedId === cat.id}
          onPress={() => onSelect?.(cat.id)}
        />
      ))}
      {collapsed ? (
        <MoreTile
          index={visible.length}
          width={cellW}
          height={tileH}
          count={categories.length - visible.length}
          onPress={() => {
            haptic.tap();
            setExpanded(true);
          }}
        />
      ) : null}
    </View>
  );
}

function usePopIn(index: number) {
  const v = useRef(new Animated.Value(0)).current;
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) {
      v.setValue(1);
      return;
    }
    Animated.spring(v, {
      toValue: 1,
      delay: Math.min(index, 10) * 45,
      friction: 6,
      tension: 120,
      useNativeDriver: true,
    }).start();
  }, [index, reduced, v]);
  return {
    opacity: v.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 1, 1] }),
    transform: [
      { scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) },
      { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) },
    ],
  };
}

function CategoryTile({
  item,
  index,
  width,
  height,
  selected,
  onPress,
}: {
  item: CategoryGridItem;
  index: number;
  width: number;
  height: number;
  selected: boolean;
  onPress: () => void;
}) {
  const art = categoryArt(item.slug, item.name);
  const enter = usePopIn(index);
  const press = useRef(new Animated.Value(0)).current;
  const hop = useRef(new Animated.Value(0)).current;

  const grab = () => {
    haptic.tap();
    hop.setValue(0);
    Animated.sequence([
      Animated.timing(hop, { toValue: 1, duration: 130, useNativeDriver: true }),
      Animated.spring(hop, { toValue: 0, friction: 4, tension: 200, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={[{ width }, enter]}>
      <Pressable
        onPress={grab}
        onPressIn={() => Animated.spring(press, { toValue: 1, speed: 40, bounciness: 0, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(press, { toValue: 0, speed: 16, bounciness: 12, useNativeDriver: true }).start()}
        accessibilityRole="button"
        accessibilityLabel={item.name}
        accessibilityState={{ selected }}
        style={styles.cell}
      >
        <Animated.View
          style={[
            styles.tile,
            {
              height,
              backgroundColor: art.bg,
              borderColor: selected ? art.fg : 'transparent',
              transform: [{ scale: press.interpolate({ inputRange: [0, 1], outputRange: [1, 0.92] }) }],
            },
          ]}
        >
          <View style={[styles.glow, { width: height * 0.74, height: height * 0.74, borderRadius: height }]} />
          <Animated.View
            style={{
              transform: [
                { translateY: hop.interpolate({ inputRange: [0, 1], outputRange: [0, -8] }) },
                { rotate: hop.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-10deg'] }) },
              ],
            }}
          >
            <MaterialCommunityIcons name={art.glyph} size={Math.round(height * 0.5)} color={art.fg} />
          </Animated.View>
        </Animated.View>
        <Text
          style={[styles.label, selected && { color: art.fg, fontFamily: fonts.black }]}
          numberOfLines={2}
          maxFontSizeMultiplier={1.15}
        >
          {item.name}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

function MoreTile({
  index,
  width,
  height,
  count,
  onPress,
}: {
  index: number;
  width: number;
  height: number;
  count: number;
  onPress: () => void;
}) {
  const enter = usePopIn(index);
  return (
    <Animated.View style={[{ width }, enter]}>
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`Show ${count} more categories`} style={styles.cell}>
        <View style={[styles.tile, styles.moreTile, { height }]}>
          <Text style={styles.moreCount} maxFontSizeMultiplier={1.15}>
            +{count}
          </Text>
        </View>
        <Text style={styles.label} numberOfLines={2} maxFontSizeMultiplier={1.15}>
          More
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 14 },
  cell: { alignItems: 'center' },
  tile: {
    width: '100%',
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    overflow: 'hidden',
  },
  glow: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.55)' },
  moreTile: { backgroundColor: brand.ink, borderColor: 'transparent' },
  moreCount: { fontFamily: fonts.display, fontSize: 18, color: brand.sprout },
  label: {
    marginTop: 7,
    minHeight: 30,
    fontFamily: fonts.semibold,
    fontSize: 12,
    lineHeight: 15,
    color: colors.text,
    textAlign: 'center',
  },
});
