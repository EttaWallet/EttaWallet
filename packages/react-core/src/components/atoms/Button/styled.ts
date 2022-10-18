import styled, { css } from '@emotion/native';
import { StyleProps } from '../../../types/defaults';
import { RFValueStr } from '../../../utils';
import { PressableSurface } from '../PressableSurface';
import { ButtonProps } from './Button';

const outlineVariant = ({
  theme,
  color = 'primary',
  variant,
  tone = 'orange',
}: StyleProps & ButtonProps) =>
  variant === 'outlined' &&
  css`
    border-color: ${theme.color[color][tone]};
    border-width: ${theme.borderWidth.pico};
  `;

const sizeStyles = ({ theme, size = 'default' }: StyleProps & ButtonProps) => {
  switch (size) {
    case 'small':
      return css`
        padding: ${theme.spacing.nano} ${theme.spacing.mili};
        min-height: ${RFValueStr('30px')};
      `;
    case 'large':
      return css`
        padding: ${theme.spacing.deca} ${theme.spacing.kilo};
        min-height: ${RFValueStr('60px')};
      `;
    default:
      return css`
        padding: ${theme.spacing.mili} ${theme.spacing.kilo};
        min-height: ${RFValueStr('46px')};
      `;
  }
};

const StyledButtonBase = styled(PressableSurface) <
  ButtonProps & Partial<StyleProps>
  >`
  border-radius: ${({ theme, borderRadius = 'micro' }) =>
    theme.borderRadius[borderRadius]};
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

export const StyledButton = styled(StyledButtonBase)<
  ButtonProps & Partial<StyleProps>
>(
  props => css`
    ${outlineVariant(props)}
    ${sizeStyles(props)}
  `
);
