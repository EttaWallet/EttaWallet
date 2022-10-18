import { ButtonStateProps, Error as CoreError } from '@ettawallet/react-core';
import React, { FC } from 'react';
import { Text } from '../../Text';

export const Error: FC<ButtonStateProps> = props => {
  return <CoreError {...props} textComponent={Text} />;
};

export default Error;
