import { Dimensions, Platform, StatusBar } from 'react-native';
import { extractNumbersFromString } from './extractNumbersFromString';
import { isIphoneX } from './IPhoneXHelper';

const STANDARD_SCREEN_HEIGHT = 680;

/**
 * Use this function when you want to scale a percentage number
 * to a reasonable value that will fit better on most of devices.
 *
 * @param percent
 * @returns
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const RFPercentage = (percent: number) => {
  if (Platform.OS === 'web') return percent;
  const { height, width } = Dimensions.get('window');
  const standardLength = width > height ? width : height;
  const offset =
    width > height
      ? 0
      : Platform.OS === 'ios'
      ? 78
      : StatusBar.currentHeight || 0; // iPhone X style SafeAreaView size in portrait
  const deviceHeight =
    isIphoneX() || Platform.OS === 'android'
      ? standardLength - offset
      : standardLength;
  const heightPercent = (percent * deviceHeight) / 100;
  return Math.round(heightPercent);
};

/**
 * Use this function when you want to scale a font size based on pixel unit
 * to a reasonable value that will fit better on most of devices.
 *
 * @param fontSize
 * @param standardScreenHeight
 * @returns
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const RFValue = (
  fontSize: number,
  standardScreenHeight: number = STANDARD_SCREEN_HEIGHT
) => {
  if (Platform.OS === 'web') return fontSize;
  const { height, width } = Dimensions.get('window');
  const standardLength = width > height ? width : height;
  const offset =
    width > height
      ? 0
      : Platform.OS === 'ios'
      ? 78
      : StatusBar.currentHeight || 0; // iPhone X style SafeAreaView size in portrait
  const deviceHeight =
    isIphoneX() || Platform.OS === 'android'
      ? standardLength - offset
      : standardLength;
  const heightPercent = (fontSize * deviceHeight) / standardScreenHeight;
  return Math.round(heightPercent);
};

/**
 * Same as RFValue, however you can provide string values. E.g: '10px', '-5px'.
 *
 * @param fontSize
 * @param standardScreenHeight
 * @returns
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const RFValueStr = (fontSize: string, standardScreenHeight?: number) => {
  const _fontSize = extractNumbersFromString(fontSize);
  return `${RFValue(_fontSize, standardScreenHeight)}px`;
};
