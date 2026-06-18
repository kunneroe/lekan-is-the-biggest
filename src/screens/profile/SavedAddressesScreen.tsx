import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { useAddresses } from '../../context/AddressContext';
import { addressService } from '../../services/addressService';
import type { AddressLabel } from '../../types/address';
import { colors, radii, shadows, spacing } from '../../theme';
import {
  buildCreateAddressPayload,
  formatAddressLabel,
  formatAddressLine,
} from '../../utils/addressFormat';
import { parseApiError } from '../../utils/parseApiError';

const LABEL_PRESETS: { key: AddressLabel | 'WORK'; title: string }[] = [
  { key: 'HOME', title: 'Home' },
  { key: 'WORK', title: 'Work' },
  { key: 'OTHER', title: 'Other' },
];

export function SavedAddressesScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const {
    addresses,
    selectedAddressId,
    refreshAddresses,
    selectAddressAsDefault,
    loading,
  } = useAddresses();

  const [modalVisible, setModalVisible] = useState(false);
  const [labelPreset, setLabelPreset] = useState<AddressLabel | 'WORK'>('HOME');
  const [customLabel, setCustomLabel] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Lagos');
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void refreshAddresses();
    }, [refreshAddresses]),
  );

  const resetForm = () => {
    setLabelPreset('HOME');
    setCustomLabel('');
    setStreet('');
    setCity('');
    setState('Lagos');
  };

  const resolveTitleForCreate = (): string => {
    if (labelPreset === 'OTHER') {
      return customLabel.trim() || 'Other';
    }
    if (labelPreset === 'WORK') {
      return 'Work';
    }
    return labelPreset;
  };

  const handleSave = async () => {
    const title = resolveTitleForCreate();
    if (!street.trim() || !city.trim() || !state.trim()) {
      Alert.alert('Validation', 'Please fill out street, city, and state.');
      return;
    }
    if (labelPreset === 'OTHER' && !customLabel.trim()) {
      Alert.alert('Validation', 'Please enter a name for this address.');
      return;
    }

    try {
      setSaving(true);
      await addressService.createAddress(
        buildCreateAddressPayload(title, street, city, state),
      );
      setModalVisible(false);
      resetForm();
      await refreshAddresses();
    } catch (error: unknown) {
      Alert.alert(
        'Unable to Save Address',
        parseApiError(error, {
          fallback: 'Failed to save address. Please try again.',
        }),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSelectAddress = async (id: string) => {
    try {
      await selectAddressAsDefault(id);
      const address = addresses.find((a) => a.id === id);
      Alert.alert(
        'Address updated',
        address
          ? `${formatAddressLabel(address)} is now your delivery address.`
          : 'Your delivery address has been updated.',
      );
      navigation.goBack();
    } catch (error: unknown) {
      Alert.alert(
        'Unable to Update Address',
        parseApiError(error, {
          fallback: 'Could not set your default delivery address.',
        }),
      );
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{
        padding: spacing.xl,
        paddingBottom: insets.bottom + spacing.xxl,
      }}
    >
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : addresses.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="location-outline" size={48} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No saved addresses</Text>
          <Text style={styles.emptySub}>
            Add a delivery address to checkout and see it on your home screen.
          </Text>
        </View>
      ) : (
        addresses.map((a) => {
          const sel = a.id === selectedAddressId || a.isDefault;
          return (
            <Pressable
              key={a.id}
              style={[styles.card, sel && styles.cardOn]}
              onPress={() => void handleSelectAddress(a.id)}
            >
              <Ionicons
                name={sel ? 'radio-button-on' : 'radio-button-off'}
                size={22}
                color={sel ? colors.primary : colors.textMuted}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>{formatAddressLabel(a)}</Text>
                <Text style={styles.line}>{formatAddressLine(a)}</Text>
              </View>
            </Pressable>
          );
        })
      )}
      <Pressable style={styles.add} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={22} color={colors.primary} />
        <Text style={styles.addTxt}>Add new address</Text>
      </Pressable>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Address</Text>

            <Text style={styles.inputLab}>Label</Text>
            <View style={styles.presetRow}>
              {LABEL_PRESETS.map((preset) => {
                const on = labelPreset === preset.key;
                return (
                  <Pressable
                    key={preset.key}
                    style={[styles.presetBtn, on && styles.presetBtnOn]}
                    onPress={() => setLabelPreset(preset.key)}
                  >
                    <Text style={[styles.presetTxt, on && styles.presetTxtOn]}>
                      {preset.title}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {labelPreset === 'OTHER' ? (
              <>
                <Text style={styles.inputLab}>Custom label</Text>
                <TextInput
                  style={styles.input}
                  value={customLabel}
                  onChangeText={setCustomLabel}
                  placeholder="e.g. Parent's house"
                />
              </>
            ) : null}

            <Text style={styles.inputLab}>Street address (line1)</Text>
            <TextInput
              style={styles.input}
              value={street}
              onChangeText={setStreet}
              placeholder="123 Example St"
            />

            <Text style={styles.inputLab}>City</Text>
            <TextInput
              style={styles.input}
              value={city}
              onChangeText={setCity}
              placeholder="Ikeja"
            />

            <Text style={styles.inputLab}>State</Text>
            <TextInput
              style={styles.input}
              value={state}
              onChangeText={setState}
              placeholder="Lagos"
            />

            <View style={styles.modalBtns}>
              <Pressable
                style={styles.cancelBtn}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
                disabled={saving}
              >
                <Text style={styles.cancelTxt}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.saveBtn} onPress={() => void handleSave()} disabled={saving}>
                {saving ? (
                  <ActivityIndicator color={colors.surface} />
                ) : (
                  <Text style={styles.saveTxt}>Save Address</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    gap: spacing.sm,
  },
  emptyTitle: {
    fontWeight: '800',
    fontSize: 18,
    color: colors.text,
    marginTop: spacing.md,
  },
  emptySub: {
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
    ...shadows.card,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: spacing.lg, color: colors.text },
  inputLab: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 4 },
  presetRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  presetBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  presetBtnOn: {
    borderColor: colors.primary,
    backgroundColor: colors.mint,
  },
  presetTxt: { fontWeight: '600', color: colors.textSecondary, fontSize: 13 },
  presetTxtOn: { color: colors.primary, fontWeight: '800' },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  modalBtns: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  cancelBtn: {
    flex: 1,
    padding: spacing.md,
    alignItems: 'center',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelTxt: { fontWeight: '700', color: colors.textSecondary },
  saveBtn: {
    flex: 1,
    padding: spacing.md,
    alignItems: 'center',
    borderRadius: radii.md,
    backgroundColor: colors.primary,
  },
  saveTxt: { fontWeight: '700', color: colors.surface },
});
