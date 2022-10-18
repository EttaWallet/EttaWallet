import styled, { css } from '@emotion/native';
import { IconPositionOptions, StyleProps } from '@ettawallet/react-core';
import { Button } from '../../atoms/Button';
import { Text } from '../../atoms/Text';

const boxedStyle = ({ theme }: Partial<StyleProps>) => `
    padding: ${theme?.spacing.centi};
    aspect-ratio: 1;
  `;

export const StyledIconTextButton = styled(Button)<
  Partial<StyleProps> & {
    boxed: boolean;
  }
>`
  ${({ boxed, theme }) => boxed && boxedStyle({ theme })};
`;

export const StyledText = styled(Text)<
  Partial<StyleProps> & {
    iconPosition: IconPositionOptions;
    hasIcon?: boolean;
  }
>`
  ${({ theme, iconPosition, hasIcon = false }) => {
    if (hasIcon && iconPosition === 'left')
      return css`
        margin-left: ${theme?.spacing.mili};
      `;
    else if (hasIcon && iconPosition === 'right')
      return css`
        margin-right: ${theme?.spacing.mili};
      `;
  }}
`;
