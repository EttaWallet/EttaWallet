import React from 'react';
import { SafeAreaView, StatusBar, useColorScheme, LogBox } from 'react-native';
import * as Sentry from '@sentry/react-native';
import { ThemeProvider, LIGHT_THEME, DARK_THEME } from 'etta-ui';
import { enableScreens } from 'react-native-screens';
import I18nGate from './src/i18n/i18nGate';
import AppLoading from './src/shared/AppLoading';
import NavigatorWrapper from './src/navigation/NavigatorWrapper';
import ErrorBoundary from './src/shared/ErrorBoundary';
import Logger from './src/utils/logger';
import i18n from './src/i18n';
import { EttaStorageProvider } from './src/storage/context';

Logger.debug('App/init', 'Current Language: ' + i18n.language);

// Explicitly enable screens for react-native-screens
enableScreens(true);

const ignoreWarnings = [
  'componentWillReceiveProps',
  'Remote debugger',
  'cancelTouches',
  'Require cycle',
];

LogBox.ignoreLogs(ignoreWarnings);

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const theme = isDarkMode ? DARK_THEME : LIGHT_THEME;

  return (
    <SafeAreaView>
      <ThemeProvider value={theme}>
        <EttaStorageProvider>
          <I18nGate loading={<AppLoading />}>
            <StatusBar backgroundColor="transparent" barStyle="dark-content" />
            <ErrorBoundary>
              <NavigatorWrapper />
            </ErrorBoundary>
          </I18nGate>
        </EttaStorageProvider>
      </ThemeProvider>
    </SafeAreaView>
  );
};

export default Sentry.wrap(App);
