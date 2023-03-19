import { PinType } from '../types';
import { action, Thunk, thunk } from 'easy-peasy';
import type { Action } from 'easy-peasy';
import mmkvStorage, { StorageItem } from '../../storage/disk';

export interface NuxtModelType {
  language: string | null;
  pincodeType: PinType;
  backupCompleted: boolean;
  acknowledgedDisclaimer: boolean;
  choseRestoreWallet: boolean | undefined;
  setLanguage: Action<NuxtModelType, string>;
  setPincodeType: Action<NuxtModelType, PinType>;
  setBackupCompleted: Action<NuxtModelType, boolean>;
  setAcknowledgedDisclaimer: Action<NuxtModelType, boolean>;
  setChoseRestoreWallet: Action<NuxtModelType, boolean>;
  saveAcknowledgedDisclaimer: Thunk<NuxtModelType, boolean>;
  saveLanguage: Thunk<NuxtModelType, string>;
  savePinType: Thunk<NuxtModelType, PinType>;
}

// model implementation
export const nuxtModel: NuxtModelType = {
  language: null,
  pincodeType: PinType.Unset,
  backupCompleted: false,
  acknowledgedDisclaimer: false,
  choseRestoreWallet: false,
  setLanguage: action((state, language) => {
    state.language = language;
  }),
  setPincodeType: action((state) => {
    let { pincodeType } = state;
    switch (pincodeType) {
      case 'Unset':
        pincodeType = PinType.Unset;
        break;
      case 'Custom':
        pincodeType = PinType.Custom;
        break;
      case 'Device':
        pincodeType = PinType.Device;
        break;
    }
    return {
      ...state,
      pincodeType,
    };
  }),
  setBackupCompleted: action((state, backupCompleted) => {
    state.backupCompleted = backupCompleted;
  }),
  setAcknowledgedDisclaimer: action((state, payload) => {
    state.acknowledgedDisclaimer = payload;
  }),
  setChoseRestoreWallet: action((state, choseRestoreWallet) => {
    state.choseRestoreWallet = choseRestoreWallet;
  }),
  saveAcknowledgedDisclaimer: thunk(async (actions, payload) => {
    await mmkvStorage.setItem(StorageItem.acknowledgedDisclaimer, payload);
    actions.setAcknowledgedDisclaimer(payload);
  }),
  saveLanguage: thunk(async (actions, payload) => {
    await mmkvStorage.setItem(StorageItem.language, payload);
    actions.setLanguage(payload);
  }),
  savePinType: thunk(async (actions, payload) => {
    await mmkvStorage.setItem(StorageItem.pinType, payload);
    actions.setPincodeType(payload);
  }),
};
