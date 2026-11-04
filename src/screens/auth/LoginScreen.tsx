import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { AuthSplitShell } from '../../components/auth/AuthSplitShell';
import { AuthTextField } from '../../components/auth/AuthTextField';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { PressableScale } from '../../components/motion/PressableScale';
import { useAuth } from '../../context/AuthContext';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';
import { brand, colors, fonts, radii, spacing } from '../../theme';
import { haptic } from '../../utils/haptics';
import { parseApiError } from '../../utils/parseApiError';

const PROMO_URI = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=900&q=80';

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
      haptic.error();
      Alert.alert('Error', 'Please enter your email and password.');
      return;
    }
    setBusy(true);
    try {
      await signIn(email, password);
      haptic.success();
    } catch (error: unknown) {
      haptic.error();
      const msg = parseApiError(error, {
        fallback: 'Login failed. Please try again.',
        unauthorizedFallback: 'Incorrect email/phone or password. Please try again.',
      });
      Alert.alert('Login Error', msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthSplitShell
      title="Welcome back"
      subtitle="Log in and grab your fresh groceries in minutes."
      belowCard={
        <>
          <View style={styles.footerRow}>
            <Text style={styles.footerMuted}>New to Grabit? </Text>
            <Pressable onPress={() => navigation.navigate('Register')} hitSlop={8}>
              <Text style={styles.footerLink}>Create an account</Text>
            </Pressable>
          </View>
          <ImageBackground source={{ uri: PROMO_URI }} style={styles.promo} imageStyle={styles.promoImg}>
            <View style={styles.promoTint}>
              <View style={styles.promoDot} />
              <Text style={styles.promoTxt}>Market-fresh quality delivered to your doorstep in minutes.</Text>
            </View>
          </ImageBackground>
          <Text style={styles.legal}>© Grabit · Lagos, Nigeria</Text>
        </>
      }
    >
      <AuthTextField
        label="Email or phone number"
        icon="at"
        placeholder="e.g. name@domain.com"
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
      <Pressable style={styles.forgotWrap} onPress={() => navigation.navigate('ForgotPassword')} hitSlop={8}>
        <Text style={styles.forgot}>Forgot password?</Text>
      </Pressable>
      <PrimaryButton label={busy ? 'Logging in…' : 'Log in'} icon="arrow-forward" loading={busy} disabled={busy} onPress={onLogin} />
      <View style={styles.orRow}>
        <View style={styles.orLine} />
        <Text style={styles.or}>or continue with</Text>
        <View style={styles.orLine} />
      </View>
      <View style={styles.socialRow}>
        <PressableScale
          containerStyle={{ flex: 1 }}
          style={styles.socialBtn}
          onPress={() => Alert.alert('Google', 'Social sign-in is not connected in this demo.')}
          accessibilityRole="button"
          accessibilityLabel="Continue with Google"
        >
          <Ionicons name="logo-google" size={18} color={colors.text} />
          <Text style={styles.socialLab}>Google</Text>
        </PressableScale>
        <PressableScale
          containerStyle={{ flex: 1 }}
          style={styles.socialBtn}
          onPress={() => Alert.alert('Apple', 'Social sign-in is not connected in this demo.')}
          accessibilityRole="button"
          accessibilityLabel="Continue with Apple"
        >
          <Ionicons name="logo-apple" size={20} color={colors.text} />
          <Text style={styles.socialLab}>Apple</Text>
        </PressableScale>
      </View>
    </AuthSplitShell>
  );
}

const styles = StyleSheet.create({
  forgotWrap: { alignSelf: 'flex-end', marginBottom: spacing.lg, marginTop: -spacing.xs },
  forgot: { fontFamily: fonts.bold, color: colors.primary, fontSize: 14 },
  orRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xl, marginBottom: spacing.md, gap: spacing.md },
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
  footerRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', marginBottom: spacing.lg },
  footerMuted: { fontFamily: fonts.regular, fontSize: 15, color: colors.textSecondary },
  footerLink: { fontFamily: fonts.bold, fontSize: 15, color: colors.primary },
  promo: { height: 132, borderRadius: radii.xl, overflow: 'hidden', marginBottom: spacing.lg },
  promoImg: { borderRadius: radii.xl },
  promoTint: {
    flex: 1,
    backgroundColor: 'rgba(10,46,31,0.55)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.xl,
  },
  promoDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: brand.tomato },
  promoTxt: { flex: 1, fontFamily: fonts.display, color: brand.oat, fontSize: 17, lineHeight: 21 },
  legal: { fontFamily: fonts.regular, textAlign: 'center', color: colors.textMuted, fontSize: 12 },
});
