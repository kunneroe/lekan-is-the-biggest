import {
  createNavigationContainerRef,
  type NavigatorScreenParams,
} from '@react-navigation/native';
import type { MainTabParamList } from './MainTabNavigator';

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  Notifications: undefined;
  Store: { storeId: string; categoryId?: string };
  ProductDetail: { storeId: string; productId: string };
  Checkout: { storeId: string };
  OrderSuccess: { orderId: string };
  TrackOrder: { orderId: string };
  SavedAddresses: undefined;
  Favorites: undefined;
  PaymentMethods: undefined;
  OrderHistory: undefined;
  HelpSupport: undefined;
  Settings: undefined;
};

export const navigationRef =
  createNavigationContainerRef<RootStackParamList>();

export function navigateRoot(
  name: keyof RootStackParamList,
  params?: RootStackParamList[keyof RootStackParamList],
) {
  if (navigationRef.isReady()) {
    (navigationRef as { navigate: (n: string, p?: object) => void }).navigate(
      name as string,
      params as object | undefined,
    );
  }
}
