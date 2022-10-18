import { useTheme } from '@emotion/react';
import React, { FC } from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import { ThemeProp } from '../../../types/defaults';
import { lightenDarkenColor } from '../../../utils';

const COLOR_VARIATION_FACTOR = 25;

export interface PressableSurfaceProps extends PressableProps {
  effect?: 'darken' | 'lighten' | 'none';
  surfaceColor?: string;
  effectIntensity?: number;
  effectStyle?: (pressed: boolean) => StyleProp<ViewStyle>;
}

const PressableSurface: FC<PressableSurfaceProps> = ({
  children,
  surfaceColor,
  effect,
  effectIntensity,
  effectStyle,
  style,
  ...rest
}) => {
  const theme = useTheme() as ThemeProp;
  let effectBaseColor = theme.miscellaneous.surfaceColor;
  let bgColor = 'transparent';

  if (surfaceColor) {
    effectBaseColor = surfaceColor;
    bgColor = effectBaseColor;
  }

  const readyStyle = prepareStyle(
    { effect, effectIntensity, style, effectStyle },
    effectBaseColor,
    bgColor
  );
  return (
    <Pressable {...rest} style={readyStyle}>
      {children}
    </Pressable>
  );
};

const prepareStyle = (
  props: PressableSurfaceProps,
  effectColor: string,
  bgColor: string
): any => {
  const {
    effect = 'darken',
    effectIntensity = COLOR_VARIATION_FACTOR,
    style,
    effectStyle,
  } = props;

  const lighten = lightenDarkenColor(effectColor, effectIntensity);
  const darken = lightenDarkenColor(effectColor, -effectIntensity);
  const composedStyle = [{ backgroundColor: bgColor }, style];

  if (effectStyle) {
    return ({ pressed }) => [composedStyle, effectStyle(pressed)];
  }

  switch (effect) {
    case 'darken':
      return applyEffectStyle(composedStyle, darken);

    case 'lighten':
      return applyEffectStyle(composedStyle, lighten);

    case 'none':
      return composedStyle;
  }
};

const applyEffectStyle = (style: any, variation: string) => {
  return ({ pressed }) => [style, pressed && { backgroundColor: variation }];
};

export default PressableSurface;
