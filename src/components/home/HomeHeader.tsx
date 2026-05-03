import { Ionicons } from '@expo/vector-icons';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, spacing, typography } from '../../theme';

type Props = {
  greeting: string;
  deliveryLine: string;
  onPressDelivery?: () => void;
  onPressNotifications?: () => void;
  avatarUri?: string;
};

export function HomeHeader({
  greeting,
  deliveryLine,
  onPressDelivery,
  onPressNotifications,
  avatarUri = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
}: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Image source={{ uri: avatarUri }} style={styles.avatar} />
        <View style={styles.textBlock}>
          <Text style={[styles.greeting, typography.greeting]}>{greeting}</Text>
          <Pressable
            onPress={onPressDelivery}
            style={styles.deliveryRow}
            hitSlop={8}
          >
            <Text style={[styles.delivery, typography.deliveryBold]} numberOfLines={1}>
              Deliver to: {deliveryLine}
            </Text>
            <Ionicons name="chevron-down" size={16} color={colors.text} />
          </Pressable>
        </View>
      </View>
      <Pressable
        onPress={onPressNotifications}
        style={styles.bellWrap}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Notifications"
      >
        <Ionicons name="notifications-outline" size={22} color={colors.primary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginRight: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.border,
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
  },
  greeting: {
    color: colors.textSecondary,
    marginBottom: 2,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  delivery: {
    color: colors.text,
    flexShrink: 1,
  },
  bellWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
