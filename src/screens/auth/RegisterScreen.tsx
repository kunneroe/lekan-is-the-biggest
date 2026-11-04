import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AuthSplitShell } from '../../components/auth/AuthSplitShell';
import { AuthTextField } from '../../components/auth/AuthTextField';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { PressableScale } from '../../components/motion/PressableScale';
import { useAuth } from '../../context/AuthContext';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';
import { colors, fonts, radii, spacing } from '../../theme';
import { haptic } from '../../utils/haptics';
import { describeAuthError } from '../../utils/authErrors';

import { appAlert } from '../../context/DialogContext';
type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  const onCreate = async () => {
    if (busy) return;
    if (!name || !email || !password || !phone) {
      haptic.error();
      appAlert('Error', 'Please fill out all fields.');
      return;
    }
    if (password !== confirm) {
      haptic.error();
      appAlert('Passwords', 'Passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      await register({ fullName: name, email, password, phone });
      haptic.success();
    } catch (error: unknown) {
      haptic.error();
      const info = describeAuthError(error, 'register');
      if (info.kind === 'exists') {
        appAlert(info.title, info.message, [
          { text: 'Not now', style: 'cancel' },
          { text: 'Log in', onPress: () => navigation.navigate('Login') },
        ]);
      } else {
        appAlert(info.title, info.message);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthSplitShell
      title="Create your account"
      subtitle="Join Grabit for fresh groceries delivered to your doorstep."
      onBack={() => navigation.goBack()}
      belowCard={
        <>
          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.or}>or continue with</Text>
            <View style={styles.orLine} />
          </View>
          <View style={styles.socialRow}>
            <PressableScale
              containerStyle={{ flex: 1 }}
              style={styles.socialBtn}
              onPress={() => appAlert('Google', 'Social sign-in is not connected in this demo.')}
              accessibilityRole="button"
              accessibilityLabel="Continue with Google"
            >
              <Ionicons name="logo-google" size={18} color={colors.text} />
              <Text style={styles.socialLab}>Google</Text>
            </PressableScale>
            <PressableScale
              containerStyle={{ flex: 1 }}
              style={styles.socialBtn}
              onPress={() => appAlert('Facebook', 'Social sign-in is not connected in this demo.')}
              accessibilityRole="button"
              accessibilityLabel="Continue with Facebook"
            >
              <Ionicons name="logo-facebook" size={20} color="#1877F2" />
              <Text style={styles.socialLab}>Facebook</Text>
            </PressableScale>
          </View>
        </>
      }
    >
      <AuthTextField
        label="Full name"
        icon="person"
        placeholder="John Doe"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />
      <AuthTextField
        label="Phone number"
        icon="call"
        placeholder="+234 800 000 0000"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <AuthTextField
        label="Email address"
        icon="mail"
        placeholder="example@mail.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <AuthTextField
        label="Password"
        icon="lock-closed"
        placeholder="••••••••"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        onToggleSecure={() => setShowPass((v) => !v)}
        secureVisible={showPass}
      />
      <AuthTextField
        label="Confirm password"
        icon="shield-checkmark"
        placeholder="••••••••"
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
        onToggleSecure={() => setShowConfirm((v) => !v)}
        secureVisible={showConfirm}
      />
      <PrimaryButton
        label={busy ? 'Creating account…' : 'Create account'}
        icon="arrow-forward"
        loading={busy}
        disabled={busy}
        onPress={onCreate}
      />
      <View style={styles.footerRow}>
        <Text style={styles.footerMuted}>Already have an account? </Text>
        <Pressable onPress={() => navigation.navigate('Login')} hitSlop={8}>
          <Text style={styles.footerLink}>Log in</Text>
        </Pressable>
      </View>
      <Text style={styles.legal}>
        By signing up, you agree to our{' '}
        <Text style={styles.legalBold} onPress={() => appAlert('Terms', 'Demo terms placeholder.')}>
          Terms
        </Text>{' '}
        and{' '}
        <Text style={styles.legalBold} onPress={() => appAlert('Privacy', 'Demo privacy placeholder.')}>
          Privacy Policy
        </Text>
        .
      </Text>
    </AuthSplitShell>
  );
}

const styles = StyleSheet.create({
  footerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl, flexWrap: 'wrap' },
  footerMuted: { fontFamily: fonts.regular, fontSize: 15, color: colors.textSecondary },
  footerLink: { fontFamily: fonts.bold, fontSize: 15, color: colors.primary },
  legal: {
    fontFamily: fonts.regular,
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 12,
    marginTop: spacing.lg,
    lineHeight: 17,
  },
  legalBold: { fontFamily: fonts.bold, color: colors.text },
  orRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md, gap: spacing.md },
  orLine: { flex: 1, height: 1, backgroundColor: colors.border },
  or: { fontFamily: fonts.medium, color: colors.textMuted, fontSize: 12 },
  socialRow: { flexDirection: 'row', gap: spacing.md },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md + 2,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  socialLab: { fontFamily: fonts.bold, fontSize: 15, color: colors.text },
});
