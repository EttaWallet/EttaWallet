/* eslint-disable max-statements, max-lines, no-underscore-dangle */

import { useTheme } from '@emotion/react';
import React, { FC, ReactElement } from 'react';
import {
  TouchableHighlight,
  StyleProp,
  ViewStyle,
  GestureResponderEvent,
} from 'react-native';
// import { ThemeProp } from '../../../types/defaults';

export type TouchableRippleColors = 'primary' | 'secondary' | 'highlight';

export interface TouchableRippleProps {
  /**
   * Children component
   */
  children?: React.ReactNode;
  /**
   * Whether to render the ripple outside the view bounds.
   */
  borderless?: boolean;
  /**
   * Ripple color: `primary` | `secondary` | `highlight`
   * @default: `primary`
   */
  color?: TouchableRippleColors;
  /*
   * Deactivates the palpable effect, will not call the callback function when pressing;
   */
  disabled?: boolean;
  /**
   * Controls if the ripple should overflow the content of not
   */
  hideOverflow?: boolean;
  /**
   * Size of the children, the ripple will have the double of this size.
   */
  size?: number;
  /**
   * Will be called as soon the ripple animation start
   */
  onPress?: () => void;
  /**
   * Function to execute on long press.
   */
  onLongPress?: (e: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
}

export const TouchableRipple: FC<TouchableRippleProps> = ({
  children,
  disabled = false,
  onPress,
  style,
  color = 'highlight',
}) => {
  // const theme = useTheme() as ThemeProp;

  // const getColor = () => getColorByName(theme, color);

  return (
    <TouchableHighlight
      style={style}
      // underlayColor={buildColorWithOpacity(getColor, getOpacityMedium, theme)}
      underlayColor="#DDDDDD"
      disabled={disabled}
      onPress={onPress}
    >
      {children}
    </TouchableHighlight>
  );
};

export default TouchableRipple;
