import type { BIOMETRY_TYPE } from 'react-native-keychain';
import { AppState } from '../../utils/types';
import { Screens } from '../../navigation/Screens';
import { action } from 'easy-peasy';
import type { Action } from 'easy-peasy';

export interface AppModelType {
  appVersion: string;
  appBuild: string;
  appReady: boolean;
  appState: AppState;
  requirePinOnOpen: boolean;
  locked: boolean;
  activeScreen: Screens;
  supportedBiometryType: BIOMETRY_TYPE | null;
  skippedBiometrics: boolean;
  biometricsEnabled: boolean;
  minAppVersion: string | null;
  isConnectedToElectrum: boolean;
  // actions
  setAppVersion: Action<AppModelType, string>;
  setAppBuild: Action<AppModelType, string>;
  setAppReady: Action<AppModelType, boolean>;
  setAppState: Action<AppModelType, AppState>;
  setRequirePinOnOpen: Action<AppModelType, boolean>;
  setLocked: Action<AppModelType, boolean>;
  setActiveScreen: Action<AppModelType, Screens>;
  setMinAppVersion: Action<AppModelType, string | null>;
  setSupportedBiometryType: Action<AppModelType, BIOMETRY_TYPE | null>;
  setEnabledBiometrics: Action<AppModelType, boolean>;
  setSkippedBiometrics: Action<AppModelType, boolean>;
  setIsConnectedToElectrum: Action<AppModelType, boolean>;
}

// model implementation
export const appModel: AppModelType = {
  appVersion: '0',
  appBuild: '0',
  appReady: false,
  appState: AppState.Active,
  requirePinOnOpen: false,
  locked: false,
  activeScreen: Screens.Main,
  supportedBiometryType: null,
  skippedBiometrics: false,
  biometricsEnabled: false,
  minAppVersion: null,
  isConnectedToElectrum: false,
  // wip actions
  setAppVersion: action((state, version) => {
    state.appVersion = version;
  }),
  setAppBuild: action((state, buildNumber) => {
    state.appBuild = buildNumber;
  }),
  setAppReady: action((state, appReady) => {
    state.appReady = appReady;
  }),
  setAppState: action((state) => {
    let { appState } = state;
    switch (appState) {
      case 'Background':
        appState = AppState.Background;
        break;
      case 'Inactive': // IOS issue
        appState = AppState.Inactive;
        break;
      case 'Active':
        appState = AppState.Active;
        break;
    }
    return {
      ...state,
      appState,
    };
  }),
  setRequirePinOnOpen: action((state, requirePinOnOpen) => {
    state.requirePinOnOpen = requirePinOnOpen;
  }),
  setLocked: action((state, locked) => {
    state.locked = locked;
  }),
  setActiveScreen: action((state, activeScreen) => {
    state.activeScreen = activeScreen;
  }),
  setMinAppVersion: action((state, minAppVersion) => {
    state.minAppVersion = minAppVersion;
  }),
  setSupportedBiometryType: action((state, supportedBiometryType) => {
    state.supportedBiometryType = supportedBiometryType;
  }),
  setEnabledBiometrics: action((state, biometricsEnabled) => {
    state.biometricsEnabled = biometricsEnabled;
  }),
  setSkippedBiometrics: action((state, skippedBiometrics) => {
    state.skippedBiometrics = skippedBiometrics;
  }),
  setIsConnectedToElectrum: action((state, isConnectedToElectrum) => {
    state.isConnectedToElectrum = isConnectedToElectrum;
  }),
};
