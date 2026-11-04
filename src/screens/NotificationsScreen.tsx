import { useNavigation } from '@react-navigation/native';
import { ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '../components/common/EmptyState';
import { colors, spacing } from '../theme';

export function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + spacing.xxl }]}
      showsVerticalScrollIndicator={false}
    >
      <EmptyState
        art="mark"
        title="You're all caught up"
        body="Order updates, rider messages and deals will land here."
        actionLabel="Back to shopping"
        onAction={() => navigation.goBack()}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl },
});
