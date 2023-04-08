import { Action, action, Thunk, thunk } from 'easy-peasy';
import { setupLdk, syncLdk, updateHeader } from '../../ldk';
import { connectToElectrum, subscribeToHeader } from '../../utils/electrum';

import Logger from '../../utils/logger';

const TAG = 'LightningStore';

export interface LightningNodeModelType {
  message: string;
  progress: number;
  setMessage: Action<LightningNodeModelType, string>;
  nodeStarted: boolean;
  nodeId: string | null;
  setProgress: Action<LightningNodeModelType, number>;
  setNodeStarted: Action<LightningNodeModelType, boolean>;
  connectToElectrum: Thunk<LightningNodeModelType>;
  syncLdk: Thunk<LightningNodeModelType>;
  setupLdk: Thunk<LightningNodeModelType>;
  startNode: Thunk<LightningNodeModelType>;
}

export const lightningModel: LightningNodeModelType = {
  message: '',
  progress: 0,
  nodeStarted: false,
  nodeId: null,
  startNode: thunk(async (actions) => {
    await actions.connectToElectrum();
  }),
  connectToElectrum: thunk(async (actions) => {
    // Connect to Electrum Server
    actions.setProgress(10);
    try {
      const electrumResponse = await connectToElectrum({});
      if (electrumResponse.isErr()) {
        actions.setMessage(
          `Unable to connect to Electrum Server:\n ${electrumResponse.error.message}`
        );
        Logger.error(TAG, '@electrumResponse', electrumResponse.error.message);
        return;
      }
      actions.setProgress(30);
      // Subscribe to new blocks and sync LDK accordingly.
      const headerInfo = await subscribeToHeader({
        onReceive: async (): Promise<void> => {
          const syncRes = await actions.syncLdk();
          if (syncRes.isErr()) {
            actions.setMessage(syncRes.error.message);
            Logger.error(TAG, '@syncRes', syncRes.error.message);
            return;
          }
          actions.setProgress(50);
          actions.setMessage(syncRes.value);
        },
      });
      if (headerInfo.isErr()) {
        actions.setMessage(headerInfo.error.message);
        Logger.error(TAG, '@headerInfo', headerInfo.error.message);
        return;
      }
      await updateHeader({ header: headerInfo.value });
      actions.setProgress(50);
      await actions.syncLdk();
      actions.setProgress(70);
      // Setup LDK
      await actions.setupLdk();
      actions.setProgress(90);
      actions.setNodeStarted(true);
      actions.setMessage('LDK setup complete');
    } catch (error) {
      actions.setMessage(`Something went wrong starting node: \n ${error.message}`);
    }
  }),
  syncLdk: thunk(async (actions) => {
    const { setMessage } = actions;
    try {
      await syncLdk();
      setMessage('LDK synced with blockchain');
      actions.setProgress(30);
    } catch (error) {
      setMessage(`Error syncing LDK: ${error.message}`);
      Logger.error(TAG, '@syncLdk', error.message);
    }
  }),
  setupLdk: thunk(async (actions) => {
    const { setMessage, setProgress } = actions;
    try {
      const { message, error } = await setupLdk();
      if (error) {
        setMessage(`Error setting up LDK: ${message}`);
        return;
      }
      setMessage('LDK setup complete');
      setProgress(0);
    } catch (error) {
      setMessage(`Error setting up LDK: ${error.message}`);
      Logger.error(TAG, '@setupLdk', error.message);
    }
  }),
  setMessage: action((state, payload) => {
    state.message = payload;
  }),
  setNodeStarted: action((state, payload) => {
    state.nodeStarted = payload;
  }),
  setProgress: action((state, payload) => {
    state.progress = payload;
  }),
};
