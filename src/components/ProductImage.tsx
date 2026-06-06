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
  const fallback = 'https://placehold.co/150x150/png?text=No+Image';

  return (
    <Image
      source={{ uri: failed || !uri ? fallback : uri }}
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
