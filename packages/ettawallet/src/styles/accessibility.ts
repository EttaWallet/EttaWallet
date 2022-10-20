import { PixelRatio } from 'react-native';

export function getSizing(maxSize = 38, baseSize = 16) {
  return baseSize * PixelRatio.getFontScale() < maxSize
    ? baseSize * PixelRatio.getFontScale()
    : maxSize;
}
