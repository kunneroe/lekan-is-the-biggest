import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LoaderView } from '../../components/brand/GrabitLoader';
import { BottomSheet } from '../../components/common/BottomSheet';
import { EmptyState } from '../../components/common/EmptyState';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { FadeInUp } from '../../components/motion/FadeInUp';
import { PressableScale } from '../../components/motion/PressableScale';
import { useAddresses } from '../../context/AddressContext';
import { appAlert } from '../../context/DialogContext';
import { showToast } from '../../context/ToastContext';
import { addressService } from '../../services/addressService';
import type { AddressLabel } from '../../types/address';
import { brand, colors, fonts, radii, shadows, spacing } from '../../theme';
import { buildCreateAddressPayload, formatAddressLabel, formatAddressLine } from '../../utils/addressFormat';
import { haptic } from '../../utils/haptics';
import { parseApiError } from '../../utils/parseApiError';

const LABEL_PRESETS: { key: AddressLabel | 'WORK'; title: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'HOME', title: 'Home', icon: 'home' },
  { key: 'WORK', title: 'Work', icon: 'briefcase' },
  { key: 'OTHER', title: 'Other', icon: 'location' },
];

function iconFor(label?: string): keyof typeof Ionicons.glyphMap {
  const l = (label || '').toUpperCase();
  if (l === 'HOME') return 'home';
  if (l === 'OFFICE' || l === 'WORK') return 'briefcase';
  if (l === 'SCHOOL') return 'school';
  return 'location';
}

/** Labelled input whose border turns green while you type. */
function Field({
  label,
  value,
  onChangeText,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text style={styles.inputLab}>{label}</Text>
      <TextInput
        style={[styles.input, focused && styles.inputFocused]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        accessibilityLabel={label}
      />
    </View>
  );
}

export function SavedAddressesScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { addresses, selectedAddressId, refreshAddresses, selectAddressAsDefault, loading } = useAddresses();

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
      appAlert('Validation', 'Please fill out street, city, and state.');
      return;
    }
    if (labelPreset === 'OTHER' && !customLabel.trim()) {
      appAlert('Validation', 'Please enter a name for this address.');
      return;
    }

    try {
      setSaving(true);
      await addressService.createAddress(buildCreateAddressPayload(title, street, city, state));
      setModalVisible(false);
      resetForm();
      await refreshAddresses();
      haptic.success();
      showToast('Address saved');
    } catch (error: unknown) {
      appAlert(
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
    haptic.select();
    try {
      await selectAddressAsDefault(id);
      const address = addresses.find((a) => a.id === id);
      showToast(address ? `Delivering to ${formatAddressLabel(address)}` : 'Delivery address updated');
      navigation.goBack();
    } catch (error: unknown) {
      appAlert(
        'Unable to Update Address',
        parseApiError(error, {
          fallback: 'Could not set your default delivery address.',
        }),
      );
    }
  };

  if (loading && addresses.length === 0) {
    return <LoaderView label="Loading your addresses…" />;
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={{ padding: spacing.xl, paddingBottom: insets.bottom + spacing.xxl, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {addresses.length === 0 ? (
          <EmptyState
            art="mark"
            title="Where should we deliver?"
            body="Add an address to check out faster and see it at the top of Home."
          />
        ) : (
          <>
            <Text style={styles.hint}>Tap an address to deliver there.</Text>
            {addresses.map((a, i) => {
              const sel = a.id === selectedAddressId || a.isDefault;
              return (
                <FadeInUp key={a.id} index={i}>
                  <AddressCard
                    selected={sel}
                    icon={iconFor(a.label)}
                    title={formatAddressLabel(a)}
                    line={formatAddressLine(a)}
                    onPress={() => void handleSelectAddress(a.id)}
                  />
                </FadeInUp>
              );
            })}
          </>
        )}
        <Pressable
          style={({ pressed }) => [styles.add, pressed && { opacity: 0.7 }]}
          onPress={() => setModalVisible(true)}
          accessibilityRole="button"
        >
          <Ionicons name="add-circle" size={22} color={colors.primary} />
          <Text style={styles.addTxt}>Add new address</Text>
        </Pressable>
      </ScrollView>

      <BottomSheet
        visible={modalVisible}
        onClose={() => {
          if (saving) return;
          setModalVisible(false);
          resetForm();
        }}
        title="New address"
      >
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={styles.inputLab}>Label</Text>
          <View style={styles.presetRow}>
            {LABEL_PRESETS.map((preset) => {
              const on = labelPreset === preset.key;
              return (
                <Pressable
                  key={preset.key}
                  style={[styles.presetBtn, on && styles.presetBtnOn]}
                  onPress={() => {
                    haptic.select();
                    setLabelPreset(preset.key);
                  }}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: on }}
                >
                  <Ionicons name={preset.icon} size={16} color={on ? brand.cream : colors.textSecondary} />
                  <Text style={[styles.presetTxt, on && styles.presetTxtOn]}>{preset.title}</Text>
                </Pressable>
              );
            })}
          </View>

          {labelPreset === 'OTHER' ? (
            <Field label="Name this place" value={customLabel} onChangeText={setCustomLabel} placeholder="e.g. Parent's house" />
          ) : null}
          <Field label="Street address" value={street} onChangeText={setStreet} placeholder="12 Admiralty Way" />
          <View style={styles.twoCol}>
            <View style={{ flex: 1 }}>
              <Field label="City" value={city} onChangeText={setCity} placeholder="Ikeja" />
            </View>
            <View style={{ flex: 1 }}>
              <Field label="State" value={state} onChangeText={setState} placeholder="Lagos" />
            </View>
          </View>
          <View style={{ marginTop: spacing.sm }}>
            <PrimaryButton
              label={saving ? 'Saving…' : 'Save address'}
              icon="checkmark"
              loading={saving}
              disabled={saving}
              onPress={() => void handleSave()}
            />
          </View>
        </ScrollView>
      </BottomSheet>
    </View>
  );
}

function AddressCard({
  selected,
  icon,
  title,
  line,
  onPress,
}: {
  selected: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  line: string;
  onPress: () => void;
}) {
  const check = useRef(new Animated.Value(selected ? 1 : 0)).current;
  useEffect(() => {
    Animated.spring(check, { toValue: selected ? 1 : 0, friction: 6, tension: 160, useNativeDriver: true }).start();
  }, [selected, check]);
  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.98}
      style={[styles.card, selected && styles.cardOn]}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`${title}, ${line}`}
    >
      <View style={[styles.cardIcon, selected && { backgroundColor: brand.green }]}>
        <Ionicons name={icon} size={20} color={selected ? brand.cream : brand.green} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{title}</Text>
        <Text style={styles.line}>{line}</Text>
      </View>
      <View style={[styles.radio, selected && styles.radioOn]}>
        <Animated.View style={[styles.radioDot, { transform: [{ scale: check }] }]} />
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  hint: { fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary, marginBottom: spacing.md },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: 'transparent',
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
    ...shadows.soft,
  },
  cardOn: { borderColor: colors.primary, backgroundColor: colors.tint },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontFamily: fonts.bold, fontSize: 16, color: colors.text },
  line: { fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary, marginTop: 3, lineHeight: 20 },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { borderColor: colors.primary },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary },
  add: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: colors.tintStrong,
    borderRadius: radii.lg,
    marginTop: spacing.sm,
  },
  addTxt: { fontFamily: fonts.bold, fontSize: 15, color: colors.primary },
  inputLab: { fontFamily: fonts.bold, fontSize: 13, color: colors.text, marginBottom: 6 },
  presetRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  presetBtn: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  presetBtnOn: { borderColor: brand.green, backgroundColor: brand.green },
  presetTxt: { fontFamily: fonts.semibold, color: colors.textSecondary, fontSize: 14 },
  presetTxtOn: { color: brand.cream, fontFamily: fonts.bold },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surfaceAlt,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 16,
  },
  inputFocused: { borderColor: colors.primary, backgroundColor: colors.surface },
  twoCol: { flexDirection: 'row', gap: spacing.md },
});
