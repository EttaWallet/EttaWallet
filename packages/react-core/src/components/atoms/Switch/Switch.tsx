import { useTheme } from '@emotion/react';
import React, { FC, useCallback, useEffect } from 'react';
import {
  Animated,
  LayoutChangeEvent,
  StyleProp,
  ViewStyle,
} from 'react-native';
import {
  ColorGradationType,
  ColorType,
  ThemeProp,
} from '../../../types/defaults';
import {
  extractNumbersFromString,
  lightenDarkenColor,
  RFValueStr,
} from '../../../utils';
import { PressableSurface } from '../PressableSurface';
import { transitionSwitch } from './animation';
import { StyledSwitch, StyledSwitchContent, SWITCH_PIN_WIDTH } from './styled';

export interface SwitchProps {
  onChange: (active: boolean) => void;
  active: boolean;
  activeColor?: ColorType;
  activeColorTone?: ColorGradationType;
  inactiveColor?: ColorType;
  inactiveColorTone?: ColorGradationType;
  style?: StyleProp<ViewStyle>;
  dotStyle?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

const Switch: FC<SwitchProps> = ({
  onChange,
  activeColor = 'primary',
  activeColorTone = 'orange',
  inactiveColor = 'secondary',
  inactiveColorTone = 'light',
  active,
  dotStyle,
  disabled = false,
  ...rest
}): JSX.Element => {
  const theme = useTheme() as ThemeProp;

  const width = React.useRef(0);
  const transitionValue = React.useRef(new Animated.Value(0)).current;
  const animatedColor = React.useRef(new Animated.Value(0)).current;

  const calculateTranslate = () => {
    if (width.current > 0) {
      return (
        width.current -
        extractNumbersFromString(theme.spacing.micro) * 2 -
        extractNumbersFromString(RFValueStr(SWITCH_PIN_WIDTH))
      );
    }
    return 0;
  };

  const getBackgroundColor = (color: string) => {
    return disabled
      ? lightenDarkenColor(theme.color[inactiveColor][inactiveColorTone], 20)
      : color;
  };

  const interpolateColor = animatedColor.interpolate({
    inputRange: [0, 1],
    outputRange: [
      getBackgroundColor(theme.color[inactiveColor][inactiveColorTone]),
      getBackgroundColor(theme.color[activeColor][activeColorTone]),
    ],
  });

  useEffect(() => {
    const translate = calculateTranslate();
    transitionSwitch(active, translate, transitionValue, animatedColor);
  }, [active]);

  const handleChange = useCallback(() => {
    onChange(!active);
  }, [active, onChange]);

  const handleSwitchLayout = (lce: LayoutChangeEvent) => {
    width.current = lce.nativeEvent.layout.width;
    const translate = calculateTranslate();
    transitionSwitch(active, translate, transitionValue, animatedColor);
  };

  return (
    <PressableSurface
      {...rest}
      onPress={handleChange}
      effect="none"
      disabled={disabled}
    >
      <StyledSwitchContent
        onLayout={handleSwitchLayout}
        style={{ backgroundColor: interpolateColor }}
      >
        <StyledSwitch
          style={[dotStyle, { transform: [{ translateX: transitionValue }] }]}
        />
      </StyledSwitchContent>
    </PressableSurface>
  );
};

export default Switch;
