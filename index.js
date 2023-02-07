/**
 * @format
 */
import React from 'react';
import { AppRegistry, Text, TextInput } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { EttaStorageProvider } from './src/storage/context';

const EttaAppComponent = () => {
  return (
    <EttaStorageProvider>
      <App />
    </EttaStorageProvider>
  );
};

// Prevent Text elements font from scaling over 2
Text.defaultProps = {
  ...Text.defaultProps,
  maxFontSizeMultiplier: 2,
};

// Prevent TextInput font from scaling over 2
// Scale font to fit on TextInput elements
TextInput.defaultProps = {
  ...TextInput.defaultProps,
  maxFontSizeMultiplier: 2,
  adjustsFontSizeToFit: true,
};

AppRegistry.registerComponent(appName, () => EttaAppComponent);
