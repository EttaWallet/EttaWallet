import { useContext } from 'react';
import i18n from './index';
import Logger from '../src/utils/logger';
import { EttaStorageContext } from '../storage/context';

const TAG = 'i18n/actions';

export default function useChangeLanguage() {
  const { setLanguage } = useContext(EttaStorageContext);

  const handleChangeLanguage = async (language: string | null) => {
    return i18n
      .changeLanguage(language || '')
      .catch((reason: any) =>
        Logger.error(TAG, 'Failed to change i18n language', reason)
      );

    setLanguage(language);
  };

  return handleChangeLanguage;
}
