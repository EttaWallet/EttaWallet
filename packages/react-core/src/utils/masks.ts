// NOTE: Add here all individually utils, then you can use it on input components everywhere.
import { extractDigitsFromString } from './extractNumbersFromString';

export const Masks = {
  CPF: ['999.999.999-99'],
  CNPJ: ['99.999.999/9999-99'],
  DATE: ['99/99/9999'],
  MONTH_YEAR: ['99/9999'],
  CEP: ['99999-999'],
  PHONE: ['(99) 9999-9999'],
  PHONE_EXTENDED: ['(99) 99999-9999'],
  COMBINED_PHONE: (value: string) => {
    const onlyNumbers = extractDigitsFromString(value);
    // Value is number extended, but without mask.
    const isCellPhoneExtended = onlyNumbers.length === 11;

    // Value in formatted mode
    return value?.length <= 14 && !isCellPhoneExtended
      ? Masks.PHONE
      : Masks.PHONE_EXTENDED;
  },
  COMBINED_CPF_CNPJ: (value: string) =>
    value?.length <= 14 ? Masks.CPF : Masks.CNPJ,
};
