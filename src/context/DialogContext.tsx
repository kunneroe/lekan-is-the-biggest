import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Alert, Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { GrabitMark } from '../components/brand/GrabitMark';
import { navigateRoot } from '../navigation/navigationRef';
import { brand, colors, fonts, radii, shadows, spacing } from '../theme';
import { haptic } from '../utils/haptics';
import { useReducedMotion } from '../utils/motion';

export type DialogButton = {
  text?: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
};

type Tone = 'info' | 'success' | 'error' | 'confirm' | 'store';

type Request = { id: number; title: string; message?: string; buttons: DialogButton[]; tone: Tone };

let emitter: ((r: Omit<Request, 'id'>) => void) | null = null;

/** Messages that mean "your cart already has items from another supermarket". */
const ONE_STORE = /(one|single|same|another|different|other)\s+(supermarket|store)/i;

function inferTone(title: string, message: string | undefined, buttons: DialogButton[]): Tone {
  const text = `${title} ${message ?? ''}`;
  if (ONE_STORE.test(text)) return 'store';
  if (buttons.some((b) => b.style === 'destructive')) return 'confirm';
  if (/error|unable|failed|fail|couldn|can't|cannot|invalid|wrong|required|validation|not found/i.test(title)) return 'error';
  if (/success|added|updated|placed|saved|done|cleared|thanks/i.test(title)) return 'success';
  return 'info';
}

/**
 * Drop-in replacement for Alert.alert that shows a Grabit dialog instead of the
 * system pop-up. Same arguments: title, message, buttons.
 */
export function appAlert(title: string, message?: string, buttons?: DialogButton[]) {
  const list = buttons && buttons.length ? buttons : [{ text: 'OK' }];
  let tone = inferTone(title, message, list);
  let finalTitle = title;
  let finalButtons = list;
  if (tone === 'store') {
    finalTitle = 'One store at a time';
    if (!buttons || buttons.length === 0) {
      finalButtons = [
        { text: 'Keep shopping', style: 'cancel' },
        { text: 'Go to cart', onPress: () => navigateRoot('MainTabs', { screen: 'Cart' }) },
      ];
    }
  }
  if (emitter) {
    emitter({ title: finalTitle, message, buttons: finalButtons, tone });
  } else {
    // provider not mounted yet: fall back to the system alert so nothing is lost
    Alert.alert(title, message, buttons as never);
  }
}

const ART: Record<Tone, { icon: keyof typeof Ionicons.glyphMap; badge: string; badgeFg: string; disc: string }> = {
  info: { icon: 'information', badge: brand.ink, badgeFg: brand.cream, disc: colors.tint },
  success: { icon: 'checkmark', badge: brand.leaf, badgeFg: '#FFFFFF', disc: colors.leafTint },
  error: { icon: 'alert', badge: colors.danger, badgeFg: '#FFFFFF', disc: colors.redTint },
  confirm: { icon: 'help', badge: brand.butter, badgeFg: brand.ink, disc: colors.butterTint },
  store: { icon: 'storefront', badge: brand.ink, badgeFg: brand.butter, disc: colors.butterTint },
};

export function DialogProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<Request[]>([]);
  const [visible, setVisible] = useState(false);
  const nextId = useRef(1);
  const v = useRef(new Animated.Value(0)).current;
  const art = useRef(new Animated.Value(0)).current;
  const reduced = useReducedMotion();
  const current = queue[0];

  useEffect(() => {
    emitter = (r) => setQueue((q) => [...q, { ...r, id: nextId.current++ }]);
    return () => {
      emitter = null;
    };
  }, []);

  // Animate each dialog in as it reaches the front of the queue.
  useEffect(() => {
    if (!current) return;
    setVisible(true);
    v.setValue(0);
    art.setValue(0);
    Animated.spring(v, { toValue: 1, friction: 8, tension: 110, useNativeDriver: true }).start();
    if (!reduced) {
      Animated.timing(art, { toValue: 1, duration: 700, useNativeDriver: true }).start();
    }
    if (current.tone === 'error' || current.tone === 'store') haptic.error();
    else if (current.tone === 'success') haptic.success();
    else haptic.tap();
  }, [current?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const close = useCallback(
    (after?: () => void) => {
      Animated.timing(v, { toValue: 0, duration: 160, useNativeDriver: true }).start(() => {
        setVisible(false);
        setQueue((q) => q.slice(1));
        // run the button's action once the dialog is gone (it may navigate or open another)
        if (after) setTimeout(after, 0);
      });
    },
    [v],
  );

  const onBack = () => {
    if (!current) return;
    const cancel = current.buttons.find((b) => b.style === 'cancel');
    if (cancel) close(cancel.onPress);
    else if (current.buttons.length === 1) close(current.buttons[0].onPress);
  };

  const tone = current?.tone ?? 'info';
  const a = ART[tone];
  const buttons = current?.buttons ?? [];
  const stacked = buttons.length > 2 || buttons.some((b) => (b.text ?? '').length > 16);

  // the bag's reaction: wobble for problems, hop for good news, a curious tilt otherwise
  const bagMotion =
    tone === 'error' || tone === 'store'
      ? { transform: [{ rotate: art.interpolate({ inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1], outputRange: ['0deg', '-12deg', '10deg', '-6deg', '3deg', '0deg'] }) }] }
      : tone === 'success'
        ? { transform: [{ translateY: art.interpolate({ inputRange: [0, 0.35, 0.7, 1], outputRange: [0, -14, 0, 0] }) }] }
        : { transform: [{ rotate: art.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['0deg', '-8deg', '0deg'] }) }] };

  return (
    <>
      {children}
      <Modal visible={visible && !!current} transparent animationType="none" onRequestClose={onBack} statusBarTranslucent>
        <Animated.View style={[styles.backdrop, { opacity: v }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onBack} accessibilityLabel="Dismiss" />
          {current ? (
            <Animated.View
              accessibilityRole="alert"
              accessibilityViewIsModal
              style={[
                styles.card,
                {
                  opacity: v,
                  transform: [
                    { scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) },
                    { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) },
                  ],
                },
              ]}
            >
              <View style={[styles.disc, { backgroundColor: a.disc }]}>
                <Animated.View style={bagMotion}>
                  <GrabitMark size={64} />
                </Animated.View>
                <View style={[styles.badge, { backgroundColor: a.badge }]}>
                  <Ionicons name={a.icon} size={15} color={a.badgeFg} />
                </View>
              </View>
              <Text style={styles.title} maxFontSizeMultiplier={1.3}>
                {current.title}
              </Text>
              {current.message ? (
                <Text style={styles.message} maxFontSizeMultiplier={1.5}>
                  {current.message}
                </Text>
              ) : null}
              <View style={[styles.actions, stacked && styles.actionsStacked]}>
                {(stacked ? buttons : orderForRow(buttons)).map((b, i) => {
                  const kind = b.style === 'cancel' ? 'secondary' : b.style === 'destructive' ? 'danger' : 'primary';
                  return (
                    <Pressable
                      key={`${b.text}-${i}`}
                      onPress={() => close(b.onPress)}
                      accessibilityRole="button"
                      style={({ pressed }) => [
                        styles.btn,
                        !stacked && { flex: 1 },
                        kind === 'primary' && styles.btnPrimary,
                        kind === 'danger' && styles.btnDanger,
                        kind === 'secondary' && styles.btnSecondary,
                        pressed && { transform: [{ scale: 0.97 }], opacity: 0.92 },
                      ]}
                    >
                      <Text
                        style={[styles.btnTxt, kind === 'secondary' && { color: colors.text }]}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.8}
                        maxFontSizeMultiplier={1.3}
                      >
                        {b.text ?? 'OK'}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </Animated.View>
          ) : null}
        </Animated.View>
      </Modal>
    </>
  );
}

/** Side by side, the cancel button goes on the left and the main action on the right. */
function orderForRow(buttons: DialogButton[]) {
  const cancel = buttons.filter((b) => b.style === 'cancel');
  const rest = buttons.filter((b) => b.style !== 'cancel');
  return [...cancel, ...rest];
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.scrim,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: radii.xxl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    alignItems: 'center',
    ...shadows.lifted,
  },
  disc: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  badge: {
    position: 'absolute',
    right: 2,
    bottom: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.surface,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 22,
    lineHeight: 26,
    color: colors.text,
    textAlign: 'center',
  },
  message: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xl, alignSelf: 'stretch' },
  actionsStacked: { flexDirection: 'column-reverse' },
  btn: {
    minHeight: 50,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  btnPrimary: { backgroundColor: colors.primary },
  btnDanger: { backgroundColor: colors.danger },
  btnSecondary: { backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border },
  btnTxt: { fontFamily: fonts.bold, fontSize: 16, color: '#FFFFFF' },
});
