import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Animated, Image, StyleSheet, View } from 'react-native';
import { brand, colors, shadows } from '../theme';
import { ease } from '../utils/motion';

export type Rect = { x: number; y: number; width: number; height: number };
type Measure = () => Promise<Rect | null>;

type Flight = {
  id: number;
  from: Rect;
  to: Rect;
  uri?: string | null;
  x: Animated.Value;
  y: Animated.Value;
};

type FlyOptions = {
  /** land somewhere other than the cart tab (e.g. a screen's own cart button) */
  to?: Rect | null;
  onLand?: () => void;
};

type CartFlyValue = {
  /** Fly a product from `from` (window coordinates) into the cart tab (or `opts.to`). */
  fly: (from: Rect | null, uri?: string | null, opts?: FlyOptions) => void;
  /** The cart tab registers how to find itself on screen. */
  registerCartTarget: (measure: Measure | null) => void;
  /** Increments each time a flight lands — the cart icon "gulps". */
  landTick: number;
};

const CartFlyContext = createContext<CartFlyValue | null>(null);
const SIZE = 52;
const MAX_FLIGHTS = 3;

/** Measure any view in window coordinates. */
export function measureView(ref: { current: View | null }): Promise<Rect | null> {
  return new Promise((resolve) => {
    const node = ref.current;
    if (!node) return resolve(null);
    node.measureInWindow((x, y, width, height) => resolve({ x, y, width, height }));
  });
}

export function CartFlyProvider({ children }: { children: ReactNode }) {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [landTick, setLandTick] = useState(0);
  const target = useRef<Measure | null>(null);
  const nextId = useRef(1);

  const registerCartTarget = useCallback((m: Measure | null) => {
    target.current = m;
  }, []);

  const fly = useCallback(async (from: Rect | null, uri?: string | null, opts?: FlyOptions) => {
    const custom = opts?.to !== undefined;
    const to = custom ? opts?.to ?? null : target.current ? await target.current() : null;
    const land = () => {
      if (custom) opts?.onLand?.();
      else setLandTick((t) => t + 1);
    };
    if (!from || !to) {
      land();
      return;
    }
    const f: Flight = {
      id: nextId.current++,
      from,
      to,
      uri,
      x: new Animated.Value(0),
      y: new Animated.Value(0),
    };
    setFlights((list) => [...list.slice(-(MAX_FLIGHTS - 1)), f]);
    Animated.parallel([
      Animated.timing(f.x, { toValue: 1, duration: 720, useNativeDriver: true }),
      Animated.sequence([
        Animated.timing(f.y, { toValue: 1, duration: 220, easing: ease.settle, useNativeDriver: true }),
        Animated.timing(f.y, { toValue: 2, duration: 500, easing: ease.fall, useNativeDriver: true }),
      ]),
    ]).start(() => {
      setFlights((list) => list.filter((it) => it.id !== f.id));
      land();
    });
  }, []);

  const value = useMemo(() => ({ fly, registerCartTarget, landTick }), [fly, registerCartTarget, landTick]);

  return (
    <CartFlyContext.Provider value={value}>
      <View style={styles.wrap}>
        {children}
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          {flights.map((f) => {
            const sx = f.from.x + f.from.width / 2 - SIZE / 2;
            const sy = f.from.y + f.from.height / 2 - SIZE / 2;
            const dx = f.to.x + f.to.width / 2 - SIZE / 2 - sx;
            const dy = f.to.y + f.to.height / 2 - SIZE / 2 - sy;
            return (
              <Animated.View
                key={f.id}
                style={[
                  styles.flyer,
                  {
                    left: sx,
                    top: sy,
                    opacity: f.x.interpolate({ inputRange: [0, 0.92, 1], outputRange: [1, 1, 0] }),
                    transform: [
                      { translateX: f.x.interpolate({ inputRange: [0, 1], outputRange: [0, dx] }) },
                      { translateY: f.y.interpolate({ inputRange: [0, 1, 2], outputRange: [0, -70, dy] }) },
                      { scale: f.x.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.9, 1.1, 0.35] }) },
                    ],
                  },
                ]}
              >
                {f.uri ? (
                  <Image source={{ uri: f.uri }} style={styles.img} />
                ) : (
                  <View style={styles.dot} />
                )}
              </Animated.View>
            );
          })}
        </View>
      </View>
    </CartFlyContext.Provider>
  );
}

export function useCartFly() {
  const ctx = useContext(CartFlyContext);
  if (!ctx) throw new Error('useCartFly must be used within CartFlyProvider');
  return ctx;
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  flyer: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: colors.surface,
    borderWidth: 3,
    borderColor: colors.surface,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lifted,
  },
  img: { width: '100%', height: '100%', borderRadius: SIZE / 2 },
  dot: { width: SIZE * 0.6, height: SIZE * 0.6, borderRadius: SIZE * 0.3, backgroundColor: brand.butter },
});
