import { Action, action } from 'easy-peasy';

export interface InternetModelType {
  connected: boolean;
  rehydrated: boolean;
  setConnected: Action<InternetModelType, boolean>;
  setRehydrated: Action<InternetModelType, boolean>;
}

export const internetModel: InternetModelType = {
  connected: false,
  rehydrated: false,
  setConnected: action((state, connected) => {
    state.connected = connected;
  }),
  setRehydrated: action((state, rehydrated) => {
    state.rehydrated = rehydrated;
  }),
};
