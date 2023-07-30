import './shim';

import React, { ReactElement } from 'react';
import { StatusBar, useColorScheme, LogBox } from 'react-native';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ThemeProvider, LIGHT_THEME, DARK_THEME, Colors } from 'etta-ui';
import { enableScreens } from 'react-native-screens';
import I18nGate from './src/i18n/i18nGate';
import AppLoading from './src/shared/AppLoading';
import NavigatorWrapper from './src/navigation/NavigatorWrapper';
import ErrorBoundary from './src/shared/ErrorBoundary';
import Logger from './src/utils/logger';
import i18n from './src/i18n';
import { StoreProvider, useStoreRehydrated } from 'easy-peasy';
import store from './src/state/store';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

Logger.info('App/init', 'Current Language: ' + i18n.language);

// Explicitly enable screens for react-native-screens
enableScreens(true);

const ignoreWarnings = [
  'componentWillReceiveProps',
  'Remote debugger',
  'cancelTouches',
  'Require cycle',
  'react-i18next', // this annoying error isn't saying much tbh
  'Non-serializable values were found in the navigation state', // @tofix: comes from EnterPinScreen onSuccess()
];

LogBox.ignoreLogs(ignoreWarnings);

type Props = {
  children: ReactElement;
};

// check to ensure state is well rehydrated from storage prior to rendering NavWrapper
function WaitForStateRehydration({ children }: Props) {
  const isRehydrated = useStoreRehydrated();
  return isRehydrated ? children : null;
}

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const theme = isDarkMode ? LIGHT_THEME : LIGHT_THEME; // @todo: fix UI components in dark mode then resolve this

  return (
    <ThemeProvider value={theme}>
      <StoreProvider store={store}>
        <I18nGate loading={<AppLoading />}>
          <StatusBar barStyle="dark-content" backgroundColor={Colors.common.white} />
          <ErrorBoundary>
            <WaitForStateRehydration>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <NavigatorWrapper />
              </GestureHandlerRootView>
            </WaitForStateRehydration>
          </ErrorBoundary>
        </I18nGate>
      </StoreProvider>
    </ThemeProvider>
  );
};

export default App;
