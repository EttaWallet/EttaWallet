export const extractNumbersFromString = (value: string): number =>
  Number(extractDigitsFromString(value));

export const extractDigitsFromString = (value: string): string =>
  value.replace(/[^0-9]/g, '');
