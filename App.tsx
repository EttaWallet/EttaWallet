import React from 'react';
import { SafeAreaView, StatusBar, useColorScheme } from 'react-native';
import { ThemeProvider, LIGHT_THEME, DARK_THEME, Colors } from 'etta-ui';
import I18nGate from './src/i18n/i18nGate';
import AppLoading from './src/shared/AppLoading';
import NavigatorWrapper from './src/navigation/NavigatorWrapper';
import ErrorBoundary from './src/shared/ErrorBoundary';

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const theme = isDarkMode ? DARK_THEME : LIGHT_THEME;
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.common.black : Colors.common.white,
  };

  return (
    <SafeAreaView>
      <ThemeProvider value={theme}>
        <I18nGate loading={<AppLoading />}>
          <StatusBar
            barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            backgroundColor={backgroundStyle.backgroundColor}
          />
          <ErrorBoundary>
            <NavigatorWrapper />
          </ErrorBoundary>
        </I18nGate>
      </ThemeProvider>
    </SafeAreaView>
  );
};

export default App;
