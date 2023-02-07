import i18n from './index';
import Logger from '../utils/logger';
import { useEttaStorageContext } from '../storage/context';

const TAG = 'i18n/actions';

export default function useChangeLanguage() {
  const { updateLanguage } = useEttaStorageContext();

  const handleChangeLanguage = async (language: string) => {
    updateLanguage(language); // update the language in context
    return i18n
      .changeLanguage(language || '')
      .catch((reason: any) =>
        Logger.error(TAG, 'Failed to change i18n language', reason)
      );
  };

  return handleChangeLanguage;
}
