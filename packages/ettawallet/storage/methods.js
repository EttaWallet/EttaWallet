/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-var-requires */
import RNSecureKeyStore, { ACCESSIBLE } from 'react-native-secure-key-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ONBOARDING_SLIDES_COMPLETED,
  DEFAULT_LANGUAGE_IS_SET,
  BDK_WALLET_STORAGE_KEY,
} from './consts';

const encryption = require('./encryption');

let usedBucketNum = false;
let savingInProgress = 0;

export class AppStorage {
  static FLAG_ENCRYPTED = 'data_encrypted';
  static DO_NOT_TRACK = 'donottrack';

  constructor() {
    this.wallets = [];
    this.cachedPassword = false;
  }

  /**
   * Wrapper for storage call. Uses secure store.
   *
   * @param key
   * @param value
   * @returns {Promise<any>|Promise<any> | Promise<void> | * | Promise | void}
   */
  setItemInKeychain = (key, value) => {
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
  getItemFromKeychain = key => {
    return RNSecureKeyStore.get(key);
  };

  storageIsEncrypted = async () => {
    let data;
    try {
      data = await this.getItem(AppStorage.FLAG_ENCRYPTED);
    } catch (error) {
      console.warn(
        'error reading `' + AppStorage.FLAG_ENCRYPTED + '` key:',
        error.message
      );
      return false;
    }

    return !!data;
  };

  isPasswordInUse = async password => {
    try {
      let data = await this.getItem('data');
      data = this.decryptData(data, password);
      return !!data;
    } catch (_e) {
      return false;
    }
  };

  /**
   * Iterates through all values of `data` trying to
   * decrypt each one, and returns first one successfully decrypted
   *
   * @param data {string} Serialized array
   * @param password
   * @returns {boolean|string} Either STRING of storage data (which is stringified JSON) or FALSE, which means failure
   */
  decryptData(data, password) {
    data = JSON.parse(data);
    let decrypted;
    let num = 0;
    for (const value of data) {
      decrypted = encryption.decrypt(value, password);

      if (decrypted) {
        usedBucketNum = num;
        return decrypted;
      }
      num++;
    }

    return false;
  }

  decryptStorage = async password => {
    if (password === this.cachedPassword) {
      this.cachedPassword = undefined;
      await this.saveToDisk();
      this.wallets = [];
      return this.loadFromDisk();
    } else {
      throw new Error('Incorrect password. Please, try again.');
    }
  };

  encryptStorage = async password => {
    // assuming the storage is not yet encrypted
    await this.saveToDisk();
    let data = await this.getItem('data');
    // TODO: refactor ^^^ (should not save & load to fetch data)

    const encrypted = encryption.encrypt(data, password);
    data = [];
    data.push(encrypted); // putting in array as we might have many buckets with storages
    data = JSON.stringify(data);
    this.cachedPassword = password;
    await this.setItem('data', data);
    await this.setItem(AppStorage.FLAG_ENCRYPTED, '1');
  };

  /**
   * Loads from storage all wallets and
   * maps them to `this.wallets`
   *
   * @param password If present means storage must be decrypted before usage
   * @returns {Promise.<boolean>}
   */
  async loadFromDisk(password) {
    let data = await this.getItem('data');
    if (password) {
      data = this.decryptData(data, password);
      if (data) {
        // password is good, cache it
        this.cachedPassword = password;
      }
    }
    if (data !== null) {
      data = JSON.parse(data);
      if (!data.wallets) return false;
      const wallets = data.wallets;
      for (const key of wallets) {
        // deciding which type is wallet and instatiating correct object
        const tempObj = JSON.parse(key);
        let unserializedWallet; // how do we get the wallet object?
        // done
        const ID = unserializedWallet.getID();
        if (!this.wallets.some(wallet => wallet.getID() === ID)) {
          this.wallets.push(unserializedWallet);
        }
      }
      return true;
    } else {
      return false; // failed loading data or loading/decryptin data
    }
  }

  /**
   * Serializes and saves to storage object data.
   * If cached password is saved - finds the correct bucket
   * to save to, encrypts and then saves.
   *
   * @returns {Promise} Result of storage save
   */
  async saveToDisk() {
    if (savingInProgress) {
      console.warn('saveToDisk is in progress');
      if (++savingInProgress > 10)
        alert('Critical error. Last actions were not saved'); // should never happen
      await new Promise(resolve =>
        setTimeout(resolve, 1000 * savingInProgress)
      ); // sleep
      return this.saveToDisk();
    }
    savingInProgress = 1;

    try {
      const walletsToSave = [];
      for (const key of this.wallets) {
        if (typeof key === 'boolean') continue;
        key.prepareForSerialization();
        delete key.current;
        const keyCloned = Object.assign({}, key); // stripped-down version of a wallet to save to secure keystore

        walletsToSave.push(
          JSON.stringify({ ...keyCloned, type: keyCloned.type })
        );
      }
      let data = {
        wallets: walletsToSave,
      };

      if (this.cachedPassword) {
        // should find the correct bucket, encrypt and then save
        let buckets = await this.getItem('data');
        buckets = JSON.parse(buckets);
        const newData = [];
        let num = 0;
        for (const bucket of buckets) {
          let decrypted;
          // if we had `usedBucketNum` during loadFromDisk(), no point to try to decode each bucket to find the one we
          // need, we just to find bucket with the same index
          if (usedBucketNum !== false) {
            if (num === usedBucketNum) {
              decrypted = true;
            }
            num++;
          } else {
            // we dont have `usedBucketNum` for whatever reason, so lets try to decrypt each bucket after bucket
            // till we find the right one
            decrypted = encryption.decrypt(bucket, this.cachedPassword);
          }

          if (!decrypted) {
            // no luck decrypting, its not our bucket
            newData.push(bucket);
          } else {
            // decrypted ok, this is our bucket
            // we serialize our object's data, encrypt it, and add it to buckets
            newData.push(
              encryption.encrypt(JSON.stringify(data), this.cachedPassword)
            );
          }
        }
        data = newData;
      }

      await this.setItem('data', JSON.stringify(data));
      await this.setItem(
        AppStorage.FLAG_ENCRYPTED,
        this.cachedPassword ? '1' : ''
      );
    } catch (error) {
      console.error('save to disk exception:', error.message);
      alert('save to disk exception: ' + error.message);
    } finally {
      savingInProgress = 0;
    }
  }

  /**
   *
   * @returns {Array.<AbstractWallet>}
   */
  getWallets = () => {
    return this.wallets;
  };

  isDoNotTrackEnabled = async () => {
    try {
      return !!(await AsyncStorage.getItem(AppStorage.DO_NOT_TRACK));
    } catch (_) {}
    return false;
  };

  setDoNotTrack = async value => {
    await AsyncStorage.setItem(AppStorage.DO_NOT_TRACK, value ? '1' : '');
  };

  /**
   * Check whether user has seen all onboarding slides once
   *
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
      return !!(await AsyncStorage.getItem(DEFAULT_LANGUAGE_IS_SET));
    } catch (_) {}
    return false;
  };

  /**
   * Check whether bdk wallet exists
   *
   */
  isDefaultWalletAvailable = async () => {
    try {
      return !!(await AsyncStorage.getItem(BDK_WALLET_STORAGE_KEY));
    } catch (_) {}
    return false;
  };

  /**
   * Simple async sleeper function
   *
   * @param ms {number} Milliseconds to sleep
   * @returns {Promise<Promise<*> | Promise<*>>}
   */
  sleep = ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };
}
