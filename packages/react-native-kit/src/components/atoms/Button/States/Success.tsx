import {
  ButtonStateProps,
  Success as CoreSuccess,
} from '@ettawallet/react-core';
import React, { FC } from 'react';
import { Text } from '../../Text';

export const Success: FC<ButtonStateProps> = props => {
  return <CoreSuccess {...props} textComponent={Text} />;
};

export default Success;
