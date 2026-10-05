import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { colors, radii, shadows, spacing } from '../../theme';

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

export function FilterPanelModal({ visible, onClose, areas, value, onApply }: Props) {
  // local draft — only committed on Apply
  const [draft, setDraft] = useState<FilterState>(value);

  // Sync draft when the modal re-opens with a fresh value from the parent
  const handleShow = () => setDraft(value);

  const handleApply = () => {
    onApply(draft);
    onClose();
  };

  const handleClear = () => setDraft(DEFAULT_FILTERS);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onShow={handleShow}
      onRequestClose={onClose}
    >
      <View style={styles.wrap}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.card}>
          {/* ── Header ───────────────────────────────────────── */}
          <Text style={styles.title}>Filters</Text>

          {/* ── Sort by rating ───────────────────────────────── */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleLabel}>
              <Text style={styles.rowTitle}>Sort by rating</Text>
              <Text style={styles.rowSub}>Highest rated stores first</Text>
            </View>
            <Switch
              value={draft.sortByRating}
              onValueChange={(v) => setDraft((d) => ({ ...d, sortByRating: v }))}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.surface}
            />
          </View>

          <View style={styles.divider} />

          {/* ── Open now only ────────────────────────────────── */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleLabel}>
              <Text style={styles.rowTitle}>Open now only</Text>
              <Text style={styles.rowSub}>Hide closed & inactive stores</Text>
            </View>
            <Switch
              value={draft.openNowOnly}
              onValueChange={(v) => setDraft((d) => ({ ...d, openNowOnly: v }))}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.surface}
            />
          </View>

          <View style={styles.divider} />

          {/* ── Free delivery only ───────────────────────────── */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleLabel}>
              <Text style={styles.rowTitle}>Free delivery only</Text>
              <Text style={styles.rowSub}>₦0 delivery fee stores only</Text>
            </View>
            <Switch
              value={draft.freeDeliveryOnly}
              onValueChange={(v) => setDraft((d) => ({ ...d, freeDeliveryOnly: v }))}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.surface}
            />
          </View>

          {/* ── Area chips ───────────────────────────────────── */}
          {areas.length > 0 && (
            <>
              <View style={styles.divider} />
              <Text style={styles.areaLabel}>Area</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipRow}
              >
                {/* "All areas" chip — clears selection */}
                <Pressable
                  style={[styles.chip, draft.area === null && styles.chipActive]}
                  onPress={() => setDraft((d) => ({ ...d, area: null }))}
                >
                  <Text style={[styles.chipTxt, draft.area === null && styles.chipTxtActive]}>
                    All areas
                  </Text>
                </Pressable>

                {areas.map((a) => (
                  <Pressable
                    key={a}
                    style={[styles.chip, draft.area === a && styles.chipActive]}
                    onPress={() => setDraft((d) => ({ ...d, area: a }))}
                  >
                    <Text style={[styles.chipTxt, draft.area === a && styles.chipTxtActive]}>
                      {a}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </>
          )}

          {/* ── Footer ───────────────────────────────────────── */}
          <View style={styles.footer}>
            <Pressable onPress={handleClear} style={styles.clearBtn}>
              <Text style={styles.clearTxt}>Clear all</Text>
            </Pressable>
            <Pressable onPress={handleApply} style={styles.applyBtn}>
              <Text style={styles.applyTxt}>Apply</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  card: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
    zIndex: 1,
    ...shadows.card,
  },
  title: {
    fontWeight: '800',
    fontSize: 18,
    marginBottom: spacing.lg,
    color: colors.text,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  toggleLabel: {
    flex: 1,
    marginRight: spacing.md,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  rowSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  areaLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipTxt: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  chipTxtActive: {
    color: colors.surface,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  clearBtn: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  clearTxt: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 15,
  },
  applyBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  applyTxt: {
    color: colors.surface,
    fontWeight: '700',
    fontSize: 15,
  },
});
