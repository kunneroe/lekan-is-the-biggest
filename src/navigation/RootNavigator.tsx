import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useOnboardingGate } from '../context/OnboardingGateContext';
import { CheckoutScreen } from '../screens/CheckoutScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { OrderSuccessScreen } from '../screens/OrderSuccessScreen';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { StoreScreen } from '../screens/StoreScreen';
import { TrackOrderScreen } from '../screens/TrackOrderScreen';
import { FavoritesScreen } from '../screens/profile/FavoritesScreen';
import { HelpSupportScreen } from '../screens/profile/HelpSupportScreen';
import { OrderHistoryScreen } from '../screens/profile/OrderHistoryScreen';
import { PaymentMethodsScreen } from '../screens/profile/PaymentMethodsScreen';
import { SavedAddressesScreen } from '../screens/profile/SavedAddressesScreen';
import { SettingsScreen } from '../screens/profile/SettingsScreen';
import { colors } from '../theme';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import type { RootStackParamList } from './navigationRef';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { isSignedIn, isAuthReady } = useAuth();
  const { hasSeenOnboarding, isOnboardingGateReady } = useOnboardingGate();

  if (!isAuthReady || !isOnboardingGateReady) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!hasSeenOnboarding) {
    return <OnboardingScreen />;
  }

  if (!isSignedIn) {
    return <AuthNavigator />;
  }

  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: 'Notifications' }}
      />
      <Stack.Screen
        name="Store"
        component={StoreScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: 'Product' }}
      />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ title: 'Checkout' }}
      />
      <Stack.Screen
        name="OrderSuccess"
        component={OrderSuccessScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TrackOrder"
        component={TrackOrderScreen}
        options={{ title: 'Track order' }}
      />
      <Stack.Screen
        name="SavedAddresses"
        component={SavedAddressesScreen}
        options={{ title: 'Saved addresses' }}
      />
      <Stack.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{ title: 'My favorites' }}
      />
      <Stack.Screen
        name="PaymentMethods"
        component={PaymentMethodsScreen}
        options={{ title: 'Payment methods' }}
      />
      <Stack.Screen
        name="OrderHistory"
        component={OrderHistoryScreen}
        options={{ title: 'Order history' }}
      />
      <Stack.Screen
        name="HelpSupport"
        component={HelpSupportScreen}
        options={{ title: 'Help & support' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
