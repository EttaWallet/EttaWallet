/* eslint-disable @typescript-eslint/no-var-requires */
import React, { createContext, useState, useEffect } from 'react';
import BdkRn from 'bdk-rn';
import { PincodeType } from '../src/utils/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FiatUnit } from '../src/models/fiatUnit';
const EttaApp = require('../EttaApp');
import {
  LANG_STORAGE_KEY,
  MNEMONIC_STORAGE_KEY,
  BDK_WALLET_STORAGE_KEY,
  DEFAULT_LANGUAGE_IS_SET,
  LOCAL_CURRENCY_KEY,
} from './consts';

export const EttaStorageContext = createContext();

export const EttaStorageProvider = ({ children }) => {
  const [minRequiredVersion, setMinRequiredVersion] = useState('0.1.0');
  const [completedOnboardingSlides, setCompletedOnboardingSlides] =
    useState(false);

  const [mnemonic, setMnemonic] = useState('');
  const [phonePin, setPhonePin] = useState('');
  const [wallets, setWallets] = useState('');
  const [pinType, setPinType] = useState(PincodeType.Unset);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [supportedBiometrics, setSupportedBiometrics] = useState(null);
  const [connected, setIsConnected] = useState(true); // True if the phone thinks it has a data connection (cellular/Wi-Fi), false otherwise. @todo
  const [manualBackupCompleted, setManualBackupComplete] = useState(false);
  const [language, setLanguage] = useState('en-US');
  const [showRecoveryPhraseInSettings, setShowRecoveryPhraseInSettings] =
    useState(true);
  const [prefferedCurrency, setPreferredCurrency] = useState(''); // This is local Fiat btw
  const [btcCurrency, setBtcCurrency] = useState('BTC'); // BTC, sats?
  const [useSatoshiUnits, setUseSatoshiUnits] = useState(false);
  const [bdkWalletBalance, setBdkWalletBalance] = useState(0);

  const getMnemonic = async () => {
    if (mnemonic) {
      return;
    } else {
      const { data } = await BdkRn.generateMnemonic({
        network: 'testnet',
        length: 12,
      });
      console.log('Seed phrase: ', data);
      setMnemonic(data);
      // @todo: encrypt and save the mnemonic to device
      try {
        const seed = JSON.stringify(data);
        await AsyncStorage.setItem(MNEMONIC_STORAGE_KEY, seed);
      } catch (e) {
        console.log('Something happened', e);
      } finally {
        await createWallet();
      }
    }
  };

  const createWallet = async () => {
    const savedMnemonic = await AsyncStorage.getItem(MNEMONIC_STORAGE_KEY);
    const { data } = await BdkRn.createWallet({
      mnemonic: JSON.parse(savedMnemonic),
      network: 'testnet',
    });
    // setWallet(data);
    console.log('Wallet: ', data);
    // @todo: encrypt and save the mnemonic to device
    try {
      const walletData = JSON.stringify(data); // needed to stringify this output prior
      await AsyncStorage.setItem(BDK_WALLET_STORAGE_KEY, walletData);
    } catch (e) {
      console.log('Something happened', e);
    } finally {
      await syncWallet();
      saveToDisk;
    }
  };

  const syncWallet = async () => {
    try {
      const { data } = await BdkRn.syncWallet();
      console.log(data); // sync status
    } catch (e) {
      console.log(e);
    }
  };

  const getBdkWalletBalance = async () => {
    try {
      const { data } = await BdkRn.getBalance();
      setBdkWalletBalance(data);
      console.info('wallet balance', data);
    } catch (e) {
      console.log(e);
    }
  };

  const saveToDisk = async (force = false) => {
    if (EttaApp.getWallets().length === 0 && !force) {
      console.log('not saving empty wallets array');
      return;
    }
    await EttaApp.saveToDisk();
    setWallets([...EttaApp.getWallets()]);
  };

  useEffect(() => {
    setWallets(EttaApp.getWallets());
  }, []);

  const updateLanguage = async lang => {
    // save to storage
    try {
      await AsyncStorage.setItem(LANG_STORAGE_KEY, lang);
      // then update current state
      setLanguage(lang);
    } catch (e) {
      console.log('Something happened', e);
    } finally {
      // set that language has been set to true in storage
      await AsyncStorage.setItem(DEFAULT_LANGUAGE_IS_SET, 'true');
      console.log(
        'user chosen language is: ',
        await AsyncStorage.getItem(LANG_STORAGE_KEY)
      );
    }
  };

  const updateLocalCurrency = async currency => {
    // save to storage
    try {
      if (currency !== prefferedCurrency) {
        const updated = await AsyncStorage.setItem(
          LOCAL_CURRENCY_KEY,
          currency
        );
        setPreferredCurrency(JSON.stringify(updated));
      }
    } catch (e) {
      console.log('Something happened', e);
    }
  };

  const getLocalCurrency = async () => {
    // save to storage
    try {
      // TODO: check whether item exists in storage first, then update
      const currency = await AsyncStorage.getItem(LOCAL_CURRENCY_KEY);
      setPreferredCurrency(currency);
    } catch (e) {
      console.log('Something happened', e);
    }
  };

  const isStorageEncrypted = EttaApp.storageIsEncrypted;
  const startAndDecrypt = EttaApp.startAndDecrypt;
  const encryptStorage = EttaApp.encryptStorage;
  const sleep = EttaApp.sleep;
  const decryptStorage = EttaApp.decryptStorage;
  const isPasswordInUse = EttaApp.isPasswordInUse;
  const cachedPassword = EttaApp.cachedPassword;
  const setDoNotTrack = EttaApp.setDoNotTrack;
  const isDoNotTrackEnabled = EttaApp.isDoNotTrackEnabled;
  const areOnboardingSlidesCompleted = EttaApp.areOnboardingSlidesCompleted;
  const isUserLanguageSet = EttaApp.isUserDefaultLanguageSet;
  const isDefaultWalletAvailable = EttaApp.isDefaultWalletAvailable;
  const getItemFromKeychain = EttaApp.getItem;
  const setItemInKeychain = EttaApp.setItem;

  return (
    <EttaStorageContext.Provider
      value={{
        mnemonic,
        phonePin,
        setPhonePin,
        wallets,
        getMnemonic,
        createWallet,
        saveToDisk,
        setItemInKeychain,
        getItemFromKeychain,
        isStorageEncrypted,
        encryptStorage,
        startAndDecrypt,
        cachedPassword,
        sleep,
        decryptStorage,
        isPasswordInUse,
        pinType,
        connected,
        manualBackupCompleted,
        setManualBackupComplete,
        setLanguage,
        updateLanguage,
        language,
        showRecoveryPhraseInSettings,
        minRequiredVersion,
        setMinRequiredVersion,
        completedOnboardingSlides,
        setCompletedOnboardingSlides,
        prefferedCurrency,
        setPreferredCurrency,
        updateLocalCurrency,
        getLocalCurrency,
        btcCurrency,
        setBtcCurrency,
        biometricsEnabled,
        setBiometricsEnabled,
        supportedBiometrics,
        setSupportedBiometrics,
        setDoNotTrack,
        isDoNotTrackEnabled,
        areOnboardingSlidesCompleted,
        isUserLanguageSet,
        isDefaultWalletAvailable,
        bdkWalletBalance,
        getBdkWalletBalance,
        useSatoshiUnits,
        setUseSatoshiUnits,
      }}
    >
      {children}
    </EttaStorageContext.Provider>
  );
};
