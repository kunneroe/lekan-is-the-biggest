import { View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { brand } from '../../theme';
import { GrabitMark, type MarkVariant } from './GrabitMark';
import { WORDMARK } from './wordmarkPath';

type WordmarkProps = {
  /** rendered height in px (includes the descender of the g) */
  height?: number;
  color?: string;
  /** i-dot colour; defaults to the text colour */
  dotColor?: string;
  style?: StyleProp<ViewStyle>;
};

export const wordmarkWidth = (height: number) => (WORDMARK.width / WORDMARK.height) * height;
export const WORDMARK_VIEWBOX = `${WORDMARK.minX} ${WORDMARK.minY} ${WORDMARK.width} ${WORDMARK.height}`;

/** "grabit" in rounded Fredoka Bold, as outlines so it is identical on every phone. */
export function GrabitWordmark({ height = 28, color = brand.ink, dotColor, style }: WordmarkProps) {
  return (
    <Svg width={wordmarkWidth(height)} height={height} viewBox={WORDMARK_VIEWBOX} style={style}>
      {WORDMARK.letters.map((l) => (
        <Path key={l.x0} d={l.d} fill={color} />
      ))}
      <Circle cx={WORDMARK.dot.cx} cy={WORDMARK.dot.cy} r={WORDMARK.dot.r} fill={dotColor ?? color} />
    </Svg>
  );
}

type LockupProps = {
  /** wordmark height; the mark is sized to match */
  size?: number;
  /** light: on cream/white · brand: on brand red · dark: on forest ink */
  tone?: 'light' | 'brand' | 'dark';
  style?: StyleProp<ViewStyle>;
};

/** Horizontal lockup: Grab Bag + grabit. */
export function GrabitLogo({ size = 26, tone = 'light', style }: LockupProps) {
  const variant: MarkVariant = tone === 'brand' ? 'reverse' : tone === 'dark' ? 'dark' : 'color';
  const text = tone === 'brand' ? '#FFFFFF' : tone === 'dark' ? brand.cream : brand.ink;
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel="Grabit"
      style={[{ flexDirection: 'row', alignItems: 'center', gap: size * 0.22 }, style]}
    >
      <GrabitMark size={size * 1.35} variant={variant} />
      <GrabitWordmark height={size} color={text} style={{ marginTop: size * 0.12 }} />
    </View>
  );
}
