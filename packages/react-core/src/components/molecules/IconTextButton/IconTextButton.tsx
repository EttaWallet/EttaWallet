import { ButtonProps, IconProps, TextProps } from '../../../';

export type IconPositionOptions = 'left' | 'right';

export interface IconTextButtonProps extends ButtonProps {
  iconProps?: IconProps;
  iconPosition?: IconPositionOptions;
  textProps?: TextProps;
  label?: string;
}
