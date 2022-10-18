import {
  fontColorVC,
  IconComponent,
  IconTextButtonProps,
} from '@ettawallet/react-core';
import React from 'react';
import { ButtonNativeProps } from '../../atoms/Button';
import { StyledIconTextButton } from './styled';
import TextComponent from './TextComponent';

export type NativeIconTextButtonProps = IconTextButtonProps &
  Omit<ButtonNativeProps, 'ButtonProps'>;

const IconTextButton: React.FC<NativeIconTextButtonProps> = ({
  iconProps,
  iconPosition = 'left',
  textProps,
  label,
  variant = 'filled',
  size = 'default',
  ...rest
}) => {
  return (
    <StyledIconTextButton boxed={!label} variant={variant} {...rest}>
      {iconPosition === 'left' ? (
        <IconComponent
          iconProps={iconProps}
          size={size}
          defaultFontColor={fontColorVC[variant]}
        />
      ) : (
        <></>
      )}
      <TextComponent
        label={label}
        defaultFontColor={fontColorVC[variant]}
        hasIcon={!!iconProps}
        iconPosition={iconPosition}
        textProps={textProps}
        size={size}
      />
      {iconPosition === 'right' ? (
        <IconComponent
          iconProps={iconProps}
          size={size}
          defaultFontColor={fontColorVC[variant]}
        />
      ) : (
        <></>
      )}
    </StyledIconTextButton>
  );
};

export default IconTextButton;
