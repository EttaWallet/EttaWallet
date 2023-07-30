import React from 'react';
import { AppRegistry, Text, TextInput } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import Logger from './src/utils/logger';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'intl-pluralrules';

const defaultErrorHandler = ErrorUtils.getGlobalHandler();
const customErrorHandler = (e, isFatal) => {
  Logger.error('RootErrorHandler', `Unhandled error. isFatal: ${isFatal}`, e);
  defaultErrorHandler(e, isFatal);
};
ErrorUtils.setGlobalHandler(customErrorHandler);

const EttaAppComponent = () => {
  return (
    <SafeAreaProvider>
      <App />
    </SafeAreaProvider>
  );
};

Text.defaultProps = {
  ...Text.defaultProps,
  maxFontSizeMultiplier: 2,
};

TextInput.defaultProps = {
  ...TextInput.defaultProps,
  maxFontSizeMultiplier: 2,
  adjustsFontSizeToFit: true,
};

AppRegistry.registerComponent(appName, () => EttaAppComponent);
