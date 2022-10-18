import styled, { css } from '@emotion/native';
import { IconPositionOptions } from '.';
import { Text } from '../../../';
import { StyleProps } from '../../../types/defaults';

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
