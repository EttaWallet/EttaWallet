import styled from '@emotion/native';
import { RFValueStr, StyleProps } from '@ettawallet/react-core';
import { PressableProps, ViewProps } from 'react-native';

export const StyledView = styled.View<ViewProps & Partial<StyleProps>>`
  flex-direction: row;
  justify-content: space-between;
  padding-horizontal: ${({ theme }) => theme.spacing.deca};
  padding-bottom: ${({ theme }) => theme.spacing.kilo};
  background-color: ${({ theme }) => theme.miscellaneous.surfaceColor};
`;

export const TabContainer = styled.Pressable<
  { selected: boolean } & PressableProps & Partial<StyleProps>
>`
  flex: 1;
  margin-horizontal: ${({ theme }) => theme.spacing.mili};
  padding-top: ${({ theme }) => theme.spacing.deca};
  border-top-width: ${({ selected }) => (selected ? RFValueStr('2px') : 0)};
  border-color: ${({ theme }) => theme.color.primary.orange};
  align-items: center;
  justify-content: flex-end;
`;

export const TabContent = styled.View<ViewProps & Partial<StyleProps>>`
  aspect-ratio: 1;
  justify-content: center;
  align-items: center;
  min-height: ${RFValueStr('48px')};
  background-color: ${({ theme }) => theme.color.primary.neutral1};
  border-radius: ${({ theme }) => theme.borderRadius['mili']};
`;

export const CustomTabContent = styled.View<ViewProps & Partial<StyleProps>>``;
