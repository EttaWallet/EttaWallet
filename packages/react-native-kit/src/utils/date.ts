import { NativeModules, Platform } from 'react-native';
import * as dateFnsLocales from 'date-fns/locale';

export const getLocale = (): Locale => {
  let locale: string;
  if (Platform.OS === 'ios') {
    locale =
      NativeModules.SettingsManager.settings.AppleLocale ||
      NativeModules.SettingsManager.settings.AppleLanguages[0];
  } else {
    locale = NativeModules.I18nManager.localeIdentifier;
  }

  const code = locale.replace('_', '');

  return dateFnsLocales[code];
};
