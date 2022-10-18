import {
  ButtonSizeType,
  FontColor,
  IconPositionOptions,
  TextProps,
} from '@ettawallet/react-core';
import React, { FC } from 'react';
import { StyledText } from './styled';

interface TextComponentProps {
  textProps?: TextProps;
  size?: ButtonSizeType;
  defaultFontColor: keyof FontColor;
  label?: string;
  iconPosition?: IconPositionOptions;
  hasIcon?: boolean;
}

const TextComponent: FC<TextComponentProps> = ({
  textProps,
  size = 'default',
  defaultFontColor,
  label,
  iconPosition = 'left',
  hasIcon = false,
}) => {
  return label ? (
    <StyledText
      typography={textProps?.typography ?? size === 'small' ? 'sub' : 'base'}
      fontWeight={textProps?.fontWeight ?? 'semibold'}
      fontColor={textProps?.fontColor ?? defaultFontColor}
      iconPosition={iconPosition}
      hasIcon={hasIcon}
      {...textProps}
    >
      {label}
    </StyledText>
  ) : (
    <></>
  );
};

export default React.memo(TextComponent);
