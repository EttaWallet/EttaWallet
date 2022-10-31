import React from 'react';
import { StatusBar } from 'react-native';
import { lightTheme, ThemeProvider, Icon } from '@ettawallet/react-native-kit';
import { NavigationContainer } from '@react-navigation/native';
import { enableScreens } from 'react-native-screens';
import { navigationRef } from './src/navigation/NavigationService';
import SplashScreen from 'react-native-splash-screen';
import i18n from './i18n';
import I18nGate from './i18n/Gate';
import Logger from './src/utils/logger';
import AppLoading from './AppLoading';
import InitRoot from './src/navigation/Navigation';

Logger.debug('App/init', 'Current Language: ' + i18n.language);

// Explicitly enable screens for react-native-screens
enableScreens(true);
SplashScreen.hide(); // hide the splash screen as soon as main component loads

const App = () => {
  return (
    <ThemeProvider theme={lightTheme}>
      <I18nGate loading={<AppLoading />}>
        <StatusBar backgroundColor="transparent" barStyle="dark-content" />
        <NavigationContainer ref={navigationRef}>
          <InitRoot />
        </NavigationContainer>
      </I18nGate>
    </ThemeProvider>
  );
};

export default App;
