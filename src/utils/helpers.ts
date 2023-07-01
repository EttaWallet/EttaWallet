import { Platform, Linking } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import Logger from './logger';
import { APP_STORE_ID } from '../../config';
import { err, ok, Result } from './result';
import store from '../state/store';
import { TContact } from './types';

export const pressableHitSlop = { top: 10, right: 10, bottom: 10, left: 10 };

// MIT License
// Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com)
// https://github.com/sindresorhus/ts-extras

export type ObjectKeys<T extends object> = `${Exclude<keyof T, symbol>}`;

/**
A strongly-typed version of `Object.keys()`.

This is useful since `Object.keys()` always returns an array of strings. This function returns a strongly-typed array of the keys of the given object.

- [Explanation](https://stackoverflow.com/questions/55012174/why-doesnt-object-keys-return-a-keyof-type-in-typescript)
- [TypeScript issues about this](https://github.com/microsoft/TypeScript/issues/45390)

*/
export const objectKeys = Object.keys as <Type extends object>(
  value: Type
) => Array<ObjectKeys<Type>>;

export const stringToBoolean = (inputString: string): boolean => {
  const lowercasedInput = inputString.toLowerCase().trim();
  if (lowercasedInput === 'true') {
    return true;
  } else if (lowercasedInput === 'false') {
    return false;
  }
  throw new Error(`Unable to parse '${inputString}' as boolean`);
};

export function maskString(item: string, maskNumber: number): string {
  const firstSlice = item.slice(0, maskNumber);
  const lastSlice = item.slice(-maskNumber);
  return `${firstSlice}...${lastSlice}`;
}

export function getErrorMessage(error: Error) {
  // This replacement is because when the error reaches here, it's been wrapped
  // by Error: multiple times
  let errorMsg = error.message || error.name || 'unknown';
  errorMsg = errorMsg.replace(/Error:/g, '');
  if (error.stack) {
    errorMsg += ' in ' + error.stack.substring(0, 100);
  }
  return errorMsg;
}

/**
 * Utility type to extract external Props of a component (respecting defaultProps)
 * See https://github.com/Microsoft/TypeScript/issues/26704
 * Usage: ExtractProps<typeof SomeComponent>
 */
export type ExtractProps<T extends keyof JSX.IntrinsicElements | React.JSXElementConstructor<any>> =
  JSX.LibraryManagedAttributes<T, React.ComponentProps<T>>;

/** App Version check */

export function compareVersion(version1: string, version2: string) {
  const v1 = version1.split('.');
  const v2 = version2.split('.');
  const k = Math.min(v1.length, v2.length);
  for (let i = 0; i < k; ++i) {
    const n1 = parseInt(v1[i], 10);
    const n2 = parseInt(v2[i], 10);
    if (n1 > n2) {
      return 1;
    }
    if (n1 < n2) {
      return -1;
    }
  }
  return v1.length === v2.length ? 0 : v1.length < v2.length ? -1 : 1;
}

export function isVersionBelowMinimum(version: string, minVersion: string): boolean {
  return compareVersion(version, minVersion) < 0;
}

// Check that version is between minVersion (included) and maxVersion (included)
export function isVersionInRange(
  version: string,
  minVersion: string | undefined,
  maxVersion: string | undefined
): boolean {
  if (minVersion && compareVersion(version, minVersion) < 0) {
    return false;
  }
  if (maxVersion && compareVersion(version, maxVersion) > 0) {
    return false;
  }
  return true;
}

export const nameCompare = (a: TContact, b: TContact) => {
  const nameA = a.alias?.toUpperCase() ?? '';
  const nameB = b.alias?.toUpperCase() ?? '';

  if (nameA > nameB) {
    return 1;
  } else if (nameA < nameB) {
    return -1;
  }
  return 0;
};

export const sortContacts = (contacts: TContact[]) => {
  return contacts?.sort(nameCompare);
};

export function navigateToURI(uri: string, backupUri?: string) {
  Logger.debug('Navigating to URI', uri);

  // We're NOT using `Linking.canOpenURL` here because we would need
  // the scheme to be added to LSApplicationQueriesSchemes on iOS
  // which is not possible for DappKit callbacks
  Linking.openURL(uri).catch((reason) => {
    Logger.debug('URI not supported', uri);
    if (backupUri) {
      Logger.debug('Trying backup URI', backupUri);
      navigateToURI(backupUri);
    } else {
      Logger.error('Error navigating to URI', reason);
    }
  });
}

export function navigateAppStore() {
  if (Platform.OS === 'android') {
    navigateToURI(`market://details?id=${DeviceInfo.getBundleId()}`);
  } else {
    navigateToURI(`https://apps.apple.com/app/id${APP_STORE_ID}`);
  }
}

export const collectBuildNumber: string = DeviceInfo.getBuildNumber();
export const collectAppVersion: string = DeviceInfo.getVersion();

export const getLocalCurrencyExchangeRate = async (): Promise<number> => {
  const localCurrency = store.getState().nuxt.localCurrency;
  let json;
  try {
    const res = await fetch(`https://api.yadio.io/convert/1/BTC/${localCurrency}`);
    json = await res.json();
  } catch (e: any) {
    throw new Error(`Could not update rate for ${localCurrency}: ${e.message}`);
  }
  let rate = json?.rate;
  if (!rate) {
    throw new Error(`Could not update rate for ${localCurrency}: data is wrong`);
  }

  rate = Number(rate);
  if (!(rate >= 0)) {
    throw new Error(`Could not update rate for ${localCurrency}: data is wrong`);
  }

  return rate;
};

export const satsToLocalCurrency = async ({ amountInSats }: { amountInSats: number }) => {
  const rate = await getLocalCurrencyExchangeRate();
  let valueInBtc = amountInSats / 100000000;
  const value = rate * valueInBtc;
  let finalValue;

  if (value >= 0.005 || value <= -0.005) {
    finalValue = value.toFixed(0);
  } else {
    finalValue = value.toPrecision(1);
  }

  return finalValue;
};

export const localCurrencyToSats = async ({ localAmount }: { localAmount: number }) => {
  const rate = await getLocalCurrencyExchangeRate();
  const value = localAmount * (100000000 / rate);

  let finalValue;

  if (value >= 0.005 || value <= -0.005) {
    finalValue = value.toFixed(0);
  } else {
    finalValue = value.toPrecision(1);
  }

  return finalValue;
};

/**
 * Simple async sleeper function
 *
 * @param ms {number} Milliseconds to sleep
 * @returns {Promise<Promise<*> | Promise<*>>}
 */
export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Sum a specific value in an array of objects.
 * @param arr
 * @param value
 */
export const reduceValue = ({
  arr = [],
  value = '',
}: {
  arr: any[];
  value: string;
}): Result<number> => {
  try {
    if (!value) {
      return err('No value specified.');
    }
    return ok(
      arr.reduce((acc, cur) => {
        return acc + Number(cur[value]);
      }, 0) || 0
    );
  } catch (e) {
    return err(e);
  }
};

const mapObject = (obj, fn) =>
  Object.keys(obj).reduce((res, key) => {
    res[key] = fn(obj[key]);
    return res;
  }, {});

const isObject = (myVar) => myVar && typeof myVar === 'object';

export const deepMap = (obj, fn) => {
  const deepMapper = (val) => (isObject(val) ? deepMap(val, fn) : fn(val));
  if (Array.isArray(obj)) {
    return obj.map(deepMapper);
  }
  if (isObject(obj)) {
    return mapObject(obj, deepMapper);
  }
  return obj;
};

export const promiseTimeout = <T>(ms: number, promise: Promise<any>): Promise<T> => {
  let id: NodeJS.Timeout | undefined;
  const timeout = new Promise((resolve) => {
    id = setTimeout(() => {
      resolve(err('Timed Out.'));
    }, ms);
  });
  return Promise.race([promise, timeout]).then((result) => {
    clearTimeout(id);
    return result;
  });
};

/**
 * Tries to resolve a Promise N times, with a delay between each attempt.
 * @param {() => Promise<T>} toTry The Promise to try to resolve.
 * @param {number} [times] The maximum number of attempts (must be greater than 0).
 * @param {number} [interval] The interval of time between each attempt in milliseconds.
 * @returns {Promise<T>} The resolution of the Promise.
 */
export async function tryNTimes<T>({
  toTry,
  times = 5,
  interval = 50,
}: {
  toTry: () => Promise<Result<T>>;
  times?: number;
  interval?: number;
}): Promise<T> {
  if (times < 1) {
    throw new Error(`Bad argument: 'times' must be greater than 0, but ${times} was received.`);
  }
  let attemptCount = 0;
  while (true) {
    try {
      const result = await toTry();
      if (result.isErr()) {
        if (++attemptCount >= times) {
          throw result.error;
        }
      } else {
        return result.value;
      }
    } catch (error) {
      if (++attemptCount >= times) {
        throw error;
      }
    }
    await sleep(interval);
  }
}
