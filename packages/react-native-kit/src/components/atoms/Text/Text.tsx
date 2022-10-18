import { TextProps } from '@ettawallet/react-core';
import React, { FC } from 'react';
import { StyledNativeText } from './styled';

export type TextNativeProps = TextProps;

const Text: FC<TextNativeProps> = ({ children, ...rest }): JSX.Element => {
  return <StyledNativeText {...rest}>{children}</StyledNativeText>;
};

export default Text;
