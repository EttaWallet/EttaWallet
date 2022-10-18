import {
  ColorGradationType,
  ColorType,
  FontColorType,
  IconSizeType,
  ThemeProp,
} from '@ettawallet/react-core';
import styled from '@emotion/native';

import { createIconSet } from 'react-native-vector-icons';
import glyphMap from '@ettawallet/rn-bitcoin-icons/src/static/unicodesMap.json';

const getStyledIcon = (Component, size) => styled(Component)`
  font-size: ${({ theme }) => theme.iconSize[size]};
  // text-align: center;
`;

export const getIconComponent = (size: IconSizeType): any => {
  const iconSet = createIconSet(glyphMap, 'Bitcoin', 'Bitcoin.ttf');
  return getStyledIcon(iconSet, size);
};

/* eslint-enable */
export const getIconColor = (
  colorVariant: ColorType | undefined,
  colorGradation: ColorGradationType | undefined,
  fontColor: FontColorType,
  theme: ThemeProp
): string => {
  if (colorVariant && colorGradation) {
    return theme.color[colorVariant][colorGradation];
  }
  return theme.font.color[fontColor];
};
