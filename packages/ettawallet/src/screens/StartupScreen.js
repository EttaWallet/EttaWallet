/**
 *
 * This component determines navigation for NUX or returning users
 */

import React, { useEffect, useContext, useState } from 'react';

import { View, StyleSheet, ActivityIndicator } from 'react-native';
import colors from '../styles/colors';
import { EttaStorageContext } from '../../storage/context';
import Logger from '../utils/logger';
import SplashScreen from 'react-native-splash-screen';
import AppLoading from '../../AppLoading';
import { navigate } from '../navigation/NavigationService';

const Startup = () => {
  const [userLanguageStatus, setUserLanguageStatus] = useState(false);
  const [onboardingSlidesComplete, setOnboardingSlidesComplete] =
    useState(false);
  const [defaultWalletAvailable, setDefaultWalletAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    areOnboardingSlidesCompleted,
    isUserLanguageSet,
    isDefaultWalletAvailable,
  } = useContext(EttaStorageContext);

  const checkStorageDefaults = async () => {
    setIsLoading(true);
    let theInitialRoute;
    try {
      // get variables from store defaults
      const langStatus = await isUserLanguageSet();
      if (langStatus === true) {
        setUserLanguageStatus(true);
        theInitialRoute = 'OnboardingSlides';
      } else {
        theInitialRoute = 'Language';
      }
      const slidesStatus = await areOnboardingSlidesCompleted();
      if (slidesStatus === true) {
        setOnboardingSlidesComplete(true);
        theInitialRoute = 'WelcomeScreen';
      }
      const walletStatus = await isDefaultWalletAvailable();
      if (walletStatus === true) {
        setDefaultWalletAvailable(true);
        theInitialRoute = 'TabsRoot';
      }

      navigate(theInitialRoute);
    } catch (e) {
      console.log('something happened: ', e);
    }

    // Wait for next frame to avoid slight gap when hiding the splash
    requestAnimationFrame(() => SplashScreen.hide());
    setIsLoading(false);
  };

  useEffect(() => {
    checkStorageDefaults();
  }, []);

  return (
    <View style={styles.container}>
      {isLoading && (
        <ActivityIndicator size="large" color={colors.greenBrand} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignContent: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});

export default Startup;
