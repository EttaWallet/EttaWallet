import * as Keychain from 'react-native-keychain';
import Logger from './logger';
import { IResponse } from './types';
import { Result, err, ok } from './result';

const TAG = 'storage/keychain';

interface SecureStorage {
  key: string;
  value: string;
  options?: Keychain.Options;
}

// the user cancelled error strings are OS specific
const KEYCHAIN_USER_CANCELLED_ERRORS = [
  'user canceled the operation',
  'error: code: 13, msg: cancel',
  'error: code: 10, msg: fingerprint operation canceled by the user',
];

const USER = 'ettaln';

export const BIOMETRY_VERIFICATION_DELAY = 800;

export function isUserCancelledError(error: Error) {
  return KEYCHAIN_USER_CANCELLED_ERRORS.some((userCancelledError) =>
    error.toString().toLowerCase().includes(userCancelledError)
  );
}

export const retrieveStoredItem = async (key: string): Promise<string | null> => {
  try {
    const credentials = await Keychain.getInternetCredentials(key);
    if (credentials) {
      return credentials.password;
    } else {
      return null;
    }
  } catch (error: any) {
    if (!isUserCancelledError(error)) {
      // user cancelled action
      Logger.error(TAG, 'Error retrieving stored item', error, true);
    }
    throw error;
  }
};

export const removeStoredItem = async (key: string) => {
  try {
    return await Keychain.resetInternetCredentials(key);
  } catch (error: any) {
    Logger.error(TAG, 'Error clearing item', error, true);
    throw error;
  }
};

export const storeKeychainItem = async ({
  key = '',
  value = '',
  options = {},
}: SecureStorage): Promise<IResponse<string>> => {
  try {
    await Keychain.setGenericPassword(USER, value, {
      service: key,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      rules: Keychain.SECURITY_RULES.NONE,
      ...options,
    });

    // check that we can correctly read the keychain before proceeding
    const retrievedResult = await retrieveStoredKeychainItem(key);
    if (retrievedResult !== value) {
      await removeStoredItem(key);
      Logger.error(
        `${TAG}@storeItem`,
        `Retrieved value for key '${key}' does not match stored value`
      );
      throw new Error(`Retrieved value for key '${key}' does not match stored value`);
    }

    return { error: false, data: '' };
  } catch (error: any) {
    return { error: true, data: error };
  }
};

export async function retrieveStoredKeychainItem(key: string, options: Keychain.Options = {}) {
  try {
    const item = await Keychain.getGenericPassword({
      service: key,
      ...options,
    });
    if (!item) {
      return null;
    }
    return item.password;
  } catch (error: any) {
    if (!isUserCancelledError(error)) {
      // triggered when biometry verification fails and user cancels the action
      Logger.error(TAG, 'Error retrieving stored item', error, true);
    }
    throw error;
  }
}

export async function removeStoredKeychainItem(key: string) {
  try {
    return Keychain.resetGenericPassword({
      service: key,
    });
  } catch (error: any) {
    Logger.error(TAG, 'Error clearing item', error, true);
    throw error;
  }
}

export async function listStoredKeychainItems() {
  try {
    return Keychain.getAllGenericPasswordServices();
  } catch (error: any) {
    Logger.error(TAG, 'Error listing items', error, true);
    throw error;
  }
}

/**
 * Returns an array of all known Keychain keys.
 * @returns {Promise<string[]>}
 */
export const getAllKeychainKeys = async (): Promise<string[]> => {
  return await Keychain.getAllGenericPasswordServices();
};

/**
 * Wipe the value of key specified in keychain store
 * @returns {Promise<string[]>}
 */
export const resetKeychainValue = async ({ key }: { key: string }): Promise<Result<boolean>> => {
  try {
    const result = await Keychain.resetGenericPassword({ service: key });
    return ok(result);
  } catch (e) {
    console.log(e);
    return err(e);
  }
};

/**
 * Wipes all known device keychain data.
 * @returns {Promise<void>}
 */
export const wipeEntireKeychain = async (): Promise<void> => {
  const allServices = await getAllKeychainKeys();
  await Promise.all(
    allServices.map((key) => {
      resetKeychainValue({ key });
    })
  );
};
