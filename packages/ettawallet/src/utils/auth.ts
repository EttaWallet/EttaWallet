/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import sleep from 'sleep-promise';
import {
  isUserCancelledError,
  removeStoredItem,
  retrieveStoredItem,
} from '../../storage/keychain';
import { setCachedPin } from './auth-cache';
import { navigate, navigateBack } from '../navigation/NavigationService';
import Logger from './logger';

const TAG = 'pincode/authentication';

enum STORAGE_KEYS {
  PEPPER = 'PEPPER',
  PASSWORD_HASH = 'PASSWORD_HASH',
  PIN = 'PIN',
  SIGNED_MESSAGE = 'SIGNED_MESSAGE',
}

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

export const isPinValid = pin => {
  return /^\d{6}$/.test(pin) && !PIN_BLOCKLIST.includes(pin);
};

type PinCallback = (pin: string) => void;

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

// Navigate to the pincode enter screen and check pin
export async function requestPincodeInput(
  withVerification = true,
  shouldNavigateBack = true
) {
  const pin = await new Promise(
    (resolve: PinCallback, reject: (error: string) => void) => {
      navigate(Screens.PincodeEnter, {
        onSuccess: resolve,
        onCancel: () => reject(CANCELLED_PIN_INPUT),
        withVerification,
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
