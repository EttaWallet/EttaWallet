import AsyncStorage from '@react-native-async-storage/async-storage';
import RNSecureKeyStore, { ACCESSIBLE } from 'react-native-secure-key-store';
import { ONBOARDING_SLIDES_COMPLETED, LANG_STORAGE_KEY } from './constants';

export class AppStorage {
  static FLAG_ENCRYPTED = 'data_encrypted';
  static DO_NOT_TRACK = 'donottrack';

  constructor() {}

  /**
   * Wrapper for storage call. Uses secure store.
   *
   * @param key
   * @param value
   * @returns {Promise<any>|Promise<any> | Promise<void> | * | Promise | void}
   */
  setItemInKeychain = (key: string, value: string) => {
    return RNSecureKeyStore.set(key, value, {
      accessible: ACCESSIBLE.WHEN_UNLOCKED,
    });
  };

  /**
   * Wrapper for storage call. Uses secure store.
   *
   * @param key
   * @returns {Promise<any>|*}
   */
  getItemFromKeychain = (key: string) => {
    return RNSecureKeyStore.get(key);
  };

  isDoNotTrackEnabled = async () => {
    try {
      return !!(await AsyncStorage.getItem(AppStorage.DO_NOT_TRACK));
    } catch (_) {}
    return false;
  };

  setDoNotTrack = async (value: number) => {
    await AsyncStorage.setItem(AppStorage.DO_NOT_TRACK, value ? '1' : '');
  };

  /**
   * Check whether user has seen all onboarding slides once
   *meth
   */
  areOnboardingSlidesCompleted = async () => {
    try {
      return !!(await AsyncStorage.getItem(ONBOARDING_SLIDES_COMPLETED));
    } catch (_) {}
    return false;
  };

  /**
   * Check whether user set a default Language at app start
   *
   */
  isUserDefaultLanguageSet = async () => {
    try {
      return !!(await AsyncStorage.getItem(LANG_STORAGE_KEY));
    } catch (e) {
      console.log('error getting language status: ', e);
    }
    return false;
  };

  /**
   * Simple async sleeper function
   *
   * @param ms {number} Milliseconds to sleep
   * @returns {Promise<Promise<*> | Promise<*>>}
   */
  sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  deleteAllKeys = async () => {
    const keys = await AsyncStorage.getAllKeys();
    try {
      await AsyncStorage.multiRemove(keys);
    } catch (e) {
      // remove error
    }
    console.log('Done');
  };
}
