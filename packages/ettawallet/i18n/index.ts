import i18n, { Resource, ResourceLanguage } from 'i18next';
import _ from 'lodash';
import {
  initReactI18next,
  WithTranslation,
  withTranslation as withTranslationI18Next,
} from 'react-i18next';
import { APP_NAME, DEFAULT_APP_LANGUAGE } from '../src/config';
import locales from './locales';

function getAvailableResources(cachedTranslations: Resource) {
  const resources: Resource = {};
  for (const [language, value] of Object.entries(locales)) {
    let translation: ResourceLanguage;
    Object.defineProperty(resources, language, {
      get: () => {
        if (!translation) {
          // prioritise bundled translations over OTA translations in dev mode
          // so that copy updates can be surfaced
          translation = __DEV__
            ? _.merge(cachedTranslations[language], value!.strings.translation)
            : _.merge(value!.strings.translation, cachedTranslations[language]);
        }
        return { translation };
      },
      enumerable: true,
    });
  }
  return resources;
}
export async function initI18n(language: string) {
  const cachedTranslations: Resource = {};
  const resources = getAvailableResources(cachedTranslations);

  return i18n.use(initReactI18next).init({
    fallbackLng: {
      default: [DEFAULT_APP_LANGUAGE],
    },
    lng: language,
    resources,
    // Only enable for debugging as it forces evaluation of all our lazy loaded locales
    // and prints out all strings when initializing
    debug: false,
    interpolation: {
      escapeValue: false,
      defaultVariables: {
        appName: APP_NAME,
      },
    },
  });
}

export const withTranslation =
  <P extends WithTranslation>() =>
  <C extends React.ComponentType<P>>(component: C) =>
    withTranslationI18Next()(component);

export default i18n;
