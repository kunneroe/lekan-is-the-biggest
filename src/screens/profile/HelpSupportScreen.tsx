import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GrabitMark } from '../../components/brand/GrabitMark';
import { FadeInUp } from '../../components/motion/FadeInUp';
import { PressableScale } from '../../components/motion/PressableScale';
import { appAlert } from '../../context/DialogContext';
import { brand, colors, fonts, radii, shadows, spacing } from '../../theme';
import { haptic } from '../../utils/haptics';

const CHANNELS: { key: string; icon: keyof typeof Ionicons.glyphMap; title: string; sub: string; onPress: () => void }[] = [
  { key: 'chat', icon: 'chatbubbles', title: 'Start a chat', sub: 'Fastest way to reach us', onPress: () => appAlert('Chat', 'Live chat would open here.') },
  { key: 'mail', icon: 'mail', title: 'Email support', sub: 'support@grabit.demo', onPress: () => appAlert('Email', 'support@grabit.demo') },
  { key: 'faq', icon: 'book', title: 'All FAQs', sub: 'Orders, payments and delivery', onPress: () => appAlert('FAQ', 'Frequently asked questions (mock).') },
];

const FAQ = [
  { q: 'Where is my order?', a: 'Open the Orders tab and tap Track order. You will see each step and your rider moving on the map.' },
  { q: 'Can I order from two supermarkets at once?', a: 'Not yet. A cart holds items from one supermarket. Finish or clear that cart, then start a new one at another store.' },
  { q: 'How do I change my delivery address?', a: 'Tap the address at the top of Home, or go to Profile › Saved addresses, and pick the one you want.' },
  { q: 'Which payment methods can I use?', a: 'Card, bank transfer, or pay on delivery. Choose at checkout.' },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const rot = useRef(new Animated.Value(0)).current;
  const toggle = () => {
    haptic.select();
    Animated.spring(rot, { toValue: open ? 0 : 1, friction: 7, tension: 120, useNativeDriver: true }).start();
    setOpen((o) => !o);
  };
  return (
    <Pressable onPress={toggle} style={styles.faq} accessibilityRole="button" accessibilityState={{ expanded: open }}>
      <View style={styles.faqHead}>
        <Text style={styles.faqQ}>{q}</Text>
        <Animated.View style={{ transform: [{ rotate: rot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }) }] }}>
          <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
        </Animated.View>
      </View>
      {open ? <Text style={styles.faqA}>{a}</Text> : null}
    </Pressable>
  );
}

export function HelpSupportScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ padding: spacing.xl, paddingBottom: insets.bottom + spacing.xxl, gap: spacing.lg }}
      showsVerticalScrollIndicator={false}
    >
      <FadeInUp>
        <View style={styles.hero}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle} maxFontSizeMultiplier={1.25}>
              How can we help?
            </Text>
            <Text style={styles.heroSub}>Orders, refunds or riders: our Lagos team is here 8am–10pm WAT (mock).</Text>
          </View>
          <GrabitMark size={64} variant="reverse" />
        </View>
      </FadeInUp>

      <View style={{ gap: spacing.sm }}>
        {CHANNELS.map((c, i) => (
          <FadeInUp key={c.key} index={i + 1}>
            <PressableScale onPress={c.onPress} hapticFeedback style={styles.row} accessibilityRole="button">
              <View style={styles.rowIcon}>
                <Ionicons name={c.icon} size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{c.title}</Text>
                <Text style={styles.rowSub}>{c.sub}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </PressableScale>
          </FadeInUp>
        ))}
      </View>

      <FadeInUp index={4}>
        <Text style={styles.sec}>Common questions</Text>
        <View style={styles.faqCard}>
          {FAQ.map((f, i) => (
            <View key={f.q} style={i > 0 ? styles.divider : undefined}>
              <FaqItem q={f.q} a={f.a} />
            </View>
          ))}
        </View>
      </FadeInUp>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: brand.green,
    borderRadius: radii.xl,
    padding: spacing.xl,
  },
  heroTitle: { fontFamily: fonts.display, fontSize: 24, color: '#FFFFFF' },
  heroSub: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, color: brand.cream, marginTop: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    ...shadows.soft,
  },
  rowIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: { fontFamily: fonts.bold, fontSize: 15, color: colors.text },
  rowSub: { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, marginTop: 1 },
  sec: { fontFamily: fonts.display, fontSize: 19, color: colors.text, marginBottom: spacing.sm },
  faqCard: { backgroundColor: colors.surface, borderRadius: radii.xl, paddingHorizontal: spacing.lg, ...shadows.soft },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  faq: { paddingVertical: spacing.lg },
  faqHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  faqQ: { flex: 1, fontFamily: fonts.bold, fontSize: 15, color: colors.text },
  faqA: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 21, color: colors.textSecondary, marginTop: spacing.sm },
});
