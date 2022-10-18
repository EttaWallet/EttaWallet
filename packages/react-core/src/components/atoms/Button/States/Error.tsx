import React, { FC } from 'react';
import { ButtonStateProps } from '../Button';
import { BaseState } from './BaseState';

export const Error: FC<ButtonStateProps> = props => {
  return <BaseState {...props} icon="close-circle-outline" />;
};

export default Error;
