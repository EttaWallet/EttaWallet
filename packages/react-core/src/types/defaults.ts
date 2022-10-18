export type Color = {
  primary: ColorMode;
  secondary: ColorGradation;
  error: ColorGradation;
  success: ColorGradation;
  info: ColorGradation;
  warning: ColorGradation;
  elevation: ElevationColors;
};

export type TypographyVariation = {
  h1: Typography;
  h2: Typography;
  h3: Typography;
  h4: Typography;
  h5: Typography;
  base: Typography;
  sub: Typography;
  label: Typography;
};

export type Miscellaneous = {
  shadow: string;
  overlay: string;
  bodyColor: string;
  surfaceColor: string;
};

export type Spacing = {
  nano: string;
  micro: string;
  mili: string;
  centi: string;
  deca: string;
  kilo: string;
  mega: string;
  giga: string;
  tera: string;
  peta: string;
  hexa: string;
};

export type IconSize = {
  micro: string;
  mili: string;
  centi: string;
  deca: string;
  kilo: string;
  mega: string;
};

export type BorderRadius = {
  nano: string;
  micro: string;
  mili: string;
  centi: string;
  deca: string;
  pill: string;
};

export type BorderWidth = {
  pico: string;
  nano: string;
};

export type Typography = {
  lineHeight: string;
  fontSize: string;
};

export type ColorGradation = {
  xlight: string;
  light: string;
  medium: string;
  dark: string;
  xdark: string;
};

export type ColorMode = {
  orange: string;
  red: string;
  green: string;
  blue: string;
  purple: string;
  white: string;
  neutral1: string;
  neutral2: string;
  neutral3: string;
  neutral4: string;
  neutral5: string;
  neutral6: string;
  neutral7: string;
  neutral8: string;
  black: string;
};

export type FontStack = {
  default: string;
  mono: string;
};

export type FontColor = {
  light: string;
  medium: string;
  dark: string; // default
  orange: string;
};

export type ZIndex = {
  default: number;
  absolute: number;
  drawer: number;
  select: number;
  input: number;
  popover: number;
  tooltip: number;
  header: number;
  backdrop: number;
  sidebar: number;
  modal: number;
};

export type FontWeight = {
  thin: string;
  extralight: string;
  light: string;
  regular: string;
  medium: string;
  semibold: string;
  bold: string;
  extrabold: string;
  black: string;
};

export type ThemeProp = {
  color: Color;
  miscellaneous: Miscellaneous;
  spacing: Spacing;
  iconSize: IconSize;
  borderRadius: BorderRadius;
  borderWidth: BorderWidth;
  typography: TypographyVariation;
  font: {
    color: FontColor;
    stack: FontStack;
    weight: FontWeight;
    files: FontWeight;
  };
  zIndex: ZIndex;
  animation: {
    scale: number;
  };
};

export interface ThemeProviderProps {
  children?: React.ReactNode;
  theme: ThemeProp;
}

export type StyleProps = ThemeProviderProps;

export type ColorType = keyof Color;

export type SpacingType = keyof Spacing;

export type TypographyVariationType = keyof TypographyVariation;

export type FontWeightType = keyof FontWeight;

export type VariantType = 'filled' | 'outlined' | 'text';

export type ColorGradationType = keyof ColorMode;

export type FontColorType = keyof FontColor;

export type BorderRadiusType = keyof BorderRadius;

export type FontStackType = keyof FontStack;

export type IconSizeType = keyof IconSize;

export type $Omit<T, K> = Pick<T, Exclude<keyof T, K>>;

export type $RemoveChildren<T extends React.ComponentType<any>> = $Omit<
  React.ComponentPropsWithoutRef<T>,
  'children'
>;

export type EllipsizeProp = 'head' | 'middle' | 'tail' | 'clip';

export type Elevation = 0 | 1 | 2 | 3 | 4 | 5;

export enum ElevationLevels {
  'level0',
  'level1',
  'level2',
  'level3',
  'level4',
  'level5',
}

export type ElevationColors = {
  [key in keyof typeof ElevationLevels]: string;
};