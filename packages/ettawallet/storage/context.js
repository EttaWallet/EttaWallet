/* eslint-disable @typescript-eslint/no-var-requires */
import React, { createContext, useState, useEffect } from 'react';
import BdkRn from 'bdk-rn';
import { PincodeType } from '../src/utils/types';
import AsyncStorage, {
  useAsyncStorage,
} from '@react-native-async-storage/async-storage';
import { FiatUnit } from '../src/models/fiatUnit';
const EttaApp = require('../EttaApp');
const currency = require('./currency');
import { LANG_STORAGE_KEY } from '../i18n/useChangeLanguage';

export const EttaStorageContext = createContext();

export const MNEMONIC_STORAGE_KEY = '@seed';
export const BDK_WALLET_STORAGE_KEY = '@wallet0';

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
  const [language, _setLanguage] = useState();
  const getLanguageAsyncStorage = useAsyncStorage(LANG_STORAGE_KEY).getItem;
  const [showRecoveryPhraseInSettings, setShowRecoveryPhraseInSettings] =
    useState(true);
  const [prefferedCurrency, _setPreferredCurrency] = useState(FiatUnit.USD); // This is Fiat btw
  const getPreferredCurrencyAsyncStorage = useAsyncStorage(
    currency.PREFERRED_CURRENCY
  ).getItem;
  const [btcCurrency, setBtcCurrency] = useState('BTC'); // BTC, sats?

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
      saveToDisk;
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

  const getPreferredCurrency = async () => {
    const item = await getPreferredCurrencyAsyncStorage();
    _setPreferredCurrency(item);
  };

  const setPreferredCurrency = () => {
    getPreferredCurrency();
  };

  const getLanguage = async () => {
    const item = await getLanguageAsyncStorage();
    _setLanguage(item);
  };

  const setLanguage = () => {
    getLanguage();
  };

  useEffect(() => {
    getPreferredCurrency();
    getLanguageAsyncStorage();
  }, []);

  const resetWallets = () => {
    setWallets(EttaApp.getWallets());
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
  const getItem = EttaApp.getItem;
  const setItem = EttaApp.setItem;

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
        setItem,
        getItem,
        isStorageEncrypted,
        encryptStorage,
        startAndDecrypt,
        cachedPassword,
        sleep,
        resetWallets,
        decryptStorage,
        isPasswordInUse,
        pinType,
        connected,
        manualBackupCompleted,
        setManualBackupComplete,
        setLanguage,
        language,
        showRecoveryPhraseInSettings,
        minRequiredVersion,
        setMinRequiredVersion,
        completedOnboardingSlides,
        setCompletedOnboardingSlides,
        prefferedCurrency,
        setPreferredCurrency,
        btcCurrency,
        setBtcCurrency,
        biometricsEnabled,
        setBiometricsEnabled,
        supportedBiometrics,
        setSupportedBiometrics,
        setDoNotTrack,
        isDoNotTrackEnabled,
      }}
    >
      {children}
    </EttaStorageContext.Provider>
  );
};
