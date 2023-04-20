import { PinType } from '../../utils/types';
import { action, Thunk, thunk } from 'easy-peasy';
import type { Action } from 'easy-peasy';
import mmkvStorage, { StorageItem } from '../../storage/disk';

export interface NuxtModelType {
  seenSlides: boolean;
  userStarted: boolean;
  language: string | null;
  pincodeType: PinType;
  backupCompleted: boolean;
  acknowledgedDisclaimer: boolean;
  choseRestoreWallet: boolean | undefined;
  setSeenSlides: Action<NuxtModelType, boolean>;
  setUserStarted: Action<NuxtModelType, boolean>;
  setLanguage: Action<NuxtModelType, string>;
  setPincodeType: Action<NuxtModelType, PinType>;
  setBackupCompleted: Action<NuxtModelType, boolean>;
  setAcknowledgedDisclaimer: Action<NuxtModelType, boolean>;
  setChoseRestoreWallet: Action<NuxtModelType, boolean>;
  saveSeenSlides: Thunk<NuxtModelType, boolean>;
  saveUserStarted: Thunk<NuxtModelType, boolean>;
  saveAcknowledgedDisclaimer: Thunk<NuxtModelType, boolean>;
  saveLanguage: Thunk<NuxtModelType, string>;
  savePinType: Thunk<NuxtModelType, PinType>;
}

// model implementation
export const nuxtModel: NuxtModelType = {
  seenSlides: false,
  userStarted: false,
  language: null,
  pincodeType: PinType.Unset,
  backupCompleted: false,
  acknowledgedDisclaimer: false,
  choseRestoreWallet: false,
  setSeenSlides: action((state, seenSlides) => {
    state.seenSlides = seenSlides;
  }),
  setUserStarted: action((state, userStarted) => {
    state.userStarted = userStarted;
  }),
  setLanguage: action((state, language) => {
    state.language = language;
  }),
  setPincodeType: action((state, pincodeType) => {
    state.pincodeType = pincodeType;
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
  saveSeenSlides: thunk(async (actions, payload) => {
    await mmkvStorage.setItem(StorageItem.seenSlides, payload);
    actions.setSeenSlides(payload);
  }),
  saveUserStarted: thunk(async (actions, payload) => {
    await mmkvStorage.setItem(StorageItem.userStarted, payload);
    actions.setUserStarted(payload);
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
