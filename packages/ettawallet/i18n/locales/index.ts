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
    name: 'English',
    get strings() {
      return {
        translation: require('./base/translation.json'),
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
