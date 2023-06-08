import { ELocalCurrencyCode, PinType } from '../../utils/types';
import { action } from 'easy-peasy';
import type { Action } from 'easy-peasy';

export interface NuxtModelType {
  seenSlides: boolean;
  language: string | null;
  localCurrency: ELocalCurrencyCode | null;
  pincodeType: PinType;
  backupCompleted: boolean;
  acknowledgedDisclaimer: boolean;
  choseRestoreWallet: boolean | undefined;
  setSeenSlides: Action<NuxtModelType, boolean>;
  setLanguage: Action<NuxtModelType, string>;
  setLocalCurrency: Action<NuxtModelType, ELocalCurrencyCode | null>;
  setPincodeType: Action<NuxtModelType, PinType>;
  setBackupCompleted: Action<NuxtModelType, boolean>;
  setAcknowledgedDisclaimer: Action<NuxtModelType, boolean>;
  setChoseRestoreWallet: Action<NuxtModelType, boolean>;
}

// model implementation
export const nuxtModel: NuxtModelType = {
  seenSlides: false,
  language: 'en-US',
  localCurrency: null,
  pincodeType: PinType.Unset,
  backupCompleted: false,
  acknowledgedDisclaimer: false,
  choseRestoreWallet: false,
  setSeenSlides: action((state, seenSlides) => {
    state.seenSlides = seenSlides;
  }),
  setLanguage: action((state, language) => {
    state.language = language;
  }),
  setLocalCurrency: action((state, payload) => {
    state.localCurrency = payload;
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
};
