/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import * as Keychain from 'react-native-keychain';
import Logger from '../src/utils/logger';

const TAG = 'storage/keychain';
const KEYCHAIN_USER_CANCELLED_ERRORS = [
  'user canceled the operation',
  'error: code: 13, msg: cancel',
  'error: code: 10, msg: fingerprint operation canceled by the user',
];

interface SecureStorage {
  key: string;
  value: string;
  options?: Keychain.Options;
}

export function isUserCancelledError(error: Error) {
  return KEYCHAIN_USER_CANCELLED_ERRORS.some(userCancelledError =>
    error.toString().toLowerCase().includes(userCancelledError)
  );
}

export async function storeItem({ key, value, options = {} }: SecureStorage) {
  try {
    const result = await Keychain.setGenericPassword('ETTA', value, {
      service: key,
      accessible: Keychain.ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY,
      rules: Keychain.SECURITY_RULES.NONE,
      ...options,
    });
    if (result === false) {
      throw new Error('Store result false');
    }

    const retrievedResult = await retrieveStoredItem(key);
    if (retrievedResult !== value) {
      await removeStoredItem(key);
      Logger.error(
        `${TAG}@storeItem`,
        `Retrieved value for key '${key}' does not match stored value`
      );
      throw new Error(
        `Retrieved value for key '${key}' does not match stored value`
      );
    }

    return result;
  } catch (error) {
    Logger.error(TAG, 'Error storing item', error, true, value);
    throw error;
  }
}

export async function retrieveStoredItem(
  key: string,
  options: Keychain.Options = {}
) {
  try {
    const item = await Keychain.getGenericPassword({
      service: key,
      ...options,
    });
    if (!item) {
      return null;
    }
    return item.password;
  } catch (error) {
    if (!isUserCancelledError(error)) {
      Logger.error(TAG, 'Error retrieving stored item', error, true);
    }
    throw error;
  }
}

export async function removeStoredItem(key: string) {
  try {
    return Keychain.resetGenericPassword({
      service: key,
    });
  } catch (error) {
    Logger.error(TAG, 'Error clearing item', error, true);
    throw error;
  }
}

export async function listStoredItems() {
  try {
    return Keychain.getAllGenericPasswordServices();
  } catch (error) {
    Logger.error(TAG, 'Error listing items', error, true);
    throw error;
  }
}
