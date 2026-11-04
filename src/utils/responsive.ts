import { useCallback, useState } from 'react';
import { useWindowDimensions, type LayoutChangeEvent } from 'react-native';

/** The design was drawn for a 390pt-wide phone. */
const BASE_WIDTH = 390;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/**
 * Screen-aware sizing. Small Androids (320–360pt, or Samsung "display zoom") get
 * slightly smaller tiles and gutters; big phones get a touch more room.
 */
export function useLayout() {
  const { width, height, fontScale } = useWindowDimensions();
  const k = clamp(width / BASE_WIDTH, 0.82, 1.12);
  return {
    width,
    height,
    fontScale,
    /** narrower than a typical 360pt Android */
    isSmall: width < 360,
    /** narrower than an iPhone 14 / Pixel 7 */
    isNarrow: width < 380,
    /** the user has a large system font (common on Samsung) */
    bigText: fontScale > 1.15,
    /** scale a design size to this screen */
    s: (n: number) => Math.round(n * k),
    /** side padding of screens */
    gutter: width < 360 ? 16 : 20,
  };
}

/** Largest a system font may grow headings and fixed-size controls to. */
export const TEXT_CAP = {
  display: 1.25,
  control: 1.3,
  body: 1.6,
} as const;

/**
 * Measures a floating bottom bar so the scroll content above it can reserve exactly
 * that much space — the bar grows with big system fonts and tall navigation bars,
 * so a fixed padding would let it cover the last rows (subtotal, fees, total).
 */
export function useBarHeight(initial = 96) {
  const [height, setHeight] = useState(initial);
  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const h = Math.ceil(e.nativeEvent.layout.height);
    setHeight((prev) => (Math.abs(prev - h) > 1 ? h : prev));
  }, []);
  return [height, onLayout] as const;
}
