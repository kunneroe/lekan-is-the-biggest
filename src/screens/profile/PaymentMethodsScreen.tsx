import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GrabitMark } from '../../components/brand/GrabitMark';
import { FadeInUp } from '../../components/motion/FadeInUp';
import { PressableScale } from '../../components/motion/PressableScale';
import { appAlert } from '../../context/DialogContext';
import { brand, colors, fonts, radii, shadows, spacing } from '../../theme';

const METHODS = [
  { id: '1', label: 'Visa •••• 4242', sub: 'Expires 08/27', kind: 'card' as const },
  { id: '2', label: 'GTBank transfer', sub: 'Account ending 8891', kind: 'bank' as const },
];

export function PaymentMethodsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ padding: spacing.xl, paddingBottom: insets.bottom + spacing.xxl, gap: spacing.md }}
      showsVerticalScrollIndicator={false}
    >
      {METHODS.map((m, i) => (
        <FadeInUp key={m.id} index={i}>
          <PressableScale
            onPress={() => appAlert('Payment method', m.label)}
            hapticFeedback
            style={[styles.card, m.kind === 'bank' && styles.cardBank]}
            accessibilityRole="button"
            accessibilityLabel={`${m.label}, ${m.sub}`}
          >
            <GrabitMark
              size={150}
              variant="mono"
              color={m.kind === 'bank' ? 'rgba(23,38,30,0.08)' : 'rgba(255,201,77,0.12)'}
              style={styles.cardMark}
            />
            <View style={styles.cardTop}>
              <View style={[styles.chip, m.kind === 'bank' && { backgroundColor: brand.ink }]}>
                <Ionicons name={m.kind === 'bank' ? 'business' : 'card'} size={16} color={m.kind === 'bank' ? brand.butter : brand.ink} />
              </View>
              <Text style={[styles.kind, m.kind === 'bank' && { color: brand.ink }]}>{m.kind === 'bank' ? 'Bank transfer' : 'Debit card'}</Text>
            </View>
            <Text style={[styles.label, m.kind === 'bank' && { color: brand.ink }]}>{m.label}</Text>
            <Text style={[styles.sub, m.kind === 'bank' && { color: brand.ink }]}>{m.sub}</Text>
          </PressableScale>
        </FadeInUp>
      ))}
      <Pressable
        style={({ pressed }) => [styles.add, pressed && { opacity: 0.7 }]}
        onPress={() => appAlert('Add payment', 'Mock payment setup.')}
        accessibilityRole="button"
      >
        <Ionicons name="add-circle" size={22} color={colors.primary} />
        <Text style={styles.addTxt}>Add payment method</Text>
      </Pressable>
      <View style={styles.note}>
        <Ionicons name="lock-closed" size={14} color={colors.textSecondary} />
        <Text style={styles.noteTxt}>Card details are stored securely by our payment partner.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  card: {
    backgroundColor: brand.ink,
    borderRadius: radii.xl,
    padding: spacing.xl,
    minHeight: 168,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    ...shadows.card,
  },
  cardBank: { backgroundColor: brand.butter },
  cardMark: { position: 'absolute', right: -30, top: -26 },
  cardTop: { position: 'absolute', top: spacing.xl, left: spacing.xl, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  chip: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: brand.butter,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kind: { fontFamily: fonts.semibold, fontSize: 13, color: brand.cream },
  label: { fontFamily: fonts.display, fontSize: 22, color: brand.cream },
  sub: { fontFamily: fonts.medium, fontSize: 13, color: brand.cream, opacity: 0.85, marginTop: 2 },
  add: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.tintStrong,
  },
  addTxt: { fontFamily: fonts.bold, fontSize: 15, color: colors.primary },
  note: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  noteTxt: { fontFamily: fonts.regular, fontSize: 12, color: colors.textSecondary },
});
