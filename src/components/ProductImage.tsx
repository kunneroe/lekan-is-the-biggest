import { useState } from 'react';
import { Image, StyleSheet, Text, View, type ImageStyle, type StyleProp } from 'react-native';
import { colors, radii } from '../theme';

type Props = {
  uri: string | null | undefined;
  style?: StyleProp<ImageStyle>;
  label?: string;
};

export function ProductImage({ uri, style, label = 'Goshop' }: Props) {
  const [failed, setFailed] = useState(false);
  if (!uri || failed) {
    return (
      <View style={[styles.ph, style]}>
        <Text style={styles.phText}>{label.slice(0, 2).toUpperCase()}</Text>
      </View>
    );
  }
  return (
    <Image
      source={{ uri }}
      style={style}
      onError={() => setFailed(true)}
    />
  );
}

const styles = StyleSheet.create({
  ph: {
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
  },
  phText: {
    fontWeight: '800',
    color: colors.primary,
    fontSize: 14,
  },
});
