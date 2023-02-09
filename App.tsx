import React from 'react';
import { StatusBar, useColorScheme, LogBox } from 'react-native';
import * as Sentry from '@sentry/react-native';
import { ThemeProvider, LIGHT_THEME, DARK_THEME, Colors } from 'etta-ui';
import { enableScreens } from 'react-native-screens';
import I18nGate from './src/i18n/i18nGate';
import AppLoading from './src/shared/AppLoading';
import NavigatorWrapper from './src/navigation/NavigatorWrapper';
import ErrorBoundary from './src/shared/ErrorBoundary';
import Logger from './src/utils/logger';
import i18n from './src/i18n';
import { EttaStorageProvider } from './src/storage/context';

Logger.info('App/init', 'Current Language: ' + i18n.language);

// Explicitly enable screens for react-native-screens
enableScreens(true);

const ignoreWarnings = [
  'componentWillReceiveProps',
  'Remote debugger',
  'cancelTouches',
  'Require cycle',
  'react-i18next', // this annoying error isn't saying much tbh
];

LogBox.ignoreLogs(ignoreWarnings);

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const theme = isDarkMode ? DARK_THEME : LIGHT_THEME;
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.common.black : Colors.common.white,
  };

  return (
    <ThemeProvider value={theme}>
      <EttaStorageProvider>
        <I18nGate loading={<AppLoading />}>
          <StatusBar
            barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            backgroundColor={backgroundStyle.backgroundColor}
          />
          <ErrorBoundary>
            <NavigatorWrapper />
          </ErrorBoundary>
        </I18nGate>
      </EttaStorageProvider>
    </ThemeProvider>
  );
};

export default Sentry.wrap(App);
