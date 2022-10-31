/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { useContext } from 'react';
import sleep from 'sleep-promise';
import * as Keychain from 'react-native-keychain';
import { EttaStorageContext } from '../../storage/context';
import { generateSecureRandom } from 'react-native-securerandom';
import { PincodeType } from '../utils/types';
import { ErrorMessages } from './errors';
import { getStoredMnemonic, storeMnemonic } from './backup';
import { navigate, navigateBack } from '../navigation/NavigationService';
import {
  clearPasswordCaches,
  getCachedPassword,
  getCachedPasswordHash,
  getCachedPepper,
  getCachedPin,
  setCachedPassword,
  setCachedPasswordHash,
  setCachedPepper,
  setCachedPin,
} from './auth-cache';
import {
  isUserCancelledError,
  removeStoredItem,
  retrieveStoredItem,
  storeItem,
} from '../../storage/keychain';
import Logger from '../utils/logger';
import { UNLOCK_DURATION, PEPPER_LENGTH } from '../config';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const createHash = require('create-hash');

const getWalletAsync = () => {
  // need to build this function in a separate lib
  return null;
};

const TAG = 'pin/authentication';

enum STORAGE_KEYS {
  PEPPER = 'PEPPER',
  PASSWORD_HASH = 'PASSWORD_HASH',
  PIN = 'PIN',
  SIGNED_MESSAGE = 'SIGNED_MESSAGE',
}

// Pepper and pin not currently generalized to be per account
// Using this value in the caches
export const DEFAULT_CACHE_ACCOUNT = 'default';
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

const hashIt = s => {
  return createHash('sha256').update(s).digest().toString('hex');
};

export function isPinValid(pin: string) {
  return /^\d{6}$/.test(pin) && !PIN_BLOCKLIST.includes(pin);
}

export async function retrieveOrGeneratePepper(
  account = DEFAULT_CACHE_ACCOUNT
) {
  if (!getCachedPepper(account)) {
    let storedPepper = await retrieveStoredItem(STORAGE_KEYS.PEPPER);
    if (!storedPepper) {
      const randomBytes = await generateSecureRandom(PEPPER_LENGTH);
      const pepper = Buffer.from(randomBytes).toString('hex');
      await storeItem({ key: STORAGE_KEYS.PEPPER, value: pepper });
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
  // return sha256(Buffer.from(password, 'hex')).toString('hex');
  return hashIt(password);
}

export function passwordHashStorageKey() {
  return STORAGE_KEYS.PASSWORD_HASH;
}

function storePasswordHash(hash: string, account: string) {
  setCachedPasswordHash(account, hash);
  return storeItem({ key: passwordHashStorageKey(), value: hash });
}

function storePinWithBiometry(pin: string) {
  return storeItem({
    key: STORAGE_KEYS.PIN,
    value: pin,
    options: {
      accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      authenticationType: Keychain.AUTHENTICATION_TYPE.BIOMETRICS,
      securityLevel: Keychain.SECURITY_LEVEL.SECURE_SOFTWARE,
    },
  });
}

export async function storeSignedMessage(message: string) {
  return storeItem({
    key: STORAGE_KEYS.SIGNED_MESSAGE,
    value: message,
    options: {
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    },
  });
}

export async function retrieveSignedMessage() {
  return retrieveStoredItem(STORAGE_KEYS.SIGNED_MESSAGE);
}

export function removeStoredPin() {
  return removeStoredItem(STORAGE_KEYS.PIN);
}

async function retrievePasswordHash(account: string) {
  if (!getCachedPasswordHash(account)) {
    let hash: string | null = null;
    try {
      hash = await retrieveStoredItem(passwordHashStorageKey());
    } catch (err) {
      Logger.error(
        `${TAG}@retrievePasswordHash`,
        'Error retrieving hash',
        err,
        true
      );
      return null;
    }
    if (!hash) {
      Logger.warn(
        `${TAG}@retrievePasswordHash`,
        'No password hash found in store'
      );
      return null;
    }
    setCachedPasswordHash(account, hash);
  }
  return getCachedPasswordHash(account);
}

let passwordLock = false;
let lastPassword: string | null = null;
let lastError: any = null;

export async function getPassword(
  account: string,
  withVerification = true,
  storeHash = false
) {
  while (passwordLock) {
    await sleep(100);
    if (lastPassword) {
      return lastPassword;
    }
    if (lastError) {
      throw lastError;
    }
  }
  passwordLock = true;
  try {
    let password = getCachedPassword(account);
    if (password) {
      passwordLock = false;
      return password;
    }

    const pin = await getPincode(withVerification);
    password = await getPasswordForPin(pin);

    if (storeHash) {
      const hash = getPasswordHash(password);
      await storePasswordHash(hash, account);
    }

    setCachedPassword(account, password);
    lastPassword = password;
    return password;
  } catch (error) {
    lastError = error;
    throw error;
  } finally {
    setTimeout(() => {
      passwordLock = false;
      lastPassword = null;
      lastError = null;
    }, 500);
  }
}

type PinCallback = (pin: string) => void;

export async function setPincodeWithBiometry() {
  let pin = getCachedPin(DEFAULT_CACHE_ACCOUNT);
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
    const retrievedPin = await retrieveStoredItem(STORAGE_KEYS.PIN, {
      // only displayed on Android - would be displayed on iOS too if we allow
      // device pincode fallback
      authenticationPrompt: {
        title: 'Authenticate to unlock {{appName}}',
      },
    });
    if (retrievedPin) {
      setCachedPin(DEFAULT_CACHE_ACCOUNT, retrievedPin);
      // allow native biometry verification animation to run fully
      await sleep(BIOMETRY_VERIFICATION_DELAY);
      return retrievedPin;
    }
    throw new Error(
      'Failed to retrieve pin with biometry, recieved null value'
    );
  } catch (error) {
    Logger.warn(TAG, 'Failed to retrieve pin with biometry', error);
    throw error;
  }
}

// Retrieve the pincode value
// May trigger the pincode enter screen
export async function getPincode(withVerification = true) {
  const cachedPin = getCachedPin(DEFAULT_CACHE_ACCOUNT);
  if (cachedPin) {
    return cachedPin;
  }

  const { pinType } = useContext(EttaStorageContext);
  if (pinType === PincodeType.PhoneAuth) {
    try {
      const retrievedPin = await getPincodeWithBiometry();
      return retrievedPin;
    } catch (error) {
      // do not return here, the pincode input is the user's fallback if
      // biometric auth fails
      if (!isUserCancelledError(error)) {
        Logger.warn(TAG, 'Failed to retrieve pin with biometry', error);
      }
    }
  }

  const pin = await requestPincodeInput(withVerification, true);
  return pin;
}

// Navigate to the pincode enter screen and check pin
export async function requestPincodeInput(
  withVerification = true,
  shouldNavigateBack = true,
  account?: string
) {
  const pin = await new Promise(
    (resolve: PinCallback, reject: (error: string) => void) => {
      navigate('EnterPin', {
        onSuccess: resolve,
        onCancel: () => reject(CANCELLED_PIN_INPUT),
        withVerification,
        account,
      });
    }
  );

  if (shouldNavigateBack) {
    navigateBack();
  }

  if (!pin) {
    throw new Error('Pincode confirmation returned empty pin');
  }

  setCachedPin(DEFAULT_CACHE_ACCOUNT, pin);
  return pin;
}

// Confirm pin is correct by checking it against the stored password hash
export async function checkPin(pin: string, account: string) {
  const hashForPin = await getPasswordHashForPin(pin);
  const correctHash = await retrievePasswordHash(account);

  if (!correctHash) {
    Logger.warn(
      `${TAG}@checkPin`,
      'No password hash stored. Checking with rpcWallet instead.'
    );
    const password = await getPasswordForPin(pin);
    const unlocked = await ensureCorrectPassword(password, account);
    if (unlocked) {
      await storePasswordHash(hashForPin, account);
      return true;
    }
    return false;
  }

  return hashForPin === correctHash;
}

export async function updatePin(
  account: string,
  oldPin: string,
  newPin: string
) {
  try {
    const wallet = await getWalletAsync();
    const oldPassword = await getPasswordForPin(oldPin);
    const newPassword = await getPasswordForPin(newPin);
    const updated = await wallet.updateAccount(
      account,
      oldPassword,
      newPassword
    );
    if (updated) {
      clearPasswordCaches();
      setCachedPin(DEFAULT_CACHE_ACCOUNT, newPin);
      const hash = getPasswordHash(newPassword);
      await storePasswordHash(hash, account);
      const { pinType } = useContext(EttaStorageContext);
      if (pinType === PincodeType.PhoneAuth) {
        await storePinWithBiometry(newPin);
      }
      const phrase = await getStoredMnemonic(account, oldPassword);
      if (phrase) {
        await storeMnemonic(phrase, account, newPassword);
      } else {
        throw new Error("Couldn't find stored mnemonic");
      }
      return true;
    }
  } catch (error) {
    Logger.error(`${TAG}@updatePin`, 'Error updating pin', error);
    return false;
  }
}

// Confirm password by actually attempting to unlock the account
export async function ensureCorrectPassword(
  password: string,
  currentAccount: string
): Promise<boolean> {
  try {
    const wallet = await getWalletAsync();
    const result = await wallet.unlockAccount(
      currentAccount,
      password,
      UNLOCK_DURATION
    );
    return result;
  } catch (error) {
    Logger.error(TAG, 'Error attempting to unlock wallet', error, true);
    Logger.showError(ErrorMessages.ACCOUNT_UNLOCK_FAILED);
    return false;
  }
}

export async function removeAccountLocally() {
  clearPasswordCaches();
  return Promise.all([
    removeStoredItem(STORAGE_KEYS.PEPPER),
    removeStoredItem(passwordHashStorageKey()),
    removeStoredItem(STORAGE_KEYS.PIN),
    removeStoredItem(STORAGE_KEYS.SIGNED_MESSAGE),
  ]);
}
