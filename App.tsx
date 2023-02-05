import React from 'react';
import { SafeAreaView, StatusBar, useColorScheme } from 'react-native';
import { ThemeProvider, LIGHT_THEME, DARK_THEME, Colors } from 'etta-ui';
import TypesafeI18n from './src/i18n/i18n-react';
import { detectDefaultLocale } from './src/utils/get-locale';
import ErrorBoundary from 'react-native-error-boundary';
import { ErrorScreen } from './src/screens/ErrorScreen';

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const theme = isDarkMode ? DARK_THEME : LIGHT_THEME;
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.common.black : Colors.common.white,
  };

  return (
    <ThemeProvider value={theme}>
      <TypesafeI18n locale={detectDefaultLocale()}>
        <SafeAreaView style={backgroundStyle}>
          <ErrorBoundary FallbackComponent={ErrorScreen}>
            <StatusBar
              barStyle={isDarkMode ? 'light-content' : 'dark-content'}
              backgroundColor={backgroundStyle.backgroundColor}
            />
            <ErrorScreen />
          </ErrorBoundary>
        </SafeAreaView>
      </TypesafeI18n>
    </ThemeProvider>
  );
};

export default App;
