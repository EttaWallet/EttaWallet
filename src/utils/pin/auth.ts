import * as Keychain from 'react-native-keychain';
import { PinType } from '../types';
import i18n from '../../i18n';
import { navigate, navigateBack } from '../../navigation/NavigationService';
import { Screens } from '../../navigation/Screens';
import {
  clearPasswordCaches,
  getCachedPasswordHash,
  getCachedPepper,
  getCachedPin,
  setCachedPasswordHash,
  setCachedPepper,
  setCachedPin,
} from './PasswordCache';
import {
  isUserCancelledError,
  removeStoredItem,
  retrieveStoredKeychainItem,
  storeKeychainItem,
} from '../keychain';
import Logger from '../logger';
import { sleep } from '../helpers';
import { useStoreState } from '../../state/hooks';
import { generateSecureRandom } from 'react-native-securerandom';
import { sha256, sha256Bytes } from 'react-native-sha256';

const TAG = 'pincode/authentication';

const PIN_STORAGE_KEY = 'PIN';
const PEPPER_STORAGE_KEY = 'PEPPER';
const PASSWORD_HASH_STORAGE_KEY = 'PASSWORD_HASH';

export const PIN_LENGTH = 6;
export const DEFAULT_CACHE_ACCOUNT = 'etta';
export const CANCELLED_PIN_INPUT = 'CANCELLED_PIN_INPUT';
export const BIOMETRY_VERIFICATION_DELAY = 800;

const PIN_BLOCKLIST = [
  '000000',
  '111111',
  '222222',
  '333333',
  '444444',
  '555555',
  '666666',
  '777777',
  '888888',
  '999999',
  '123456',
  '654321',
];

export function isPinValid(pin: string) {
  return /^\d{6}$/.test(pin) && !PIN_BLOCKLIST.includes(pin);
}

function storePinWithBiometry(pin: string) {
  return storeKeychainItem({
    key: PIN_STORAGE_KEY,
    value: pin,
    options: {
      accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      authenticationType: Keychain.AUTHENTICATION_TYPE.BIOMETRICS,
      securityLevel: Keychain.SECURITY_LEVEL.SECURE_SOFTWARE,
    },
  });
}

export function removeStoredPin() {
  return removeStoredItem(PIN_STORAGE_KEY);
}

type PinCallback = (pin: string) => void;

export async function setPincodeWithBiometry() {
  let pin = getCachedPin(DEFAULT_CACHE_ACCOUNT);
  // let pinCache: any = mmkvStorage.getItem(StorageItem.pinCache);
  // let pin = pinCache[DEFAULT_CACHE_ACCOUNT].secret;
  if (!pin) {
    pin = await requestPincodeInput(true, true);
  }

  try {
    // storeItem can be called multiple times with the same key, so stale keys
    // from previous app installs/failed save attempts will be overwritten
    // safely here
    await storePinWithBiometry(pin);
    // allow native biometry verification animation to run fully
    await sleep(BIOMETRY_VERIFICATION_DELAY);
  } catch (error) {
    Logger.warn(TAG, 'Failed to save pin with biometry', error);
    throw error;
  }
}

export async function getPincodeWithBiometry() {
  try {
    const retrievedPin = await retrieveStoredKeychainItem(PIN_STORAGE_KEY, {
      // only displayed on Android - would be displayed on iOS too if we allow
      // device pincode fallback
      authenticationPrompt: {
        title: i18n.t('unlockWithBiometryPrompt')!,
      },
    });
    if (retrievedPin) {
      setCachedPin(DEFAULT_CACHE_ACCOUNT, retrievedPin);
      // allow native biometry verification animation to run fully
      await sleep(BIOMETRY_VERIFICATION_DELAY);
      return retrievedPin;
    }
    throw new Error('Failed to retrieve pin with biometry, recieved null value');
  } catch (error) {
    Logger.warn(TAG, 'Failed to retrieve pin with biometry', error);
    throw error;
  }
}

// Retrieve the pincode value
// May trigger the pincode enter screen
export const getPincode = async (withVerification = true) => {
  const cachedPin = getCachedPin(DEFAULT_CACHE_ACCOUNT);
  if (cachedPin) {
    return cachedPin;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const pincodeType = useStoreState((state) => state.nuxt.pincodeType);
  if (pincodeType === PinType.Device) {
    try {
      const retrievedPin = await getPincodeWithBiometry();
      return retrievedPin;
    } catch (error: any) {
      // do not return here, the pincode input is the user's fallback if
      // biometric auth fails
      if (!isUserCancelledError(error)) {
        Logger.warn(TAG, 'Failed to retrieve pin with biometry', error);
      }
    }
  }

  const pin = await requestPincodeInput(withVerification, true);
  return pin;
};

// Navigate to the pincode enter screen and check pin
export async function requestPincodeInput(
  withVerification = true,
  shouldNavigateBack = true,
  account?: string
) {
  const pin = await new Promise((resolve: PinCallback, reject: (error: string) => void) => {
    navigate(Screens.EnterPinScreen, {
      onSuccess: resolve,
      onCancel: () => reject(CANCELLED_PIN_INPUT),
      withVerification,
      account,
    });
  });

  if (shouldNavigateBack) {
    navigateBack();
  }

  if (!pin) {
    throw new Error('Pincode confirmation returned empty pin');
  }

  setCachedPin(DEFAULT_CACHE_ACCOUNT, pin);
  return pin;
}

export async function retrieveOrGeneratePepper(account = DEFAULT_CACHE_ACCOUNT) {
  if (!getCachedPepper(account)) {
    let storedPepper = await retrieveStoredKeychainItem(PEPPER_STORAGE_KEY);
    if (!storedPepper) {
      const randomBytes = await generateSecureRandom(64);
      const pepper = sha256Bytes(randomBytes).toString();
      await storeKeychainItem({ key: PEPPER_STORAGE_KEY, value: pepper });
      storedPepper = pepper;
    }
    setCachedPepper(account, storedPepper);
  }
  return getCachedPepper(account)!;
}

async function getPasswordForPin(pin: string) {
  const pepper = await retrieveOrGeneratePepper();
  const password = `${pepper}${pin}`;
  return password;
}

async function getPasswordHashForPin(pin: string) {
  const password = await getPasswordForPin(pin);
  return getPasswordHash(password);
}

function getPasswordHash(password: string) {
  //sha256 hashing
  const hash = sha256(password);
  return hash.toString();
}

async function retrievePasswordHash(account: string) {
  if (!getCachedPasswordHash(account)) {
    let hash: string | null = null;
    try {
      hash = await retrieveStoredKeychainItem(PASSWORD_HASH_STORAGE_KEY);
    } catch (err: any) {
      Logger.error(`${TAG}@retrievePasswordHash`, 'Error retrieving hash', err, true);
      return null;
    }
    if (!hash) {
      Logger.warn(`${TAG}@retrievePasswordHash`, 'No password hash found in store');
      return null;
    }
    setCachedPasswordHash(account, hash);
  }
  return getCachedPasswordHash(account);
}

// Confirm pin is correct by checking it against the stored password hash
export async function checkPin(pin: string, account: string) {
  const hashForPin = await getPasswordHashForPin(pin);
  const correctHash = await retrievePasswordHash(account);

  return hashForPin === correctHash;
}

export const updatePin = async (newPin: string) => {
  try {
    clearPasswordCaches();
    setCachedPin(DEFAULT_CACHE_ACCOUNT, newPin);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const pincodeType = useStoreState((state) => state.nuxt.pincodeType);
    if (pincodeType === PinType.Device) {
      await storePinWithBiometry(newPin);
    }
    return true;
  } catch (error: any) {
    Logger.error(`${TAG}@updatePin`, 'Error updating pin', error);
    return false;
  }
};

export async function removeAccountLocally() {
  clearPasswordCaches();
  return Promise.all([removeStoredItem(PIN_STORAGE_KEY)]);
}
