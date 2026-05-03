import { Ionicons } from '@expo/vector-icons';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, spacing } from '../../theme';

const METHODS = [
  { id: '1', label: 'Visa •••• 4242', sub: 'Expires 08/27' },
  { id: '2', label: 'GTBank transfer', sub: 'Account ending 8891' },
];

export function PaymentMethodsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      contentContainerStyle={{
        padding: spacing.xl,
        paddingBottom: insets.bottom + spacing.xxl,
      }}
    >
      {METHODS.map((m) => (
        <Pressable
          key={m.id}
          style={styles.card}
          onPress={() => Alert.alert('Payment method', m.label)}
        >
          <Ionicons name="card-outline" size={24} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.lab}>{m.label}</Text>
            <Text style={styles.sub}>{m.sub}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </Pressable>
      ))}
      <Pressable
        style={styles.add}
        onPress={() => Alert.alert('Add payment', 'Mock payment setup.')}
      >
        <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
        <Text style={styles.addTxt}>Add payment method</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  lab: { fontWeight: '700', color: colors.text },
  sub: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  add: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  addTxt: { color: colors.primary, fontWeight: '700' },
});
