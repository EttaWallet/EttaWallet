import i18n from './index';
import Logger from '../src/utils/logger';

const TAG = 'i18n/actions';

export default function useChangeLanguage() {
  const handleChangeLanguage = async (language: string | null) => {
    return i18n
      .changeLanguage(language || '')
      .catch((reason: any) =>
        Logger.error(TAG, 'Failed to change i18n language', reason)
      );
  };

  return handleChangeLanguage;
}
