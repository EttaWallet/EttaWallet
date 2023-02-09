import React from 'react';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import Logger from './src/utils/logger';
import * as Sentry from '@sentry/react-native';
import Config from 'react-native-config';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { stringToBoolean } from './src/utils/helpers';
import 'intl-pluralrules';

const SENTRY_ENABLED = stringToBoolean(Config.SENTRY_ENABLED || 'false');

const defaultErrorHandler = ErrorUtils.getGlobalHandler();
const customErrorHandler = (e, isFatal) => {
  if (SENTRY_ENABLED) {
    Sentry.captureException(e);
  }
  Logger.error('RootErrorHandler', `Unhandled error. isFatal: ${isFatal}`, e);
  defaultErrorHandler(e, isFatal);
};
ErrorUtils.setGlobalHandler(customErrorHandler);

const EttaAppComponent = () => {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <App />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};

AppRegistry.registerComponent(appName, () => EttaAppComponent);
