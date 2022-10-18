import {
  ButtonStateProps,
  Loading as CoreLoading,
} from '@ettawallet/react-core';
import React, { FC } from 'react';
import { Text } from '../../Text';

export const Loading: FC<ButtonStateProps> = props => {
  return <CoreLoading {...props} textComponent={Text} />;
};

export default Loading;
