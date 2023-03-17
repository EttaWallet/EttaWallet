import type { BIOMETRY_TYPE } from 'react-native-keychain';
import { AppState } from '../types';
import { Screens } from '../../navigation/Screens';
import { action, thunk } from 'easy-peasy';
import type { Action, Thunk } from 'easy-peasy';
import mmkvStorage, { StorageItem } from '../../storage/disk';

export interface AppModelType {
  appVersion: number;
  appBuild: number;
  appReady: boolean;
  appState: AppState;
  requirePinOnOpen: boolean;
  authenticated: boolean; // with PIN
  locked: boolean;
  sessionId: string;
  activeScreen: Screens;
  supportedBiometryType: BIOMETRY_TYPE | null;
  skippedBiometrics: boolean;
  minAppVersion: string | null;
  // actions
  setAppVersion: Action<AppModelType, number>;
  setAppBuild: Action<AppModelType, number>;
  setAppReady: Action<AppModelType, boolean>;
  setAppState: Action<AppModelType, AppState>;
  setRequirePinOnOpen: Action<AppModelType, boolean>;
  setAuthenticated: Action<AppModelType, boolean>;
  setLocked: Action<AppModelType, boolean>;
  setSessionId: Action<AppModelType, string>;
  setActiveScreen: Action<AppModelType, Screens>;
  setMinAppVersion: Action<AppModelType, string | null>;
  setSupportedBiometryType: Action<AppModelType, BIOMETRY_TYPE>;
  setSkippedBiometrics: Action<AppModelType, boolean>;
  saveSkippedBiometrics: Thunk<AppModelType, boolean>;
}

// model implementation
export const appModel: AppModelType = {
  appVersion: 0,
  appBuild: 0,
  appReady: false,
  appState: AppState.Active,
  requirePinOnOpen: false,
  authenticated: false,
  locked: false,
  sessionId: '',
  activeScreen: Screens.Main,
  supportedBiometryType: null,
  skippedBiometrics: false,
  minAppVersion: null,
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
  setAuthenticated: action((state, authenticated) => {
    state.authenticated = authenticated;
  }),
  setRequirePinOnOpen: action((state, requirePinOnOpen) => {
    state.requirePinOnOpen = requirePinOnOpen;
  }),
  setLocked: action((state, locked) => {
    state.locked = locked;
  }),
  setSessionId: action((state, sessionId) => {
    state.sessionId = sessionId;
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
  setSkippedBiometrics: action((state, skippedBiometrics) => {
    state.skippedBiometrics = skippedBiometrics;
  }),
  saveSkippedBiometrics: thunk(async (actions, payload) => {
    await mmkvStorage.setItem(StorageItem.skippedBiometrics, payload);
    actions.setSkippedBiometrics(payload);
  }),
};
