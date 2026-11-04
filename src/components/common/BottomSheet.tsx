import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radii, spacing } from '../../theme';
import { ease } from '../../utils/motion';

type Props = {
  visible: boolean;
  onClose: () => void;
  onShow?: () => void;
  title?: string;
  children: ReactNode;
};

/** Grabit bottom sheet: the backdrop fades, the sheet springs up with a grab handle. */
export function BottomSheet({ visible, onClose, onShow, title, children }: Props) {
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(visible);
  const v = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      v.setValue(0);
      Animated.spring(v, { toValue: 1, friction: 9, tension: 70, useNativeDriver: true }).start();
    } else if (mounted) {
      Animated.timing(v, { toValue: 0, duration: 200, easing: ease.settle, useNativeDriver: true }).start(() =>
        setMounted(false),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!mounted) return null;

  return (
    <Modal visible transparent animationType="none" onShow={onShow} onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.wrap}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: v }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
        </Animated.View>
        <Animated.View
          style={[
            styles.sheet,
            {
              paddingBottom: insets.bottom + spacing.xl,
              transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [500, 0] }) }],
            },
          ]}
        >
          <View style={styles.handle} />
          {title ? <Text maxFontSizeMultiplier={1.25} style={styles.title}>{title}</Text> : null}
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { backgroundColor: colors.scrim },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    maxHeight: '88%',
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 22,
    letterSpacing: -0.4,
    color: colors.text,
    marginBottom: spacing.lg,
  },
});
