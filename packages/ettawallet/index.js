import React from 'react';
import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import App from './App';
import { EttaStorageProvider } from './storage/context';

const EttaAppComponent = () => {
  return (
    <EttaStorageProvider>
      <App />
    </EttaStorageProvider>
  );
};

AppRegistry.registerComponent(appName, () => EttaAppComponent);
