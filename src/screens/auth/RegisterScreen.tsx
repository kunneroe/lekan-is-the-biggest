import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AuthSplitShell } from '../../components/auth/AuthSplitShell';
import { AuthTextField } from '../../components/auth/AuthTextField';
import { useAuth } from '../../context/AuthContext';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';
import { colors, radii, spacing } from '../../theme';
import { parseApiError } from '../../utils/parseApiError';

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
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Passwords', 'Passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      await register({ fullName: name, email, password, phone });
    } catch (error: unknown) {
      const msg = parseApiError(error, {
        fallback: 'Registration failed. Please try again.',
      });
      Alert.alert('Registration Error', msg);
    } finally {
      setBusy(false);
    }
  };

  const field = 'mintFlat' as const;

  return (
    <AuthSplitShell
      title="Create Account"
      subtitle="Join Goshop today for fresh groceries delivered to your doorstep."
      belowCard={
        <>
          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.or}>OR CONTINUE WITH</Text>
            <View style={styles.orLine} />
          </View>
          <View style={styles.socialRow}>
            <Pressable
              style={styles.socialBtn}
              onPress={() =>
                Alert.alert('Google', 'Social sign-in is not connected in this demo.')
              }
            >
              <Text style={styles.socialG}>G</Text>
              <Text style={styles.socialLab}>Google</Text>
            </Pressable>
            <Pressable
              style={styles.socialBtn}
              onPress={() =>
                Alert.alert('Facebook', 'Social sign-in is not connected in this demo.')
              }
            >
              <Ionicons name="logo-facebook" size={22} color="#1877F2" />
              <Text style={styles.socialLab}>Facebook</Text>
            </Pressable>
          </View>
        </>
      }
    >
      <AuthTextField
        label="Full Name"
        icon="person-outline"
        placeholder="John Doe"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        variant={field}
      />
      <AuthTextField
        label="Phone Number"
        icon="call-outline"
        placeholder="+234 800 000 0000"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        variant={field}
      />
      <AuthTextField
        label="Email Address"
        icon="mail-outline"
        placeholder="example@mail.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        variant={field}
      />
      <AuthTextField
        label="Password"
        icon="lock-closed-outline"
        placeholder="••••••••"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        onToggleSecure={() => setShowPass((v) => !v)}
        secureVisible={showPass}
        variant={field}
      />
      <AuthTextField
        label="Confirm Password"
        icon="sync-outline"
        placeholder="••••••••"
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
        onToggleSecure={() => setShowConfirm((v) => !v)}
        secureVisible={showConfirm}
        variant={field}
      />
      <Pressable
        style={[styles.primary, busy && styles.primaryDisabled]}
        onPress={onCreate}
        disabled={busy}
      >
        {busy ? (
          <ActivityIndicator color={colors.surface} />
        ) : (
          <Text style={styles.primaryTxt}>Create Account</Text>
        )}
      </Pressable>
      <View style={styles.footerRow}>
        <Text style={styles.footerMuted}>Already have an account? </Text>
        <Pressable onPress={() => navigation.navigate('Login')}>
          <Text style={styles.footerLink}>Login</Text>
        </Pressable>
      </View>
      <Text style={styles.legal}>
        By signing up, you agree to our{' '}
        <Text
          style={styles.legalBold}
          onPress={() => Alert.alert('Terms', 'Demo terms placeholder.')}
        >
          Terms
        </Text>{' '}
        and{' '}
        <Text
          style={styles.legalBold}
          onPress={() => Alert.alert('Privacy', 'Demo privacy placeholder.')}
        >
          Privacy Policy
        </Text>
        .
      </Text>
    </AuthSplitShell>
  );
}

const styles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  primaryDisabled: { opacity: 0.85 },
  primaryTxt: { color: colors.surface, fontWeight: '800', fontSize: 16 },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
    flexWrap: 'wrap',
  },
  footerMuted: { color: colors.textSecondary },
  footerLink: { color: colors.primary, fontWeight: '800' },
  legal: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 11,
    marginTop: spacing.lg,
    lineHeight: 16,
  },
  legalBold: { fontWeight: '800', color: colors.text },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  orLine: { flex: 1, height: 1, backgroundColor: colors.border },
  or: { color: colors.textMuted, fontWeight: '600', fontSize: 11 },
  socialRow: { flexDirection: 'row', gap: spacing.md },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  socialG: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  socialLab: { fontWeight: '600', color: colors.text },
});
