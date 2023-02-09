import React, { createContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LANG_STORAGE_KEY, DEFAULT_LANGUAGE_IS_SET } from './constants';
import { AppStorage } from './methods';

const DiskStore = new AppStorage();

interface ContextProps {
  connected: boolean;
  setIsConnected: (active: boolean) => void;
  setLanguage: (active: string) => void;
  updateLanguage: (lang: string) => void;
  language: string;
  completedOnboardingSlides: boolean;
  setCompletedOnboardingSlides: (active: boolean) => void;
  biometricsEnabled: boolean;
  setBiometricsEnabled: (active: boolean) => void;
  supportedBiometrics: string[] | null;
  setSupportedBiometrics: (active: null) => void;
  setDoNotTrack: (value: number) => void;
  isDoNotTrackEnabled: () => void;
  areOnboardingSlidesCompleted: () => Promise<boolean>;
  isUserLanguageSet: () => Promise<boolean>;
  getItemFromKeychain: (key: string) => void;
  setItemInKeychain: (key: string, value: string) => void;
}

export const EttaStorageContext = createContext<ContextProps | undefined>(undefined);

interface Props {
  children: React.ReactNode;
}

export const EttaStorageProvider: React.FC<Props> = ({ children }) => {
  const [completedOnboardingSlides, setCompletedOnboardingSlides] = useState(false);

  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [supportedBiometrics, setSupportedBiometrics] = useState(null);
  const [connected, setIsConnected] = useState(true); // True if the phone thinks it has a data connection (cellular/Wi-Fi), false otherwise. @todo
  const [language, setLanguage] = useState('en-US');

  const updateLanguage = async (lang: string) => {
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
      console.log('user chosen language is: ', await AsyncStorage.getItem(LANG_STORAGE_KEY));
    }
  };

  const setDoNotTrack = DiskStore.setDoNotTrack;
  const isDoNotTrackEnabled = DiskStore.isDoNotTrackEnabled;
  const areOnboardingSlidesCompleted = DiskStore.areOnboardingSlidesCompleted;
  const isUserLanguageSet = DiskStore.isUserDefaultLanguageSet;
  const getItemFromKeychain = DiskStore.getItemFromKeychain;
  const setItemInKeychain = DiskStore.setItemInKeychain;

  return (
    <EttaStorageContext.Provider
      value={{
        connected,
        setIsConnected,
        setLanguage,
        updateLanguage,
        language,
        completedOnboardingSlides,
        setCompletedOnboardingSlides,
        biometricsEnabled,
        setBiometricsEnabled,
        supportedBiometrics,
        setSupportedBiometrics,
        setDoNotTrack,
        isDoNotTrackEnabled,
        areOnboardingSlidesCompleted,
        isUserLanguageSet,
        getItemFromKeychain,
        setItemInKeychain,
      }}
    >
      {children}
    </EttaStorageContext.Provider>
  );
};

// create hook to manage context properties undefined in default context
export const useEttaStorageContext = () => {
  let context = React.useContext(EttaStorageContext);
  // If context is undefined, we know we used a property
  // outside of our provider so we can throw a more helpful
  // error!
  if (context === undefined) {
    throw Error(
      'property must be used inside of a EttaStorageProvider, ' +
        'otherwise it will not function correctly.'
    );
  }

  // Because of TypeScript's type narrowing, if we make it past
  // the error the compiler knows that context is always defined
  // at this point, so we don't need to do any conditional
  // checking on its values when we use this hook!
  return context;
};
