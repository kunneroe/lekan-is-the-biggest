import { Ionicons } from '@expo/vector-icons';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, spacing } from '../../theme';

export function HelpSupportScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      contentContainerStyle={{
        padding: spacing.xl,
        paddingBottom: insets.bottom + spacing.xxl,
      }}
    >
      <Text style={styles.p}>
        Need help with an order, refund, or rider? Our Lagos support team is
        available 8am–10pm WAT (mock).
      </Text>
      <Pressable
        style={styles.btn}
        onPress={() => Alert.alert('Chat', 'Live chat would open here.')}
      >
        <Ionicons name="chatbubbles-outline" size={22} color={colors.primary} />
        <Text style={styles.btnTxt}>Start chat</Text>
      </Pressable>
      <Pressable
        style={styles.btn}
        onPress={() => Alert.alert('Email', 'support@goshop.demo')}
      >
        <Ionicons name="mail-outline" size={22} color={colors.primary} />
        <Text style={styles.btnTxt}>Email support</Text>
      </Pressable>
      <Pressable
        style={styles.btn}
        onPress={() => Alert.alert('FAQ', 'Frequently asked questions (mock).')}
      >
        <Ionicons name="book-outline" size={22} color={colors.primary} />
        <Text style={styles.btnTxt}>FAQ</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  p: {
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  btn: {
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
  btnTxt: { fontWeight: '700', color: colors.text },
});
