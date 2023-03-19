import { MMKV } from 'react-native-mmkv';
import { initializeMMKVFlipper } from 'react-native-mmkv-flipper-plugin';
import { PinType } from '../state/types';
import { collectBuildNumber, collectAppVersion } from '../utils/helpers';
import * as Keychain from 'react-native-keychain';
import Logger from '../utils/logger';
import { isNil } from 'lodash';

export const storage = new MMKV();

const TAG = 'DiskStore';

if (__DEV__) {
  initializeMMKVFlipper({ default: storage });
}

export enum StorageItem {
  navState = 'navState',
  buildNumber = 'buildNumber',
  versionNumber = 'versionNumber',
  language = 'language',
  acknowledgedDisclaimer = 'acknowledgedDisclaimer',
  pinType = 'pinType',
  pinCache = 'pinCache',
  supportedBiometry = 'supportedBiometry',
  enabledBiometrics = 'enabledBiometrics',
  skippedBiometrics = 'skippedBiometrics',
}

const mmkvStorage = {
  getItem<T>(key: StorageItem): T {
    const value = storage.getString(key);
    return value ? JSON.parse(value) || null : null;
  },
  setItem<T>(key: StorageItem, value: T) {
    storage.set(key, JSON.stringify(value));
  },
  removeItem(key: StorageItem) {
    storage.delete(key);
  },
  getAllItems() {
    const keys = storage.getAllKeys();
    return keys;
  },
  clearStorage() {
    storage.clearAll();
  },
};

// get
export const getAppVersion = async (): Promise<number> => {
  return (await mmkvStorage.getItem(StorageItem.versionNumber)) || 0;
};
export const getAppBuild = async (): Promise<number> => {
  return (await mmkvStorage.getItem(StorageItem.buildNumber)) || 0;
};
export const getDisclaimerStatus = async (): Promise<boolean> => {
  return (await mmkvStorage.getItem(StorageItem.acknowledgedDisclaimer)) || false;
};
export const getChosenLanguage = async (): Promise<string> => {
  return (await mmkvStorage.getItem(StorageItem.language)) || 'en-US';
};
export const getPinType = async (): Promise<PinType> => {
  return (await mmkvStorage.getItem(StorageItem.pinType)) || PinType.Unset;
};
export const getDeviceBiometryType = async (): Promise<Keychain.BIOMETRY_TYPE> => {
  return (await mmkvStorage.getItem(StorageItem.supportedBiometry)) || null;
};
// set
export const setAppVersion = async (version: number): Promise<void> => {
  return await mmkvStorage.setItem(StorageItem.versionNumber, version);
};
export const setAppBuild = async (version: number): Promise<void> => {
  return await mmkvStorage.setItem(StorageItem.buildNumber, version);
};
export const setSupportedBiometryType = async (): Promise<void> => {
  const supportedBiometrics = await Keychain.getSupportedBiometryType();
  return await mmkvStorage.setItem(StorageItem.supportedBiometry, supportedBiometrics);
};

export const setupApp = async () => {
  // set initial values in disk
  mmkvStorage.setItem(StorageItem.versionNumber, collectAppVersion);
  mmkvStorage.setItem(StorageItem.buildNumber, collectBuildNumber);
  // check if biometry type exists
  try {
    const storedBiometrySet = mmkvStorage.getItem(StorageItem.supportedBiometry);
    // not sure about this check. What if it's indeed null???
    if (storedBiometrySet == null) {
      // get the biometry for device and write value to disk
      const biometry = await Keychain.getSupportedBiometryType();
      if (isNil(biometry)) {
        // have to be sure here because returning null means:
        // no biometrics on device
        // user disabled biometrics access for this app
        // so what to do?? guess the pin exists so we can check for pinCodeType set
      }
      mmkvStorage.setItem(StorageItem.supportedBiometry, biometry);
    }
  } catch (error: any) {
    Logger.error(TAG, 'Error storing biometry type', error, true);
  }
};

export default mmkvStorage;
