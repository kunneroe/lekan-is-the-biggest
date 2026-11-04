import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { brand, colors, fonts, radii, shadows, spacing } from '../../theme';
import { GrabitMark } from '../brand/GrabitMark';
import { GrabitLogo } from '../brand/GrabitWordmark';
import { FadeInUp } from '../motion/FadeInUp';

type Props = {
  title: string;
  subtitle: string;
  /** Form + actions that sit inside the white card */
  children: ReactNode;
  /** Sign-up promo / social row — rendered below the card */
  belowCard?: ReactNode;
  /** shows a back button next to the logo */
  onBack?: () => void;
};

/**
 * Basil top panel with the Grabit logo and headline, and a white form card that
 * overlaps it. Content below the card sits on Oat.
 */
export function AuthSplitShell({ title, subtitle, children, belowCard, onBack }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.xxl }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.panel, { paddingTop: insets.top + spacing.xl }]}>
          <GrabitMark size={240} variant="mono" color="rgba(185,232,58,0.12)" style={styles.watermark} />
          <FadeInUp style={styles.logoRow}>
            {onBack ? (
              <Pressable
                onPress={onBack}
                style={styles.back}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Back"
              >
                <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
              </Pressable>
            ) : null}
            <GrabitLogo size={26} tone="brand" />
          </FadeInUp>
          <FadeInUp index={1}>
            <Text maxFontSizeMultiplier={1.25} style={styles.screenTitle}>{title}</Text>
            <Text style={styles.screenSub}>{subtitle}</Text>
          </FadeInUp>
        </View>

        <FadeInUp index={2} style={styles.cardWrap}>
          <View style={styles.card}>{children}</View>
        </FadeInUp>

        {belowCard ? (
          <FadeInUp index={3}>
            <View style={styles.below}>{belowCard}</View>
          </FadeInUp>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1, backgroundColor: colors.background },
  scrollContent: { flexGrow: 1 },
  panel: {
    backgroundColor: brand.green,
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxxl + spacing.xxl,
    borderBottomLeftRadius: radii.xxl,
    borderBottomRightRadius: radii.xxl,
    overflow: 'hidden',
  },
  watermark: { position: 'absolute', right: -60, top: -10 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenTitle: {
    fontFamily: fonts.display,
    fontSize: 32,
    lineHeight: 35,
    letterSpacing: -0.2,
    color: '#FFFFFF',
    marginTop: spacing.xxl,
    marginBottom: spacing.sm,
  },
  screenSub: { fontFamily: fonts.regular, fontSize: 15, color: brand.cream, opacity: 0.92, lineHeight: 22, maxWidth: 330 },
  cardWrap: { marginTop: -(spacing.xxxl + spacing.md), paddingHorizontal: spacing.lg },
  card: { backgroundColor: colors.surface, borderRadius: radii.xxl, padding: spacing.xl, ...shadows.lifted },
  below: { marginTop: spacing.xl, paddingHorizontal: spacing.xl },
});
