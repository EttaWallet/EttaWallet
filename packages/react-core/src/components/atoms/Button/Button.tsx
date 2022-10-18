import { useTheme } from '@emotion/react';
import React, { FC } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import {
  BorderRadiusType,
  ColorGradationType,
  ColorType,
  FontColorType,
  ThemeProp,
  VariantType,
} from '../../../types/defaults';
import { PressableSurfaceProps } from '../PressableSurface';
import { TextProps } from '../Text';
import { StyledButton } from './styled';

export type ButtonSizeType = 'small' | 'default' | 'large';

export type ButtonStateType = 'loading' | 'error' | 'success' | 'default';

export interface ButtonStateProps {
  buttonSize?: ButtonSizeType;
  fontColor?: FontColorType;
  textComponent?: React.FC<TextProps>;
  text?: string;
}

export interface ButtonProps extends PressableSurfaceProps {
  style?: StyleProp<ViewStyle>;
  color?: ColorType;
  variant?: VariantType;
  tone?: ColorGradationType;
  frozen?: boolean | null;
  borderRadius?: BorderRadiusType;
  size?: ButtonSizeType;
  state?: ButtonStateType;
  loadingComponent?: JSX.Element;
  errorComponent?: JSX.Element;
  successComponent?: JSX.Element;
}

const Button: FC<ButtonProps> = ({
  children,
  style,
  color = 'primary',
  variant = 'filled',
  tone = 'neutral4',
  state = 'default',
  loadingComponent,
  errorComponent,
  successComponent,
  size,
  frozen,
  disabled,
  ...rest
}): JSX.Element => {
  const theme = useTheme() as ThemeProp;
  const _frozen = frozen || state === 'loading';
  let _color: ColorType;
  switch (state) {
    case 'error':
      _color = 'error';
      break;

    case 'success':
      _color = 'success';
      break;

    default:
      _color = color;
      break;
  }

  let _surfaceColor;
  if (variant === 'filled') {
    _surfaceColor = theme.color[_color][tone];
  }

  if (variant === 'outlined') {
    _surfaceColor = theme.color[_color][tone];
  }

  if (disabled) {
    _surfaceColor = theme.color[_color][tone];
  }

  return (
    <StyledButton
      {...rest}
      accessibilityRole="button"
      style={style}
      color={_color}
      tone={tone}
      surfaceColor={_surfaceColor}
      variant={variant}
      size={size}
      disabled={_frozen || disabled}
      frozen={disabled}
    >
      {state === 'loading' && loadingComponent}
      {state === 'error' && errorComponent}
      {state === 'success' && successComponent}
      {state === 'default' && children}
    </StyledButton>
  );
};

export default Button;
