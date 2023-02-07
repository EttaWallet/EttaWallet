import hoistStatics from 'hoist-non-react-statics';
import i18n, { Resource, ResourceLanguage } from 'i18next';
import _ from 'lodash';
import {
  initReactI18next,
  WithTranslation,
  withTranslation as withTranslationI18Next,
} from 'react-i18next';
import { APP_NAME, DEFAULT_APP_LANGUAGE } from '../../config';
import locales from './locales';

export const STORAGE_KEY = 'lang';

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
  let cachedTranslations: Resource = {};
  const resources = getAvailableResources(cachedTranslations);

  return i18n.use(initReactI18next).init({
    fallbackLng: {
      default: [DEFAULT_APP_LANGUAGE],
    },
    lng: language,
    resources,
    debug: false,
    interpolation: {
      escapeValue: false,
      defaultVariables: {
        appName: APP_NAME,
      },
    },
  });
}

// Create HOC wrapper that hoists statics
// https://react.i18next.com/latest/withtranslation-hoc#hoist-non-react-statics
export const withTranslation =
  <P extends WithTranslation>() =>
  <C extends React.ComponentType<P>>(component: C) =>
    hoistStatics(withTranslationI18Next()(component), component);

export default i18n;
