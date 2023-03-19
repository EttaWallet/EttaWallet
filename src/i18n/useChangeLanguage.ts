import i18n from './index';
import Logger from '../utils/logger';
import { useStoreActions } from '../state/hooks';

const TAG = 'i18n/actions';

export default function useChangeLanguage() {
  const setAppLanguage = useStoreActions((action) => action.nuxt.saveLanguage);

  const handleChangeLanguage = async (language: string) => {
    setAppLanguage(language); // update the language in state
    return i18n
      .changeLanguage(language || '')
      .catch((reason: any) => Logger.error(TAG, 'Failed to change i18n language', reason));
  };

  return handleChangeLanguage;
}
