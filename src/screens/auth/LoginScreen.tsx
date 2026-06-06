import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
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

const ACCENT_LINK = '#A0522D';

const PROMO_URI =
  'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=900&q=80';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [busy, setBusy] = useState(false);

  const onLogin = async () => {
    if (busy) return;
    if (!email || !password) {
      Alert.alert('Error', 'Please enter your email and password.');
      return;
    }
    setBusy(true);
    try {
      await signIn(email, password);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Login failed. Please try again.';
      Alert.alert('Login Error', msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthSplitShell
      title="Welcome Back"
      subtitle="Log in to continue your fresh market journey"
      belowCard={
        <>
          <View style={styles.footerRow}>
            <Text style={styles.footerMuted}>Don&apos;t have an account? </Text>
            <Pressable onPress={() => navigation.navigate('Register')}>
              <Text style={styles.footerLink}>Sign Up</Text>
            </Pressable>
          </View>
          <ImageBackground
            source={{ uri: PROMO_URI }}
            style={styles.promo}
            imageStyle={styles.promoImg}
          >
            <View style={styles.promoTint}>
              <Text style={styles.promoTxt}>
                Market-fresh quality delivered to your doorstep in minutes.
              </Text>
            </View>
          </ImageBackground>
          <Text style={styles.legal}>
            © 2024 Goshop Technologies Ltd. Lagos, Nigeria.
          </Text>
        </>
      }
    >
      <AuthTextField
        label="Email or Phone Number"
        icon="at-outline"
        placeholder="e.g. name@domain.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        variant="mintBorder"
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
        variant="mintBorder"
      />
      <Pressable
        style={styles.forgotWrap}
        onPress={() => navigation.navigate('ForgotPassword')}
      >
        <Text style={styles.forgot}>Forgot Password?</Text>
      </Pressable>
      <Pressable
        style={[styles.primary, busy && styles.primaryDisabled]}
        onPress={onLogin}
        disabled={busy}
      >
        {busy ? (
          <ActivityIndicator color={colors.surface} />
        ) : (
          <>
            <Text style={styles.primaryTxt}>Login</Text>
            <Ionicons name="arrow-forward" size={20} color={colors.surface} />
          </>
        )}
      </Pressable>
      <View style={styles.orRow}>
        <View style={styles.orLine} />
        <Text style={styles.or}>OR</Text>
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
            Alert.alert('Apple', 'Social sign-in is not connected in this demo.')
          }
        >
          <Text style={styles.socialIOS}>iOS</Text>
        </Pressable>
      </View>
    </AuthSplitShell>
  );
}

const styles = StyleSheet.create({
  forgotWrap: { alignSelf: 'flex-end', marginBottom: spacing.lg },
  forgot: { color: ACCENT_LINK, fontWeight: '700', fontSize: 14 },
  primary: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  primaryDisabled: { opacity: 0.85 },
  primaryTxt: { color: colors.surface, fontWeight: '800', fontSize: 16 },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  orLine: { flex: 1, height: 1, backgroundColor: colors.border },
  or: { color: colors.textMuted, fontWeight: '600', fontSize: 12 },
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
  socialIOS: {
    fontWeight: '800',
    fontSize: 16,
    color: colors.text,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: spacing.lg,
  },
  footerMuted: { color: colors.textSecondary },
  footerLink: { color: colors.primary, fontWeight: '800' },
  promo: {
    height: 140,
    borderRadius: radii.lg,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  promoImg: { borderRadius: radii.lg },
  promoTint: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  promoTxt: {
    color: colors.surface,
    fontWeight: '700',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  legal: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 11,
  },
});
