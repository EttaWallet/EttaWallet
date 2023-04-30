interface Locales {
  [key: string]:
    | {
        name: string;
        strings: any;
        dateFns: Locale;
      }
    | undefined;
}

const locales: Locales = {
  'en-US': {
    name: 'English (US)',
    get strings() {
      return {
        translation: require('./base/translation.json'),
      };
    },
    get dateFns() {
      return require('date-fns/locale/en-US');
    },
  },
  'fr-FR': {
    name: 'French',
    get strings() {
      return {
        translation: require('./fr-FR/translation.json'),
      };
    },
    get dateFns() {
      return require('date-fns/locale/fr');
    },
  },
  'sw-SW': {
    name: 'Swahili',
    get strings() {
      return {
        translation: require('./sw-SW/translation.json'),
      };
    },
    get dateFns() {
      return require('date-fns/locale/en-US');
    },
  },
};

export default locales;

export const localesList = Object.entries(locales).map(([key, value]) => {
  return { code: key, name: value!.name };
});
