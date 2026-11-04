import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { brand, colors, fonts, radii, spacing } from '../../theme';
import type { AuthErrorKind } from '../../utils/authErrors';

type Props = {
  kind: AuthErrorKind;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

/** Inline notice inside a form: slides in under the fields instead of a pop-up. */
export function FormAlert({ kind, title, message, actionLabel, onAction }: Props) {
  const v = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    v.setValue(0);
    Animated.spring(v, { toValue: 1, friction: 8, tension: 120, useNativeDriver: true }).start();
  }, [title, message, v]);

  const isNetwork = kind === 'network';
  const icon: keyof typeof Ionicons.glyphMap =
    kind === 'network' ? 'cloud-offline' : kind === 'tooMany' ? 'time' : kind === 'exists' ? 'person-circle' : 'alert-circle';

  return (
    <Animated.View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[
        styles.box,
        isNetwork ? styles.boxInfo : styles.boxError,
        {
          opacity: v,
          transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] }) }],
        },
      ]}
    >
      <View style={[styles.icon, { backgroundColor: isNetwork ? brand.ink : colors.danger }]}>
        <Ionicons name={icon} size={16} color="#FFFFFF" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title} maxFontSizeMultiplier={1.3}>
          {title}
        </Text>
        <Text style={styles.message} maxFontSizeMultiplier={1.5}>
          {message}
        </Text>
        {actionLabel && onAction ? (
          <Pressable onPress={onAction} hitSlop={8} accessibilityRole="button" style={{ alignSelf: 'flex-start' }}>
            <Text style={styles.action}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  boxError: { backgroundColor: colors.redTint, borderColor: '#F7C2B3' },
  boxInfo: { backgroundColor: colors.butterTint, borderColor: '#F2DC9A' },
  icon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  title: { fontFamily: fonts.bold, fontSize: 15, color: colors.text },
  message: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: colors.text, marginTop: 2 },
  action: { fontFamily: fonts.bold, fontSize: 14, color: colors.primary, marginTop: spacing.sm },
});
