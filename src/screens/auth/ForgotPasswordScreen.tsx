import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text } from 'react-native';
import { AuthSplitShell } from '../../components/auth/AuthSplitShell';
import { AuthTextField } from '../../components/auth/AuthTextField';
import { PrimaryButton } from '../../components/common/PrimaryButton';

import type { AuthStackParamList } from '../../navigation/AuthNavigator';
import { colors, fonts, spacing } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
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
    <AuthSplitShell
      title="Reset your password"
      subtitle="Enter your email or phone number and we'll send you a reset code."
      onBack={() => navigation.goBack()}
    >
      <AuthTextField
        label="Email or phone number"
        icon="mail"
        placeholder="e.g. name@example.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <PrimaryButton
        label={busy ? 'Sending…' : 'Send reset code'}
        icon="paper-plane"
        loading={busy}
        disabled={busy}
        onPress={onSend}
      />
      <Pressable style={styles.linkBack} onPress={() => navigation.navigate('Login')} hitSlop={8}>
        <Ionicons name="arrow-back" size={18} color={colors.primary} />
        <Text style={styles.linkBackTxt}>Back to log in</Text>
      </Pressable>
    </AuthSplitShell>
  );
}

const styles = StyleSheet.create({
  linkBack: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  linkBackTxt: { fontFamily: fonts.bold, color: colors.primary, fontSize: 15 },
});
