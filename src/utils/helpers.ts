import { Platform, Linking } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import Logger from './logger';
import { APP_STORE_ID } from '../../config';
import { Err, Ok, Result } from 'ts-results';

export const stringToBoolean = (inputString: string): boolean => {
  const lowercasedInput = inputString.toLowerCase().trim();
  if (lowercasedInput === 'true') {
    return true;
  } else if (lowercasedInput === 'false') {
    return false;
  }
  throw new Error(`Unable to parse '${inputString}' as boolean`);
};

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
/**
 * Simple async sleeper function
 *
 * @param ms {number} Milliseconds to sleep
 * @returns {Promise<Promise<*> | Promise<*>>}
 */
export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export async function resultifyAsync<T>(f: () => Promise<T>): Promise<Result<T, Error>> {
  try {
    return Ok(await f());
  } catch (e) {
    if (e instanceof Error) {
      return Err(e);
    } else {
      throw new Error(`${e} is not an instance of Error -- this should not happen`);
    }
  }
}

export function resultify<T>(f: () => T): Result<T, Error> {
  try {
    return Ok(f());
  } catch (e) {
    if (e instanceof Error) {
      return Err(e);
    } else {
      throw new Error(`${e} is not an instance of Error -- this should not happen`);
    }
  }
}
