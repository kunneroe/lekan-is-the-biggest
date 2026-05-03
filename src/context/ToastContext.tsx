import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, shadows, spacing } from '../theme';

type ShowFn = (message: string) => void;
let toastEmitter: ShowFn | null = null;

/** Call from anywhere (e.g. DemoContext) without a hook. */
export function showToast(message: string) {
  toastEmitter?.(message);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState<string | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => setMessage(null));
  }, [opacity]);

  const show = useCallback(
    (msg: string) => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      setMessage(msg);
      opacity.setValue(0);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      hideTimer.current = setTimeout(hide, 2800);
    },
    [hide, opacity],
  );

  useEffect(() => {
    toastEmitter = show;
    return () => {
      toastEmitter = null;
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [show]);

  return (
    <View style={styles.wrap}>
      {children}
      {message ? (
        <Animated.View
          pointerEvents="box-none"
          style={[
            styles.overlay,
            {
              paddingBottom: insets.bottom + spacing.lg,
              opacity,
            },
          ]}
        >
          <Pressable onPress={hide} style={styles.toast} accessibilityRole="alert">
            <Text style={styles.toastTxt}>{message}</Text>
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
    paddingHorizontal: spacing.xl,
  },
  toast: {
    backgroundColor: colors.primaryDark,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
    ...shadows.soft,
  },
  toastTxt: {
    color: colors.surface,
    fontWeight: '600',
    fontSize: 15,
    textAlign: 'center',
  },
});
