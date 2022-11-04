import React, { createContext, useState } from 'react';
import BdkRn from 'bdk-rn';
import { PincodeType } from '../src/utils/types';

export const EttaStorageContext = createContext();

export const EttaStorageProvider = ({ children }) => {
  const [minRequiredVersion, setMinRequiredVersion] = useState('0.1.0');
  const [completedOnboardingSlides, setCompletedOnboardingSlides] =
    useState(false);
  const [phonePin, setPhonePin] = useState('');
  const [mnemonic, setMnemonic] = useState('');
  const [wallet, setWallet] = useState('');
  const [path, setPath] = useState("m/84'/0'/0'");
  const [pinType, setPinType] = useState(PincodeType.Unset);
  const [connected, setIsConnected] = useState(true); // True if the phone thinks it has a data connection (cellular/Wi-Fi), false otherwise. @todo
  const [backupCompleted, setBackupComplete] = useState(false);
  const [language, setLanguage] = useState('');
  const [showRecoveryPhraseInSettings, setShowRecoveryPhraseInSettings] =
    useState(true);
  const [prefferedCurrency, setPreferredCurrency] = useState('');
  const [btcCurrency, setBtcCurrency] = useState('BTC'); // BTC, sats?

  const getMnemonic = async () => {
    if (mnemonic) {
      return;
    } else {
      const { data } = await BdkRn.generateMnemonic({
        network: 'testnet',
        length: 12,
      });
      console.log(data);
      setMnemonic(data); // update mnemonic in state
      // @todo: encrypt and save the mnemonic to device
    }
  };

  const createWallet = async () => {
    const { data } = await BdkRn.createWallet({
      mnemonic: mnemonic,
      network: 'mainnet',
    });
    setWallet(data);
  };

  return (
    <EttaStorageContext.Provider
      value={{
        phonePin,
        setPhonePin,
        mnemonic,
        wallet,
        path,
        getMnemonic,
        createWallet,
        pinType,
        connected,
        backupCompleted,
        setBackupComplete,
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
      }}
    >
      {children}
    </EttaStorageContext.Provider>
  );
};
