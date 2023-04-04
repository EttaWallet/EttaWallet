interface Locales {
  [key: string]:
    | {
        name: string;
        strings: any;
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
  },
  'fr-FR': {
    name: 'French',
    get strings() {
      return {
        translation: require('./fr-FR/translation.json'),
      };
    },
  },
  'sw-SW': {
    name: 'Swahili',
    get strings() {
      return {
        translation: require('./sw-SW/translation.json'),
      };
    },
  },
};

export default locales;

export const localesList = Object.entries(locales).map(([key, value]) => {
  return { code: key, name: value!.name };
});
