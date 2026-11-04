import {
  BricolageGrotesque_700Bold,
  BricolageGrotesque_800ExtraBold,
} from '@expo-google-fonts/bricolage-grotesque';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
  DMSans_800ExtraBold,
} from '@expo-google-fonts/dm-sans';
import { DefaultTheme, NavigationContainer, type Theme } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AnimatedSplash } from './src/components/brand/AnimatedSplash';
import { AddressProvider } from './src/context/AddressContext';
import { AuthProvider } from './src/context/AuthContext';
import { CartFlyProvider } from './src/context/CartFlyContext';
import { FavoriteProvider } from './src/context/FavoriteContext';
import { OnboardingGateProvider } from './src/context/OnboardingGateContext';
import { ToastProvider } from './src/context/ToastContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { navigationRef } from './src/navigation/navigationRef';
import { brand, colors, fonts } from './src/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

const navTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.background,
    text: colors.text,
    border: colors.border,
    notification: brand.tomato,
  },
  fonts: {
    regular: { fontFamily: fonts.regular, fontWeight: 'normal' },
    medium: { fontFamily: fonts.medium, fontWeight: 'normal' },
    bold: { fontFamily: fonts.bold, fontWeight: 'normal' },
    heavy: { fontFamily: fonts.display, fontWeight: 'normal' },
  },
};

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    BricolageGrotesque_700Bold,
    BricolageGrotesque_800ExtraBold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    DMSans_800ExtraBold,
  });
  const [splashDone, setSplashDone] = useState(false);
  const ready = fontsLoaded || !!fontError;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) {
    return <View style={{ flex: 1, backgroundColor: brand.basil }} />;
  }

  return (
    <SafeAreaProvider>
      <OnboardingGateProvider>
        <AuthProvider>
          <AddressProvider>
            <FavoriteProvider>
              <NavigationContainer ref={navigationRef} theme={navTheme}>
                <ToastProvider>
                  <CartFlyProvider>
                    <RootNavigator />
                    <StatusBar style="dark" />
                  </CartFlyProvider>
                </ToastProvider>
              </NavigationContainer>
            </FavoriteProvider>
          </AddressProvider>
        </AuthProvider>
      </OnboardingGateProvider>
      {!splashDone ? <AnimatedSplash onFinish={() => setSplashDone(true)} /> : null}
    </SafeAreaProvider>
  );
}
