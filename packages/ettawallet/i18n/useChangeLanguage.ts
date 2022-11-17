import { useContext } from 'react';
import i18n from './index';
import Logger from '../src/utils/logger';
import { EttaStorageContext } from '../storage/context';

const TAG = 'i18n/actions';

export default function useChangeLanguage() {
  const { updateLanguage } = useContext(EttaStorageContext);

  const handleChangeLanguage = async (language: string | null) => {
    updateLanguage(language); // update the language in context
    return i18n
      .changeLanguage(language || '')
      .catch((reason: any) =>
        Logger.error(TAG, 'Failed to change i18n language', reason)
      );
  };

  return handleChangeLanguage;
}
