import type { StyleProp, ViewStyle } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { brand } from '../../theme';

/** The Grab G — a G closing like a hand around a tomato. viewBox 0 0 120 120. */
export const MARK = {
  g: 'M73 24.29A38 38 0 1 0 98 60L66 60',
  /** length of the G stroke, for draw-on animations */
  gLength: 225,
  leaf: 'M91 28C92 21 97 18 103 18C102 24 97 28 91 28Z',
  dot: { cx: 91.1, cy: 38.2, r: 10.5 },
  stroke: 20,
} as const;

export type MarkVariant = 'color' | 'reverse' | 'mono';

export function markColors(variant: MarkVariant, mono?: string) {
  if (variant === 'mono') {
    const c = mono ?? brand.forest;
    return { g: c, dot: c, leaf: c };
  }
  if (variant === 'reverse') {
    return { g: brand.oat, dot: brand.tomato, leaf: brand.lime };
  }
  return { g: brand.basil, dot: brand.tomato, leaf: brand.basil };
}

type Props = {
  size?: number;
  variant?: MarkVariant;
  /** colour for the mono variant */
  color?: string;
  showLeaf?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function GrabitMark({ size = 40, variant = 'color', color, showLeaf = true, style }: Props) {
  const c = markColors(variant, color);
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" style={style}>
      <Path
        d={MARK.g}
        fill="none"
        stroke={c.g}
        strokeWidth={MARK.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={MARK.dot.cx} cy={MARK.dot.cy} r={MARK.dot.r} fill={c.dot} />
      {showLeaf ? <Path d={MARK.leaf} fill={c.leaf} /> : null}
    </Svg>
  );
}

/** App-icon tile: rounded Basil square with the reverse mark inside. */
export function GrabitAppTile({ size = 56, style }: { size?: number; style?: StyleProp<ViewStyle> }) {
  const c = markColors('reverse');
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" style={style}>
      <Rect width={120} height={120} rx={30} fill={brand.basil} />
      <Path
        d={MARK.g}
        transform="translate(15 15) scale(0.75)"
        fill="none"
        stroke={c.g}
        strokeWidth={MARK.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={15 + MARK.dot.cx * 0.75} cy={15 + MARK.dot.cy * 0.75} r={MARK.dot.r * 0.75} fill={c.dot} />
      <Path d={MARK.leaf} transform="translate(15 15) scale(0.75)" fill={c.leaf} />
    </Svg>
  );
}
