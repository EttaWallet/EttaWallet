import BigNumber from 'bignumber.js';
import { useMemo } from 'react';
import store from '../state/store';
import { DEFAULT_NUMBER_OF_DECIMALS } from '../../config';

function calculateDecimals(value: BigNumber) {
  const exponent = value?.e ?? 0;
  if (exponent >= 0) {
    return DEFAULT_NUMBER_OF_DECIMALS;
  }

  return Math.abs(exponent) + 1;
}

export function formatMoneyDisplay(value: BigNumber) {
  let decimals = calculateDecimals(value);
  let BN = value.toFormat(decimals, BigNumber.ROUND_DOWN, {
    decimalSeparator: '.',
    groupSeparator: ',',
  });
  // remove trailing zeros
  while (BN[BN.length - 1] === '0' && decimals-- > 2) {
    BN = BN.substring(0, BN.length - 1);
  }
  return BN;
}

export function convertLocalAmountToSats(
  amount: BigNumber.Value | null,
  exchangeRate: BigNumber.Value | null | undefined
) {
  if (!amount || !exchangeRate) {
    return null;
  }

  const formattedAmount = formatMoneyDisplay(
    new BigNumber(amount).multipliedBy(100000000).dividedBy(exchangeRate)
  );
  return new BigNumber(formattedAmount);
}

export function convertSatsToLocalAmount(
  amount: BigNumber.Value | null,
  exchangeRate: BigNumber.Value | null | undefined
) {
  if (!amount || !exchangeRate) {
    return null;
  }

  const formattedAmount = formatMoneyDisplay(
    new BigNumber(amount).dividedBy(100000000).multipliedBy(exchangeRate)
  );
  return new BigNumber(formattedAmount);
}

export function useLocalAmountToSats(amount: BigNumber): BigNumber | null {
  const exchangeRate = store.getState().nuxt.exchangeRate.value;
  return useMemo(() => convertLocalAmountToSats(amount, exchangeRate), [amount, exchangeRate]);
}

export function useSatsToLocalAmount(amount: BigNumber): BigNumber | null {
  const exchangeRate = store.getState().nuxt.exchangeRate.value;
  return useMemo(() => convertSatsToLocalAmount(amount, exchangeRate), [amount, exchangeRate]);
}
