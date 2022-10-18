import React, { FC } from 'react';
import { StyleProp, TextStyle } from 'react-native';
import { useTheme } from '@emotion/react';
import {
  ColorGradationType,
  ColorType,
  FontColorType,
  IconSizeType,
  ThemeProp,
} from '@ettawallet/react-core';
import { getIconColor, getIconComponent } from './helpers';

export interface IconProps {
  /**  Name of the icon. You must use the same icons from unicodeMap.json in rn-bitcoin-icons static folder */
  name: string;
  /**  Default icon sizes from theme */
  size?: IconSizeType;
  /** Font theme fill color */
  fontColor?: FontColorType;
  /** Palette theme fill color */
  colorVariant?: ColorType;
  /** Palette theme gradation fill color */
  colorTone?: ColorGradationType;
  style?: StyleProp<TextStyle>;
}

export const Icon: FC<IconProps> = ({
  name,
  size = 'centi',
  fontColor = 'dark',
  colorVariant,
  colorTone = 'orange',
  style,
  ...rest
}) => {
  const theme = useTheme() as ThemeProp;
  const color = getIconColor(colorVariant, colorTone, fontColor, theme);
  const IconComponent = getIconComponent(size);

  return <IconComponent {...rest} style={style} name={name} color={color} />;
};

export default Icon;
