import { Animated, Easing } from 'react-native';

const ANIMATION_SPEED = 140;

export const transitionSwitch = (
  active: boolean,
  translate: number,
  transitionValue: Animated.Value,
  animatedColor: Animated.Value
): void => {
  if (translate <= 0) return;

  if (active) {
    Animated.timing(transitionValue, {
      toValue: translate,
      duration: ANIMATION_SPEED,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
    Animated.timing(animatedColor, {
      toValue: 1,
      duration: ANIMATION_SPEED,
      useNativeDriver: false,
    }).start();
    return;
  }

  Animated.timing(transitionValue, {
    toValue: 0,
    duration: ANIMATION_SPEED,
    easing: Easing.out(Easing.ease),
    useNativeDriver: true,
  }).start();
  Animated.timing(animatedColor, {
    toValue: 0,
    duration: ANIMATION_SPEED,
    useNativeDriver: false,
  }).start();
};
