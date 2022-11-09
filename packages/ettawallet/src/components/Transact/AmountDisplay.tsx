import BigNumber from 'bignumber.js';
import * as React from 'react';
import { Text } from 'react-native';
import { LocalCurrencyCode, LocalCurrencySymbol } from '../../utils/currency';

const DEFAULT_DISPLAY_DECIMALS = 2;

function calculateDecimalsToShow(value: BigNumber) {
  const exponent = value?.e ?? 0;
  if (exponent >= 0) {
    return DEFAULT_DISPLAY_DECIMALS;
  }

  return Math.abs(exponent) + 1;
}

// Formats |value| so that it shows at least 2 significant figures and at least 2 decimal places without trailing zeros.
export function formatValueToDisplay(value: BigNumber) {
  let decimals = calculateDecimalsToShow(value);
  let text = value.toFormat(decimals);
  while (text[text.length - 1] === '0' && decimals-- > 2) {
    text = text.substring(0, text.length - 1);
  }
  return text;
}

const AmountDisplay = ({
  amount,
  showLocalAmount = true,
  showSymbol = true,
  showExplicitPositiveSign = false,
  hideSign = false,
  localAmount,
  style,
}) => {
  const localCurrencyExchangeRate = '3750'; // 3750 should be a function to get the local currency exchange rate
  const localCurrencySymbol = 'UGX'; // should be a function to get the local currency symbol
  const usdPrice = 20000;

  const showError = showLocalAmount
    ? !localAmount && !localCurrencyExchangeRate
    : null;

  const amountInUsd = usdPrice;
  const amountInLocalCurrency = localAmount
    ? new BigNumber(localAmount.value)
    : new BigNumber(localCurrencyExchangeRate ?? 0).multipliedBy(
        amountInUsd ?? 0
      ); // 3750 should be a function to get the local currency exchange rate
  const fiatSymbol = localAmount
    ? LocalCurrencySymbol[localAmount.currencyCode as LocalCurrencyCode]
    : localCurrencySymbol;

  const amountToShow = showLocalAmount
    ? amountInLocalCurrency
    : new BigNumber(amount);

  const sign = hideSign
    ? ''
    : amountToShow.isNegative()
    ? '-'
    : showExplicitPositiveSign
    ? '+'
    : '';

  return (
    <Text style={style}>
      {showError ? (
        '-'
      ) : (
        <>
          {sign}
          {showLocalAmount && fiatSymbol}
          {formatValueToDisplay(amountToShow.absoluteValue())}
          {!showLocalAmount && showSymbol}
        </>
      )}
    </Text>
  );
};

export default AmountDisplay;
