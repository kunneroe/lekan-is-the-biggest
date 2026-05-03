import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { DemoProvider } from './src/context/DemoContext';
import { OnboardingGateProvider } from './src/context/OnboardingGateContext';
import { ToastProvider } from './src/context/ToastContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { navigationRef } from './src/navigation/navigationRef';

export default function App() {
  return (
    <SafeAreaProvider>
      <DemoProvider>
        <OnboardingGateProvider>
          <AuthProvider>
            <NavigationContainer ref={navigationRef}>
              <ToastProvider>
                <RootNavigator />
                <StatusBar style="dark" />
              </ToastProvider>
            </NavigationContainer>
          </AuthProvider>
        </OnboardingGateProvider>
      </DemoProvider>
    </SafeAreaProvider>
  );
}
