import ReactNativeHapticFeedback, { HapticOptions } from 'react-native-haptic-feedback';
import { HapticFeedbackTypes } from 'react-native-haptic-feedback';
import { getAccessibilityStore } from './helpers';

const options: HapticOptions = {
  enableVibrateFallback: false,
  ignoreAndroidSystemSettings: false,
};

/**
 * Returns whether haptics enabled or not.
 * @return {boolean}
 */
export const getHapticsStatus = (): boolean => {
  return getAccessibilityStore().hapticsEnabled;
};

const triggerHapticFeedback = (type: HapticFeedbackTypes) => {
  const hapticFeedbackEnabled = getHapticsStatus();
  if (hapticFeedbackEnabled) {
    ReactNativeHapticFeedback.trigger(type, options);
  }
};

export const cueInformativeHaptic = () => {
  triggerHapticFeedback(HapticFeedbackTypes.impactMedium);
};

export const cueSuccessHaptic = () => {
  triggerHapticFeedback(HapticFeedbackTypes.notificationSuccess);
};

export const cueErrorHaptic = () => {
  triggerHapticFeedback(HapticFeedbackTypes.notificationError);
};
