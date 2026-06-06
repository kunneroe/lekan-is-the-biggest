import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';

import { cartService } from '../services/cartService';

import { CartScreen } from '../screens/CartScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { OrdersScreen } from '../screens/OrdersScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { colors, spacing, typography } from '../theme';

export type MainTabParamList = {
  Home: undefined;
  Orders: undefined;
  Cart: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [cartBadge, setCartBadge] = useState(0);

  useEffect(() => {
    const fetchBadge = async () => {
      try {
        const res = await cartService.getCart();
        const items = res.cart?.items || res.items || [];
        const count = items.reduce((acc: number, item: any) => acc + item.quantity, 0);
        setCartBadge(count);
      } catch (e) {
        setCartBadge(0);
      }
    };
    
    fetchBadge();
    const unsubscribe = cartService.subscribe(fetchBadge);
    return unsubscribe;
  }, []);

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? String(options.tabBarLabel)
            : options.title ?? route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const iconName = (() => {
          if (route.name === 'Home') return isFocused ? 'home' : 'home-outline';
          if (route.name === 'Orders')
            return isFocused ? 'receipt' : 'receipt-outline';
          if (route.name === 'Cart')
            return isFocused ? 'cart' : 'cart-outline';
          return isFocused ? 'person' : 'person-outline';
        })();

        const badge = route.name === 'Cart' ? cartBadge : 0;

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : undefined}
            onPress={onPress}
            style={styles.tabPress}
          >
            <View style={[styles.tabInner, isFocused && styles.tabInnerActive]}>
              <View>
                <Ionicons
                  name={iconName as keyof typeof Ionicons.glyphMap}
                  size={22}
                  color={isFocused ? colors.primary : colors.textSecondary}
                />
                {badge > 0 ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {badge > 99 ? '99+' : badge}
                    </Text>
                  </View>
                ) : null}
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  typography.tabLabel,
                  isFocused ? styles.tabLabelActive : styles.tabLabelIdle,
                ]}
              >
                {label}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Orders" component={OrdersScreen} options={{ tabBarLabel: 'Orders' }} />
      <Tab.Screen name="Cart" component={CartScreen} options={{ tabBarLabel: 'Cart' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  tabPress: {
    flex: 1,
    alignItems: 'center',
  },
  tabInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 14,
    minWidth: 72,
  },
  tabInnerActive: {
    backgroundColor: colors.mint,
  },
  tabLabel: {
    marginTop: 4,
  },
  tabLabelActive: {
    color: colors.primary,
  },
  tabLabelIdle: {
    color: colors.textSecondary,
  },
  badge: {
    position: 'absolute',
    right: -10,
    top: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.surface,
    fontSize: 10,
    fontWeight: '700',
  },
});
