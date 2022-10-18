import React, { FC } from 'react';
import { ButtonStateProps } from '../Button';
import { BaseState } from './BaseState';

export const Success: FC<ButtonStateProps> = props => {
  return <BaseState {...props} icon="checkmark-circle-outline" />;
};

export default Success;
