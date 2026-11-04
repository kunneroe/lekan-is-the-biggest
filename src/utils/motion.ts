import { useEffect, useState } from 'react';
import { AccessibilityInfo, Easing } from 'react-native';

/** Grabit easing curves — DROP → GRAB → SETTLE. */
export const ease = {
  /** things falling with weight */
  fall: Easing.bezier(0.55, 0, 1, 0.45),
  /** a catch with a small overshoot */
  snap: Easing.bezier(0.34, 1.56, 0.64, 1),
  /** calm ease-out for entrances */
  settle: Easing.bezier(0.22, 1, 0.36, 1),
  /** loader spin: reads as "chasing", not a flat spin */
  spin: Easing.bezier(0.6, 0, 0.4, 1),
};

/** True when the OS "reduce motion" setting is on. */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => {
        if (alive) setReduced(v);
      })
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);
  return reduced;
}
