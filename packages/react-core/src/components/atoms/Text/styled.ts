import styled, { css } from '@emotion/native';
import { StyleProps, TextProps } from '@ettawallet/react-core';
import { Text as RNText } from 'react-native';

export const StyledText = styled(RNText)<TextProps & Partial<StyleProps>>`
  color: ${({ theme, fontColor = 'dark' }) => theme.font.color[fontColor]};
  font-weight: ${({ theme, fontWeight = 'regular' }) =>
    theme.font.weight[fontWeight]};
  font-size: ${({ theme, typography = 'base' }) =>
    theme.typography[typography].fontSize};
  line-height: ${({ theme, typography = 'base' }) =>
    theme.typography[typography].lineHeight};
  font-family: ${({ theme, fontStack = 'default' }) =>
    `'${theme.font.stack[fontStack]}'`};
  text-transform: ${({ textTransform = 'none' }) => `${textTransform}`};
`;

const colorStyles = ({
  colorVariant,
  colorTone,
  theme,
}: TextProps & StyleProps) =>
  colorVariant &&
  colorTone &&
  css`
    color: ${theme.color[colorVariant][colorTone]};
  `;

export const StyledColoredText = styled(StyledText)<
  TextProps & Partial<StyleProps>
>(colorStyles);
