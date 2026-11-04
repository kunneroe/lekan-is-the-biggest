import { View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { brand } from '../../theme';
import { GrabitMark, type MarkVariant } from './GrabitMark';
import { WORDMARK } from './wordmarkPath';

type WordmarkProps = {
  /** rendered height in px (includes the descender of the g) */
  height?: number;
  color?: string;
  dotColor?: string;
  style?: StyleProp<ViewStyle>;
};

export const wordmarkWidth = (height: number) => (WORDMARK.width / WORDMARK.height) * height;
export const WORDMARK_VIEWBOX = `${WORDMARK.minX} ${WORDMARK.minY} ${WORDMARK.width} ${WORDMARK.height}`;

export function GrabitWordmark({
  height = 28,
  color = brand.forest,
  dotColor = brand.tomato,
  style,
}: WordmarkProps) {
  return (
    <Svg width={wordmarkWidth(height)} height={height} viewBox={WORDMARK_VIEWBOX} style={style}>
      {WORDMARK.letters.map((l) => (
        <Path key={l.x0} d={l.d} fill={color} />
      ))}
      <Circle cx={WORDMARK.dot.cx} cy={WORDMARK.dot.cy} r={WORDMARK.dot.r} fill={dotColor} />
    </Svg>
  );
}

type LockupProps = {
  /** wordmark height; the mark is sized to match */
  size?: number;
  /** "dark" = for green or dark backgrounds */
  tone?: 'light' | 'dark';
  style?: StyleProp<ViewStyle>;
};

/** Horizontal lockup: Grab G + grabit. */
export function GrabitLogo({ size = 26, tone = 'light', style }: LockupProps) {
  const variant: MarkVariant = tone === 'dark' ? 'reverse' : 'color';
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel="Grabit"
      style={[{ flexDirection: 'row', alignItems: 'center', gap: size * 0.26 }, style]}
    >
      <GrabitMark size={size * 1.25} variant={variant} />
      <GrabitWordmark
        height={size}
        color={tone === 'dark' ? brand.oat : brand.forest}
        style={{ marginTop: size * 0.16 }}
      />
    </View>
  );
}
