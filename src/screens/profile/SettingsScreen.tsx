import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { navigateRoot } from '../../navigation/navigationRef';
import { colors, radii, spacing } from '../../theme';

export function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [push, setPush] = useState(true);

  return (
    <ScrollView
      contentContainerStyle={{
        padding: spacing.xl,
        paddingBottom: insets.bottom + spacing.xxl,
      }}
    >
      <View style={styles.row}>
        <Text style={styles.lab}>Push notifications</Text>
        <Switch value={push} onValueChange={setPush} />
      </View>
      <Pressable
        style={styles.link}
        onPress={() => navigateRoot('Favorites')}
      >
        <Ionicons name="heart-outline" size={22} color={colors.primary} />
        <Text style={styles.linkTxt}>Manage favorites</Text>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </Pressable>
      <Pressable
        style={styles.link}
        onPress={() =>
          Alert.alert('Clear cache', 'Mock: cache cleared.', [{ text: 'OK' }])
        }
      >
        <Ionicons name="trash-outline" size={22} color={colors.primary} />
        <Text style={styles.linkTxt}>Clear app cache</Text>
      </Pressable>
      <Text style={styles.ver}>Build demo · no cloud sync</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  lab: { fontWeight: '600', color: colors.text },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  linkTxt: { flex: 1, fontWeight: '600', color: colors.text },
  ver: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.xl },
});
