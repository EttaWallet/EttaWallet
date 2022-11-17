/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import React from 'react';
import { StatusBar, LogBox } from 'react-native';
import { lightTheme, ThemeProvider } from '@ettawallet/react-native-kit';
import { NavigationContainer } from '@react-navigation/native';
import { enableScreens } from 'react-native-screens';
import { navigationRef } from './src/navigation/NavigationService';
import i18n from './i18n';
import I18nGate from './i18n/Gate';
import Logger from './src/utils/logger';
import ErrorBoundary from './ErrorBoundary';
import AppLoading from './AppLoading';
import InitRoot from './src/navigation/Navigation';

Logger.debug('App/init', 'Current Language: ' + i18n.language);

// Explicitly enable screens for react-native-screens
enableScreens(true);

const ignoreWarnings = [
  'Require cycle:', // TODO: fix require cycles and remove this ;)
];

LogBox.ignoreLogs(ignoreWarnings); // this is being ignored, still getting require cycle errors in console???

const App = () => {
  return (
    <ThemeProvider theme={lightTheme}>
      <I18nGate loading={<AppLoading />}>
        <StatusBar backgroundColor="transparent" barStyle="dark-content" />
        <ErrorBoundary>
          <NavigationContainer ref={navigationRef}>
            <InitRoot />
          </NavigationContainer>
        </ErrorBoundary>
      </I18nGate>
    </ThemeProvider>
  );
};

export default App;
