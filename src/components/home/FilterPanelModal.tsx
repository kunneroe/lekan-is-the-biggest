import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { brand, colors, fonts, radii, spacing } from '../../theme';
import { haptic } from '../../utils/haptics';
import { BottomSheet } from '../common/BottomSheet';
import { PrimaryButton } from '../common/PrimaryButton';

export type FilterState = {
  sortByRating: boolean;
  area: string | null;
  openNowOnly: boolean;
  freeDeliveryOnly: boolean;
};

export const DEFAULT_FILTERS: FilterState = {
  sortByRating: false,
  area: null,
  openNowOnly: false,
  freeDeliveryOnly: false,
};

type Props = {
  visible: boolean;
  onClose: () => void;
  areas: string[];
  value: FilterState;
  onApply: (filters: FilterState) => void;
};

function ToggleRow({
  title,
  sub,
  value,
  onChange,
}: {
  title: string;
  sub: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleLabel}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSub}>{sub}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={(v) => {
          haptic.select();
          onChange(v);
        }}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={colors.surface}
        accessibilityLabel={title}
      />
    </View>
  );
}

export function FilterPanelModal({ visible, onClose, areas, value, onApply }: Props) {
  // local draft — only committed on Apply
  const [draft, setDraft] = useState<FilterState>(value);

  // Sync draft when the sheet re-opens with a fresh value from the parent
  const handleShow = () => setDraft(value);

  const handleApply = () => {
    onApply(draft);
    onClose();
  };

  const handleClear = () => setDraft(DEFAULT_FILTERS);

  return (
    <BottomSheet visible={visible} onClose={onClose} onShow={handleShow} title="Filters">
      <ToggleRow
        title="Sort by rating"
        sub="Highest rated stores first"
        value={draft.sortByRating}
        onChange={(v) => setDraft((d) => ({ ...d, sortByRating: v }))}
      />
      <View style={styles.divider} />
      <ToggleRow
        title="Open now only"
        sub="Hide closed & inactive stores"
        value={draft.openNowOnly}
        onChange={(v) => setDraft((d) => ({ ...d, openNowOnly: v }))}
      />
      <View style={styles.divider} />
      <ToggleRow
        title="Free delivery only"
        sub="₦0 delivery fee stores only"
        value={draft.freeDeliveryOnly}
        onChange={(v) => setDraft((d) => ({ ...d, freeDeliveryOnly: v }))}
      />

      {areas.length > 0 && (
        <>
          <View style={styles.divider} />
          <Text style={styles.areaLabel}>Area</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {[null, ...areas].map((a) => {
              const on = draft.area === a;
              return (
                <Pressable
                  key={a ?? '__all'}
                  style={[styles.chip, on && styles.chipActive]}
                  onPress={() => {
                    haptic.select();
                    setDraft((d) => ({ ...d, area: a }));
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                >
                  <Text style={[styles.chipTxt, on && styles.chipTxtActive]}>{a ?? 'All areas'}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </>
      )}

      <View style={styles.footer}>
        <Pressable onPress={handleClear} style={styles.clearBtn} accessibilityRole="button">
          <Text style={styles.clearTxt}>Clear all</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <PrimaryButton label="Apply filters" onPress={handleApply} />
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginVertical: spacing.md },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.xs },
  toggleLabel: { flex: 1, marginRight: spacing.md },
  rowTitle: { fontFamily: fonts.bold, fontSize: 16, color: colors.text },
  rowSub: { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  areaLabel: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  chipRow: { flexDirection: 'row', gap: spacing.sm, paddingBottom: spacing.xs },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: brand.ink, borderColor: brand.ink },
  chipTxt: { fontFamily: fonts.semibold, fontSize: 14, color: colors.text },
  chipTxtActive: { color: brand.cream },
  footer: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xl, gap: spacing.md },
  clearBtn: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  clearTxt: { fontFamily: fonts.bold, fontSize: 15, color: colors.text },
});
