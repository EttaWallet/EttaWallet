/* eslint-disable @typescript-eslint/no-var-requires */
import { AppStorage } from './storage/methods';
import Biometric from './src/libs/biometrics';
import { Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
const prompt = require('./src/helpers/prompt');
const currency = require('./storage/currency');
const EttaApp = new AppStorage();
// If attempt reaches 10, a wipe keychain option will be provided to the user.
let unlockAttempt = 0;

const startAndDecrypt = async retry => {
  const { t } = useTranslation();

  console.log('startAndDecrypt');
  if (EttaApp.getWallets().length > 0) {
    console.log(
      'App already has some wallets, so we are in already started state, exiting startAndDecrypt'
    );
    return true;
  }
  let password = false;
  if (await EttaApp.storageIsEncrypted()) {
    do {
      password = await prompt(
        (retry && t('badPassword')) || t('enterPassword'),
        t('storageIsEncrypted'),
        false
      );
    } while (!password);
  }
  let success = false;
  let wasException = false;
  try {
    success = await EttaApp.loadFromDisk(password);
  } catch (error) {
    // in case of exception reading from keystore, lets retry instead of assuming there is no storage and
    // proceeding with no wallets
    console.warn('exception loading from disk:', error);
    wasException = true;
  }

  if (wasException) {
    // retrying, but only once
    try {
      await new Promise(resolve => setTimeout(resolve, 3000)); // sleep
      success = await EttaApp.loadFromDisk(password);
    } catch (error) {
      console.warn('second exception loading from disk:', error);
    }
  }

  if (success) {
    console.log('loaded from disk');
    // We want to return true to let the UnlockWith screen that its ok to proceed.
    return true;
  }

  if (password) {
    // we had password and yet could not load/decrypt
    unlockAttempt++;
    if (unlockAttempt < 10 || Platform.OS !== 'ios') {
      return startAndDecrypt(true);
    } else {
      unlockAttempt = 0;
      Biometric.showKeychainWipeAlert();
      // We want to return false to let the UnlockWith screen that it is NOT ok to proceed.
      return false;
    }
  } else {
    unlockAttempt = 0;
    // Return true because there was no wallet data in keychain. Proceed.
    return true;
  }
};

EttaApp.startAndDecrypt = startAndDecrypt;
currency.init(); // initialize currency stuff

module.exports = EttaApp;
