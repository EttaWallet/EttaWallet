import {
  ColorGradationType,
  ColorType,
  FontColorType,
  VariantType,
} from '../types/defaults';

export const fontColorVC: Record<VariantType, FontColorType> = {
  filled: 'light',
  outlined: 'dark',
  text: 'dark',
};

export const colorVC: Record<VariantType, ColorType> = {
  filled: 'primary',
  outlined: 'primary',
  text: 'primary',
};

export const colorGradationVC: Record<VariantType, ColorGradationType> = {
  filled: 'black',
  outlined: 'black',
  text: 'black',
};

export const borderColorVC: Record<VariantType, ColorType> = {
  filled: 'primary',
  outlined: 'primary',
  text: 'primary',
};

export const borderColorGradationVC: Record<VariantType, ColorGradationType> = {
  filled: 'black',
  outlined: 'black',
  text: 'black',
};
