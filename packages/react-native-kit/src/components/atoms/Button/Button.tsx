import { Button as ButtonCore, ButtonProps } from '@ettawallet/react-core';
import React, { FC, useCallback } from 'react';
import { Keyboard } from 'react-native';

export type ButtonNativeProps = ButtonProps & {
  autoDismissKeyboard?: boolean;
};

export const Button: FC<ButtonNativeProps> = ({
  autoDismissKeyboard = true,
  onPress,
  ...others
}) => {
  const handleOnPress = useCallback(
    event => {
      autoDismissKeyboard && Keyboard.dismiss();
      onPress?.(event);
    },
    [onPress]
  );

  return <ButtonCore {...others} onPress={handleOnPress} />;
};
