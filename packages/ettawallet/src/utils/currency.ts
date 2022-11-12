import BigNumber from 'bignumber.js';

// should stay in alphabetical order
export enum LocalCurrencyCode {
  GHS = 'GHS',
  KES = 'KES',
  NGN = 'NGN',
  RWF = 'RWF',
  UGX = 'UGX',
  USD = 'USD',
  XAF = 'XAF',
  ZAR = 'ZAR',
}

export enum LocalCurrencySymbol {
  GHS = 'GH₵',
  KES = 'KSh',
  NGN = '₦',
  RWF = 'FRw',
  UGX = 'UGX',
  USD = '$',
  XAF = 'FCFA',
  ZAR = 'R',
}

export const LOCAL_CURRENCY_CODES = Object.values(LocalCurrencyCode);

// Given that the US dollar is the base currency against which btc price is measured:
export function useLocalToBtcAmount(localAmount: BigNumber): BigNumber | null {
  const btcUSDPrice = 20726.1; // gets the current price of bitcoin in USD e.g 1 BTC = $20,700
  const usdExchangeRate = 3786; // checks the preffered/default currency exchange rate to the dollar i.e $1 = xx UGX
  if (!btcUSDPrice || !usdExchangeRate) {
    return null;
  }

  return localAmount.dividedBy(usdExchangeRate).dividedBy(btcUSDPrice);
}

export function useBtcToLocalAmount(btcAmount: BigNumber): BigNumber | null {
  const btcUSDPrice = 20726.1; // api call?
  const usdExchangeRate = 3786; // api call?
  if (!btcUSDPrice || !usdExchangeRate) {
    return null;
  }

  return btcAmount.multipliedBy(btcUSDPrice).multipliedBy(usdExchangeRate);
}

export const getCurrencySymbol = (currency: string) => {
  return LocalCurrencySymbol[currency];
};
