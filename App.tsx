import React, { ReactElement } from 'react';
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
import { StoreProvider, useStoreRehydrated } from 'easy-peasy';
import store from './src/state/store';

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
  const theme = isDarkMode ? DARK_THEME : LIGHT_THEME;
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.common.black : Colors.common.white,
  };
  // const appReady = useStoreState((state) => state.app.appReady);
  // const initializeApp = useStoreActions((action) => action.initializeApp);

  // useEffect(() => {
  //   // tslint:disable-next-line
  //   (async () => {
  //     console.log('ready or not?', appReady);
  //     if (!appReady) {
  //       try {
  //         await initializeApp();
  //       } catch (e) {
  //         console.log('Something happened', e);
  //       }
  //     }
  //   })();
  // }, [appReady]);

  return (
    <ThemeProvider value={theme}>
      <StoreProvider store={store}>
        <I18nGate loading={<AppLoading />}>
          <StatusBar
            barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            backgroundColor={backgroundStyle.backgroundColor}
          />
          <ErrorBoundary>
            <WaitForStateRehydration>
              <NavigatorWrapper />
            </WaitForStateRehydration>
          </ErrorBoundary>
        </I18nGate>
      </StoreProvider>
    </ThemeProvider>
  );
};

export default Sentry.wrap(App);
