/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import React, { useContext } from 'react';
import { EttaStorageContext } from '../../storage/context';
import BigNumber from 'bignumber.js';
import { FiatUnit, getFiatRate } from '../models/fiatUnit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import allFiatUnits from '../models/fiatUnits.json';

const EXCHANGE_RATES_STORAGE_KEY = 'currency';

// A few assumptions
const exchangeRates = { LAST_UPDATED_ERROR: false };
let lastTimeUpdateExchangeRateWasCalled = 0;
const skipUpdateExchangeRate = false;
const LAST_UPDATED = 'LAST_UPDATED';

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

/**
 * actual function to reach api and get fresh currency exchange rate. checks LAST_UPDATED time and skips entirely
 * if called too soon (30min); saves exchange rate (with LAST_UPDATED info) to storage.
 * should be called when app thinks its a good time to refresh exchange rate
 *
 * @return {Promise<void>}
 */
async function updateExchangeRate() {
  const { prefferedCurrency } = useContext(EttaStorageContext);

  if (skipUpdateExchangeRate) return;
  if (+new Date() - lastTimeUpdateExchangeRateWasCalled <= 10 * 1000) {
    // simple debounce so theres no race conditions
    return;
  }
  lastTimeUpdateExchangeRateWasCalled = +new Date();

  if (+new Date() - exchangeRates[LAST_UPDATED] <= 30 * 60 * 1000) {
    // not updating too often
    return;
  }
  console.log('updating exchange rate...');

  let rate;
  try {
    rate = await getFiatRate(prefferedCurrency);
    exchangeRates[LAST_UPDATED] = +new Date();
    exchangeRates['BTC_' + prefferedCurrency] = rate;
    exchangeRates.LAST_UPDATED_ERROR = false;
    await AsyncStorage.setItem(
      EXCHANGE_RATES_STORAGE_KEY,
      JSON.stringify(exchangeRates)
    );
  } catch (Err) {
    console.log('Error encountered when attempting to update exchange rate...');
    console.warn(Err.message);
    const rate = JSON.parse(
      await AsyncStorage.getItem(EXCHANGE_RATES_STORAGE_KEY)
    );
    rate.LAST_UPDATED_ERROR = true;
    exchangeRates.LAST_UPDATED_ERROR = true;
    await AsyncStorage.setItem(
      EXCHANGE_RATES_STORAGE_KEY,
      JSON.stringify(rate)
    );
    throw Err;
  }
}

export const useSatsToLocalAmount = (
  amountInSats: BigNumber,
  format = true
) => {
  const { prefferedCurrency } = useContext(EttaStorageContext);

  const rate = BigNumber(16200); // @TODO: This is the BTC-USD rate, we should get rate based on preffered fiat currency unit.

  let localFiatValue = new BigNumber(amountInSats)
    .dividedBy(100000000)
    .multipliedBy(rate)
    .multipliedBy(3700); // @TODO: This is the USD-UGX rate, we should get rate based on logic.

  if (
    localFiatValue.isGreaterThanOrEqualTo(0.005) ||
    localFiatValue.isLessThanOrEqualTo(-0.005)
  ) {
    localFiatValue = BigNumber(localFiatValue.toFixed(2));
  } else {
    localFiatValue = BigNumber(localFiatValue.toPrecision(2));
  }

  if (format === false) return localFiatValue;

  let formatter;
  try {
    // find matching currency object from scoped Fiat units
    const matchingFiatUnit = Object.keys(allFiatUnits).find(
      key => key === prefferedCurrency
    );

    let preferredFiatCurrency;

    switch (matchingFiatUnit) {
      case 'UGX':
        preferredFiatCurrency = FiatUnit.UGX;
        break;
      case 'USD':
        preferredFiatCurrency = FiatUnit.USD;
        break;
      case 'KES':
        preferredFiatCurrency = FiatUnit.KES;
        break;
      case 'GHS':
        preferredFiatCurrency = FiatUnit.GHS;
        break;
      case 'NGN':
        preferredFiatCurrency = FiatUnit.NGN;
        break;
      case 'TZS':
        preferredFiatCurrency = FiatUnit.TZS;
        break;
      case 'RWF':
        preferredFiatCurrency = FiatUnit.RWF;
        break;
      case 'ZAR':
        preferredFiatCurrency = FiatUnit.ZAR;
        break;
      default:
        preferredFiatCurrency = FiatUnit.UGX;
    }

    formatter = new Intl.NumberFormat(preferredFiatCurrency.locale, {
      style: 'currency',
      currency: preferredFiatCurrency.endPointKey,
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    });
  } catch (error) {
    console.warn(error);
    console.log(error);
    // fallback to USD if anything amiss
    formatter = new Intl.NumberFormat(FiatUnit.USD.locale, {
      style: 'currency',
      currency: FiatUnit.USD.endPointKey,
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    });
  }

  return formatter.format(localFiatValue);
};

export const getCurrencySymbol = (currency: string) => {
  return LocalCurrencySymbol[currency];
};
