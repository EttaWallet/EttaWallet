import { Action, action, Thunk, thunk } from 'easy-peasy';
import NetInfo from '@react-native-community/netinfo';
import { showErrorBanner, showSuccessBanner } from '../../utils/alerts';

export interface InternetModelType {
  isConnected: boolean;
  setConnectedStatus: Action<InternetModelType, boolean>;
  checkConnectionStatus: Thunk<InternetModelType>;
}

export const internetModel: InternetModelType = {
  isConnected: false,
  setConnectedStatus: action((state, payload) => {
    if (payload === true) {
      state.isConnected = payload;
      showSuccessBanner({ message: 'You are back online', title: 'Online!' });
    } else {
      state.isConnected = payload;
      showErrorBanner({ message: 'You are not connected to the internet', title: 'Offline!' });
    }
  }),
  checkConnectionStatus: thunk(async (actions) => {
    const connectionInfo = await NetInfo.fetch();
    actions.setConnectedStatus(connectionInfo && connectionInfo.type !== 'none');

    // eslint-disable-next-line @typescript-eslint/no-shadow
    const unsubscribe = NetInfo.addEventListener((connectionInfo) => {
      actions.setConnectedStatus(connectionInfo && connectionInfo.type !== 'none');
    });

    return () => {
      unsubscribe();
    };
  }),
};
