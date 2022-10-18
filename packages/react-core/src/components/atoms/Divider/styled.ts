import styled, { css } from '@emotion/native';
import { StyleProps } from '@ettawallet/react-core';
import { DividerProps } from './Divider';

const topLine = ({ theme, linePosition, noLine }: DividerProps & StyleProps) =>
  !noLine &&
  linePosition === 'top' &&
  css`
    border-top-width: ${theme.borderWidth.pico};
  `;

const bottomLine = ({
  theme,
  linePosition,
  noLine,
}: DividerProps & StyleProps) =>
  !noLine &&
  linePosition === 'bottom' &&
  css`
    border-bottom-width: ${theme.borderWidth.pico};
  `;

const StyledDividerBase = styled.View<Partial<StyleProps>>`
  border-color: ${({ theme }) => theme.color.primary.neutral4};
`;

export const StyledDivider = styled(StyledDividerBase)<
  DividerProps & Partial<StyleProps>
>(
  props => css`
    ${topLine(props)}
    ${bottomLine(props)}
  `
);
