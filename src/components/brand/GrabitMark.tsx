import type { StyleProp, ViewStyle } from 'react-native';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';
import { brand } from '../../theme';

/**
 * The Grab Bag — a tote with a lowercase g on its face, a leaf and a tomato peeking
 * out of the top. viewBox 0 0 120 120. Parts are exported so animations can move them.
 */
export const MARK = {
  handle: 'M44 44C44 21 76 21 76 44',
  handleWidth: 9,
  leaf: 'M49 43C46 32 52 23 63 22C63 33 57 40 49 43Z',
  tomato: { cx: 71, cy: 37, r: 9 },
  body: 'M24 42H96L90 98Q89 108 79 108H41Q31 108 30 98Z',
  ring: { cx: 60, cy: 68, r: 13 },
  stem: 'M73 56V81Q73 94 60 94Q53 94 49 90',
  letterWidth: 9,
  /** centre of the bag's opening, where groceries pop out */
  mouth: { x: 60, y: 44 },
} as const;

/** A leaf green that stays visible on cream and white. */
const LEAF_ON_LIGHT = '#6DBE45';

/**
 * color   — on light backgrounds (green bag, cream g)
 * reverse — on the brand green (cream bag, green g)
 * dark    — on forest ink (green bag, butter handle)
 * mono    — one colour; `knockout` is the g (usually the background)
 */
export type MarkVariant = 'color' | 'reverse' | 'dark' | 'mono';

export function markColors(variant: MarkVariant, mono?: string, knockout?: string) {
  switch (variant) {
    case 'reverse':
      return { handle: brand.cream, leaf: brand.sprout, tomato: brand.tomato, body: brand.cream, letter: brand.green };
    case 'dark':
      return { handle: brand.butter, leaf: brand.sprout, tomato: brand.tomato, body: brand.green, letter: brand.cream };
    case 'mono': {
      const c = mono ?? brand.ink;
      return { handle: c, leaf: c, tomato: c, body: c, letter: knockout ?? 'transparent' };
    }
    default:
      return { handle: brand.ink, leaf: LEAF_ON_LIGHT, tomato: brand.tomato, body: brand.green, letter: brand.cream };
  }
}

/** The bag's shapes without an <Svg> wrapper, for composing inside other drawings. */
export function BagShapes({
  colors: c,
  showLeaf = true,
  showHandle = true,
}: {
  colors: ReturnType<typeof markColors>;
  showLeaf?: boolean;
  showHandle?: boolean;
}) {
  return (
    <>
      {showHandle ? (
        <Path d={MARK.handle} fill="none" stroke={c.handle} strokeWidth={MARK.handleWidth} strokeLinecap="round" />
      ) : null}
      {showLeaf ? (
        <>
          <Circle cx={MARK.tomato.cx} cy={MARK.tomato.cy} r={MARK.tomato.r} fill={c.tomato} />
          <Path d={MARK.leaf} fill={c.leaf} />
        </>
      ) : null}
      <Path d={MARK.body} fill={c.body} />
      <Circle cx={MARK.ring.cx} cy={MARK.ring.cy} r={MARK.ring.r} fill="none" stroke={c.letter} strokeWidth={MARK.letterWidth} />
      <Path d={MARK.stem} fill="none" stroke={c.letter} strokeWidth={MARK.letterWidth} strokeLinecap="round" />
    </>
  );
}

type Props = {
  size?: number;
  variant?: MarkVariant;
  /** colour for the mono variant */
  color?: string;
  /** colour of the g in the mono variant */
  knockout?: string;
  /** leaf and tomato peeking out of the bag */
  showLeaf?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function GrabitMark({ size = 40, variant = 'color', color, knockout, showLeaf = true, style }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" style={style}>
      <BagShapes colors={markColors(variant, color, knockout)} showLeaf={showLeaf} />
    </Svg>
  );
}

/** App-icon tile: rounded green square with the cream bag inside. */
export function GrabitAppTile({ size = 56, style }: { size?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" style={style}>
      <Rect width={120} height={120} rx={30} fill={brand.green} />
      <G transform="translate(14 8) scale(0.7667)">
        <BagShapes colors={markColors('reverse')} />
      </G>
    </Svg>
  );
}
