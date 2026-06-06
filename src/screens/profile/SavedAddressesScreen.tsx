import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View, Modal, TextInput, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { addressService } from '../../services/addressService';
import { colors, radii, shadows, spacing, typography } from '../../theme';

export function SavedAddressesScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchAddresses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await addressService.getAddresses();
      const list = res.addresses || res || [];
      setSavedAddresses(list);
      
      const def = list.find((a: any) => a.isDefault);
      if (def) setSelectedAddressId(def.id);
      else if (list.length > 0 && !selectedAddressId) setSelectedAddressId(list[0].id);
    } catch (e) {
      console.error('Failed to load addresses', e);
    } finally {
      setLoading(false);
    }
  }, [selectedAddressId]);

  useFocusEffect(
    useCallback(() => {
      fetchAddresses();
    }, [fetchAddresses])
  );

  const handleSave = async () => {
    if (!title || !street || !city) {
      Alert.alert('Validation', 'Please fill out all fields.');
      return;
    }

    let labelStr = title.toUpperCase().trim();
    let labelOther;
    
    if (labelStr !== 'HOME' && labelStr !== 'OFFICE' && labelStr !== 'SCHOOL') {
      labelOther = title.trim();
      labelStr = 'OTHER';
    }

    try {
      setSaving(true);
      await addressService.createAddress({
        label: labelStr,
        labelOther: labelOther,
        line1: street,
        city: city,
        state: 'Lagos',
      });
      setModalVisible(false);
      setTitle('');
      setStreet('');
      setCity('');
      await fetchAddresses();
    } catch (error: any) {
      let msg = 'Failed to save address.';
      if (error.response?.data) {
        if (typeof error.response.data.message === 'string') {
          msg = error.response.data.message;
        } else if (Array.isArray(error.response.data.errors) && error.response.data.errors.length > 0) {
          msg = error.response.data.errors[0].msg || error.response.data.errors[0].message || msg;
        } else if (typeof error.response.data === 'string' && error.response.data.length < 100) {
          msg = error.response.data;
        }
      }
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
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
      ) : (
        savedAddresses.map((a) => {
          const sel = a.id === selectedAddressId;
          return (
            <Pressable
              key={a.id}
              style={[styles.card, sel && styles.cardOn]}
              onPress={async () => {
                setSelectedAddressId(a.id);
                try {
                  await addressService.setDefaultAddress(a.id);
                } catch (e) {}
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
                <Text style={styles.line}>{a.line1}, {a.city}</Text>
              </View>
            </Pressable>
          );
        })
      )}
      <Pressable
        style={styles.add}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={22} color={colors.primary} />
        <Text style={styles.addTxt}>Add new address</Text>
      </Pressable>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Address</Text>
            
            <Text style={styles.inputLab}>Title (e.g. Home, Office)</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Home" />
            
            <Text style={styles.inputLab}>Street Address</Text>
            <TextInput style={styles.input} value={street} onChangeText={setStreet} placeholder="123 Example St" />
            
            <Text style={styles.inputLab}>City</Text>
            <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="Ikeja" />

            <View style={styles.modalBtns}>
              <Pressable style={styles.cancelBtn} onPress={() => setModalVisible(false)} disabled={saving}>
                <Text style={styles.cancelTxt}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator color={colors.surface} /> : <Text style={styles.saveTxt}>Save Address</Text>}
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
  cancelBtn: { flex: 1, padding: spacing.md, alignItems: 'center', borderRadius: radii.md, borderWidth: 1, borderColor: colors.border },
  cancelTxt: { fontWeight: '700', color: colors.textSecondary },
  saveBtn: { flex: 1, padding: spacing.md, alignItems: 'center', borderRadius: radii.md, backgroundColor: colors.primary },
  saveTxt: { fontWeight: '700', color: colors.surface },
});
