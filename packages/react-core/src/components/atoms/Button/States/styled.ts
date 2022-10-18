import styled from '@emotion/native';
import { StyleProps } from '@ettawallet/react-core';
import { FC } from 'react';
import { ActivityIndicator } from 'react-native';
import { TextProps } from '../../Text';
import { ButtonStateProps } from '../Button';

export const getStyledTextButton = (component: FC<TextProps>) => {
  return styled(component)<Partial<ButtonStateProps> & Partial<StyleProps>>`
    margin-left: ${({ theme }) => theme.spacing.mili};
  `;
};

export const StyledIndicator = styled(ActivityIndicator)<
  Partial<ButtonStateProps> & Partial<StyleProps>
>`
  width: ${({ theme, buttonSize }) =>
    buttonSize === 'default' ? theme.iconSize.deca : theme.iconSize.centi};
  height: ${({ theme, buttonSize }) =>
    buttonSize === 'default' ? theme.iconSize.deca : theme.iconSize.centi};
  transform: ${({ buttonSize }) =>
    buttonSize === 'default' ? 'scale(1)' : 'scale(.8)'};
`;
