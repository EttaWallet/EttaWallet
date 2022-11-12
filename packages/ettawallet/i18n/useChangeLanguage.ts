import i18n from './index';
import Logger from '../src/utils/logger';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const LANG_STORAGE_KEY = 'lang';

const TAG = 'i18n/actions';

export default function useChangeLanguage() {
  const handleChangeLanguage = async (language: string | null) => {
    await AsyncStorage.setItem(LANG_STORAGE_KEY, language || ''); // save selected language to storage
    return i18n
      .changeLanguage(language || '')
      .catch((reason: any) =>
        Logger.error(TAG, 'Failed to change i18n language', reason)
      );
  };

  return handleChangeLanguage;
}
