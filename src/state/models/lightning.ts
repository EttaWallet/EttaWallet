/* eslint-disable @typescript-eslint/no-unused-vars */
import { Action, action, Thunk, thunk } from 'easy-peasy';
import { setupLdk, syncLdk, updateHeader } from '../../ldk';
import { connectToElectrum, subscribeToHeader } from '../../utils/electrum';
import ldk from '@synonymdev/react-native-ldk/dist/ldk';
import mmkvStorage, { StorageItem } from '../../storage/disk';

import Logger from '../../utils/logger';

const TAG = 'LightningStore';

// @TODO: add translatable strings to error and success messages

export interface LightningNodeModelType {
  nodeId: string | null;
  setNodeId: Action<LightningNodeModelType, string>;
  progress: number;
  setProgress: Action<LightningNodeModelType, number>;
  message: string;
  setMessage: Action<LightningNodeModelType, string>;
  nodeStarted: boolean;
  setNodeStarted: Action<LightningNodeModelType, boolean>;
  startNode: Thunk<LightningNodeModelType>;
  getNodeId: Thunk<LightningNodeModelType>;
}

export const lightningModel: LightningNodeModelType = {
  message: '',
  progress: 0,
  nodeStarted: false,
  nodeId: null,
  startNode: thunk(async (actions, _, { getState }) => {
    //Restarting LDK on each code update causes constant errors.
    const state = getState(); // Get the current state of the store
    if (state.nodeStarted) {
      return;
    }

    // Connect to Electrum Server
    actions.setProgress(10);
    const electrumResponse = await connectToElectrum({});
    if (electrumResponse.isErr()) {
      actions.setMessage(
        `Unable to connect to Electrum Server:\n ${electrumResponse.error.message}`
      );
      return;
    }
    actions.setProgress(30);

    // Subscribe to new blocks and sync LDK accordingly.
    const headerInfo = await subscribeToHeader({
      onReceive: async (): Promise<void> => {
        const syncRes = await syncLdk();
        if (syncRes.isErr()) {
          actions.setMessage(syncRes.error.message);
          return;
        }
        actions.setMessage(syncRes.value);
      },
    });
    if (headerInfo.isErr()) {
      actions.setMessage(headerInfo.error.message);
      return;
    }
    await updateHeader({ header: headerInfo.value });
    actions.setProgress(60);

    // Setup LDK
    const setupResponse = await setupLdk();
    if (setupResponse.isErr()) {
      actions.setMessage(setupResponse.error.message);
      return;
    }
    actions.setProgress(80);
    actions.setNodeStarted(true);
    actions.setMessage('You are good to go!');
    actions.getNodeId();
    actions.setProgress(100);
  }),
  setNodeId: action((state, payload) => {
    state.nodeId = payload;
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
  getNodeId: thunk(async (actions) => {
    const { setMessage } = actions;
    try {
      const nodeIdRes = await ldk.nodeId();
      if (nodeIdRes.isErr()) {
        // setMessage(`Error getting Node ID:\n ${nodeIdRes.error.message}`);
        Logger.error(TAG, `Error getting Node ID:\n ${nodeIdRes.error.message}`);
        return;
      } else {
        // save to storage
        // @ts-ignore
        mmkvStorage.setItem(StorageItem.ldkNodeId, nodeIdRes.value);
        // update state
        await actions.setNodeId(nodeIdRes.value);
      }
    } catch (error) {
      Logger.error(TAG, '@getNodeId', error.message);
    }
  }),
  // open channel with LSP and receive inbound liquidity
};
