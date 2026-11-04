import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { measureView, useCartFly } from '../context/CartFlyContext';
import { cartService } from '../services/cartService';

import { CartScreen } from '../screens/CartScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { OrdersScreen } from '../screens/OrdersScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { brand, colors, fonts, radii, shadows, spacing } from '../theme';
import { haptic } from '../utils/haptics';

export type MainTabParamList = {
  Home: undefined;
  Orders: undefined;
  Cart: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

type IconName = keyof typeof Ionicons.glyphMap;
const ICONS: Record<keyof MainTabParamList, [IconName, IconName]> = {
  Home: ['storefront', 'storefront-outline'],
  Orders: ['receipt', 'receipt-outline'],
  Cart: ['bag-handle', 'bag-handle-outline'],
  Profile: ['person-circle', 'person-circle-outline'],
};

function TabItem({
  label,
  routeName,
  focused,
  badge,
  onPress,
}: {
  label: string;
  routeName: keyof MainTabParamList;
  focused: boolean;
  badge: number;
  onPress: () => void;
}) {
  const focus = useRef(new Animated.Value(focused ? 1 : 0)).current;
  const gulp = useRef(new Animated.Value(0)).current;
  const badgePop = useRef(new Animated.Value(badge > 0 ? 1 : 0)).current;
  const iconRef = useRef<View>(null);
  const prevBadge = useRef(badge);
  const { registerCartTarget, landTick } = useCartFly();
  const isCart = routeName === 'Cart';

  useEffect(() => {
    Animated.spring(focus, { toValue: focused ? 1 : 0, friction: 7, tension: 120, useNativeDriver: true }).start();
  }, [focused, focus]);

  useEffect(() => {
    if (!isCart) return;
    registerCartTarget(() => measureView(iconRef));
    return () => registerCartTarget(null);
  }, [isCart, registerCartTarget]);

  // GULP: the cart squashes and stretches when a flying product lands in it.
  useEffect(() => {
    if (!isCart || landTick === 0) return;
    haptic.grab();
    gulp.setValue(0);
    Animated.sequence([
      Animated.timing(gulp, { toValue: 1, duration: 90, useNativeDriver: true }),
      Animated.spring(gulp, { toValue: 0, friction: 3.5, tension: 220, useNativeDriver: true }),
    ]).start();
  }, [isCart, landTick, gulp]);

  // Badge pops when the count goes up.
  useEffect(() => {
    if (badge > prevBadge.current) {
      badgePop.setValue(0);
      Animated.spring(badgePop, { toValue: 1, friction: 4, tension: 200, useNativeDriver: true }).start();
    } else if (badge > 0) {
      badgePop.setValue(1);
    }
    prevBadge.current = badge;
  }, [badge, badgePop]);

  const [on, off] = ICONS[routeName];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={focused ? { selected: true } : undefined}
      accessibilityLabel={badge > 0 ? `${label}, ${badge} items` : label}
      onPress={onPress}
      style={styles.tabPress}
    >
      <View style={styles.tabInner}>
        <Animated.View
          style={[
            styles.pill,
            {
              opacity: focus,
              transform: [{ scaleX: focus.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }],
            },
          ]}
        />
        <Animated.View
          ref={iconRef}
          collapsable={false}
          style={{
            transform: [
              { translateY: focus.interpolate({ inputRange: [0, 1], outputRange: [0, -1] }) },
              { scaleX: gulp.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] }) },
              { scaleY: gulp.interpolate({ inputRange: [0, 1], outputRange: [1, 0.78] }) },
            ],
          }}
        >
          <Ionicons name={focused ? on : off} size={24} color={focused ? colors.primary : colors.textSecondary} />
          {badge > 0 ? (
            <Animated.View style={[styles.badge, { transform: [{ scale: badgePop }] }]}>
              <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
            </Animated.View>
          ) : null}
        </Animated.View>
        <Text style={[styles.tabLabel, { color: focused ? colors.primary : colors.textSecondary }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

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
          options.tabBarLabel !== undefined ? String(options.tabBarLabel) : options.title ?? route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            haptic.select();
            navigation.navigate(route.name);
          }
        };

        return (
          <TabItem
            key={route.key}
            label={label}
            routeName={route.name as keyof MainTabParamList}
            focused={isFocused}
            badge={route.name === 'Cart' ? cartBadge : 0}
            onPress={onPress}
          />
        );
      })}
    </View>
  );
}

export function MainTabNavigator() {
  return (
    <Tab.Navigator tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
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
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    ...shadows.lifted,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.08,
  },
  tabPress: { flex: 1, alignItems: 'center' },
  tabInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    minWidth: 76,
    minHeight: 54,
  },
  pill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.mint,
    borderRadius: radii.lg,
  },
  tabLabel: { marginTop: 3, fontFamily: fonts.bold, fontSize: 11 },
  badge: {
    position: 'absolute',
    right: -11,
    top: -7,
    minWidth: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: brand.tomato,
    borderWidth: 2,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: brand.forest, fontSize: 10, fontFamily: fonts.black },
});
