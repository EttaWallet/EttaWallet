import locales from './locales';
import { useAsync } from 'react-async-hook';
import { findBestAvailableLanguage } from 'react-native-localize';
import { DEFAULT_APP_LANGUAGE } from '../../config';
import { initI18n } from '.';
import useChangeLanguage from './useChangeLanguage';
import { navigateToError } from '../navigation/NavigationService';
import Logger from '../utils/logger';
import { useStoreState } from '../state/hooks';

interface Props {
  loading: React.ReactNode;
  children: React.ReactNode;
}

const I18nGate = ({ loading, children }: Props) => {
  const changelanguage = useChangeLanguage();
  const language = useStoreState((state) => state.nuxt.language);
  // const language = useStoreState((state) => state.nuxt.language);
  const bestLanguage = findBestAvailableLanguage(Object.keys(locales))?.languageTag;

  const i18nInitResult = useAsync(
    async () => {
      // defaulting to en-us on hard reload via findBestAvailableLanguage.
      // @ts-ignore
      await initI18n(language || bestLanguage || DEFAULT_APP_LANGUAGE);
      if (!language && bestLanguage) {
        await changelanguage(bestLanguage);
      }
    },
    [],
    {
      onError: (error: Error | undefined) => {
        Logger.error('i18n', 'Failed init i18n', error);
        navigateToError('appInitFailed', error);
      },
    }
  );

  return i18nInitResult.loading ? (loading as JSX.Element) : (children as JSX.Element);
};

export default I18nGate;
