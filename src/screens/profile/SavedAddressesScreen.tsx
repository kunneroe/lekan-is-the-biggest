import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDemo } from '../../context/DemoContext';
import { colors, radii, spacing, typography } from '../../theme';

export function SavedAddressesScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { savedAddresses, selectedAddressId, setSelectedAddressId } = useDemo();

  return (
    <ScrollView
      contentContainerStyle={{
        padding: spacing.xl,
        paddingBottom: insets.bottom + spacing.xxl,
      }}
    >
      {savedAddresses.map((a) => {
        const sel = a.id === selectedAddressId;
        return (
          <Pressable
            key={a.id}
            style={[styles.card, sel && styles.cardOn]}
            onPress={() => {
              setSelectedAddressId(a.id);
              Alert.alert('Address updated', `${a.label} is now your delivery address.`);
              navigation.goBack();
            }}
          >
            <Ionicons
              name={sel ? 'radio-button-on' : 'radio-button-off'}
              size={22}
              color={sel ? colors.primary : colors.textMuted}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{a.label}</Text>
              <Text style={styles.line}>{a.line}</Text>
            </View>
          </Pressable>
        );
      })}
      <Pressable
        style={styles.add}
        onPress={() => Alert.alert('Add address', 'Mock: new address form.')}
      >
        <Ionicons name="add" size={22} color={colors.primary} />
        <Text style={styles.addTxt}>Add new address</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  cardOn: { borderColor: colors.primary, borderWidth: 2 },
  label: { fontWeight: '800', color: colors.text },
  line: { color: colors.textSecondary, marginTop: 4, lineHeight: 20 },
  add: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radii.lg,
  },
  addTxt: { color: colors.primary, fontWeight: '700' },
});
