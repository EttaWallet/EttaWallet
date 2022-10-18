import React, { FC } from 'react';
import { ViewProps } from 'react-native';
import { StyledDivider } from './styled';

export interface DividerProps extends ViewProps {
  linePosition: 'top' | 'bottom';
  noLine?: boolean;
}

const Divider: FC<DividerProps> = ({ children, ...rest }) => {
  return <StyledDivider {...rest}>{children}</StyledDivider>;
};

export default Divider;
