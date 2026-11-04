import { useState } from 'react';
import { Image, StyleSheet, View, type ImageStyle, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '../theme';
import { GrabitMark } from './brand/GrabitMark';

type Props = {
  uri: string | null | undefined;
  style?: StyleProp<ImageStyle>;
  label?: string;
};

/** Product photo with a branded placeholder when the image is missing or fails. */
export function ProductImage({ uri, style, label = 'Product' }: Props) {
  const [failed, setFailed] = useState(false);

  if (!uri || failed) {
    const flat = StyleSheet.flatten(style) || {};
    const h = typeof flat.height === 'number' ? flat.height : 64;
    return (
      <View
        accessible
        accessibilityRole="image"
        accessibilityLabel={label}
        style={[styles.ph, style as StyleProp<ViewStyle>]}
      >
        <GrabitMark size={Math.max(20, Math.min(56, h * 0.4))} variant="mono" color={colors.tintStrong} knockout={colors.tint} />
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={[styles.img, style]}
      onError={() => setFailed(true)}
      accessibilityLabel={label}
    />
  );
}

const styles = StyleSheet.create({
  img: { backgroundColor: colors.sand },
  ph: {
    backgroundColor: colors.tint,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
