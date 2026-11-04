import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { brand, colors, fonts, radii, shadows, spacing } from '../theme';
import { ease } from '../utils/motion';

type ToastAction = { label: string; onPress: () => void };
type ToastOptions = { action?: ToastAction; tone?: 'default' | 'error' };
type ShowFn = (message: string, opts?: ToastOptions) => void;
let toastEmitter: ShowFn | null = null;

/** Call from anywhere without a hook. */
export function showToast(message: string, opts?: ToastOptions) {
  toastEmitter?.(message, opts);
}

/** Grabit snackbar: slides up above the tab bar, tomato dot, optional action. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<{ message: string; opts?: ToastOptions } | null>(null);
  const anim = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    Animated.timing(anim, { toValue: 0, duration: 180, easing: ease.settle, useNativeDriver: true }).start(
      ({ finished }) => {
        if (finished) setToast(null);
      },
    );
  }, [anim]);

  const show = useCallback<ShowFn>(
    (message, opts) => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      setToast({ message, opts });
      anim.setValue(0);
      Animated.spring(anim, { toValue: 1, friction: 7, tension: 90, useNativeDriver: true }).start();
      hideTimer.current = setTimeout(hide, opts?.action ? 3600 : 2800);
    },
    [anim, hide],
  );

  useEffect(() => {
    toastEmitter = show;
    return () => {
      toastEmitter = null;
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [show]);

  const isError = toast?.opts?.tone === 'error';

  return (
    <View style={styles.wrap}>
      {children}
      {toast ? (
        <Animated.View
          pointerEvents="box-none"
          style={[
            styles.overlay,
            {
              paddingBottom: insets.bottom + 84,
              opacity: anim,
              transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }],
            },
          ]}
        >
          <Pressable onPress={hide} style={styles.toast} accessibilityRole="alert">
            <View style={[styles.dot, isError && { backgroundColor: colors.danger }]} />
            <Text style={styles.toastTxt} numberOfLines={2}>
              {toast.message}
            </Text>
            {toast.opts?.action ? (
              <Pressable
                hitSlop={10}
                onPress={() => {
                  toast.opts?.action?.onPress();
                  hide();
                }}
              >
                <Text style={styles.action}>{toast.opts.action.label}</Text>
              </Pressable>
            ) : null}
          </Pressable>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: brand.forest,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.lg,
    ...shadows.lifted,
  },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: brand.tomato },
  toastTxt: { flex: 1, color: brand.oat, fontFamily: fonts.semibold, fontSize: 15 },
  action: { color: brand.lime, fontFamily: fonts.bold, fontSize: 15 },
});
