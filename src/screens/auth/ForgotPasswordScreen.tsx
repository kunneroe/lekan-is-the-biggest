import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthTextField } from '../../components/auth/AuthTextField';
import { useDemo } from '../../context/DemoContext';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { user } = useDemo();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

  const onSend = () => {
    if (busy) return;
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      Alert.alert(
        'Check your inbox',
        'If an account exists, a reset code would be sent (demo — no email sent).',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }],
      );
    }, 800);
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable
          style={styles.headerSide}
          onPress={() => navigation.goBack()}
          hitSlop={12}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Goshop</Text>
        <View style={styles.headerSide}>
          <Image source={{ uri: user.avatar }} style={styles.headerAvatar} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.body,
          { paddingBottom: insets.bottom + spacing.xxl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconHero}>
          <View style={styles.iconBg}>
            <Ionicons name="lock-closed-outline" size={38} color={colors.primary} />
          </View>
        </View>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.sub}>
          Enter your email or phone number to receive a reset code.
        </Text>
        <AuthTextField
          label="Email or Phone Number"
          icon="mail-outline"
          placeholder="e.g. name@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          variant="outlined"
        />
        <Pressable
          style={[styles.primary, busy && styles.primaryDisabled]}
          onPress={onSend}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color={colors.surface} />
          ) : (
            <>
              <Text style={styles.primaryTxt}>Send Reset Code</Text>
              <Ionicons name="paper-plane-outline" size={20} color={colors.surface} />
            </>
          )}
        </Pressable>
        <Pressable
          style={styles.linkBack}
          onPress={() => navigation.navigate('Login')}
        >
          <Ionicons name="arrow-back" size={18} color={colors.primary} />
          <Text style={styles.linkBackTxt}>Back to Login</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  headerSide: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.border,
  },
  body: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  iconHero: { alignItems: 'center', marginBottom: spacing.lg },
  iconBg: {
    width: 100,
    height: 100,
    borderRadius: radii.lg,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  sub: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
    paddingHorizontal: spacing.md,
  },
  primary: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  primaryDisabled: { opacity: 0.85 },
  primaryTxt: { color: colors.surface, fontWeight: '800', fontSize: 16 },
  linkBack: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xxl,
  },
  linkBackTxt: { color: colors.primary, fontWeight: '700', fontSize: 15 },
});
