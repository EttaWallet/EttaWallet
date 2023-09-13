import { Action, action } from 'easy-peasy';
import { TAvailableNetworks } from '../../utils/networks';
import { EAddressType, IHeader, IOnchainFees, IWallet, TWalletName } from '../../utils/types';
import { header as headerShape } from '../../utils/types';
import { cloneDeep } from 'lodash';
import Config from 'react-native-config';

// @TODO: add translatable strings to error and success messages

export interface WalletModelType {
  walletExists: boolean;
  selectedNetwork: TAvailableNetworks;
  defaultWallet: TWalletName;
  header: IHeader;
  walletinfo: {
    id: TWalletName;
    name: string;
    type: string;
    addressIndex: number;
    balance: number;
    lastUpdated: number;
    hasBackedUpWallet: boolean;
    walletBackupTimestamp: string;
    addressType: EAddressType;
  };
  setWalletExists: Action<WalletModelType, boolean>;
  setAddressIndex: Action<WalletModelType, number>;
  setHeader: Action<WalletModelType, IHeader>;
  updateWalletInfo: Action<WalletModelType, Partial<WalletModelType['walletinfo']>>;
  fees: IOnchainFees;
  updateFees: Action<WalletModelType, IOnchainFees>;
}

export const walletModel: WalletModelType = {
  walletExists: false,
  selectedNetwork: Config.DEFAULT_NETWORK,
  defaultWallet: 'wallet0',
  header: headerShape,
  walletinfo: {
    id: 'wallet0',
    name: '',
    type: 'default',
    addressIndex: 0,
    balance: 0,
    lastUpdated: 0,
    hasBackedUpWallet: false,
    walletBackupTimestamp: '',
    addressType: EAddressType.p2wpkh,
  },
  fees: {
    fast: 4, // 10-20 mins
    normal: 3, // 20-60 mins
    slow: 2, // 1-2 hrs
    minimum: 1,
    timestamp: Date.now() - 60 * 30 * 1000 - 1, // minus 30 mins
  },
  setAddressIndex: action((state, payload) => {
    state.walletinfo.addressIndex = payload;
  }),
  setWalletExists: action((state, payload) => {
    state.walletExists = payload;
  }),
  setHeader: action((state, payload) => {
    state.header = payload;
  }),
  updateWalletInfo: action((state, payload) => {
    state.walletExists = true;
    state.walletinfo = { ...state.walletinfo, ...payload };
  }),
  updateFees: action((state, payload) => {
    state.fees = {
      ...state.fees,
      ...payload,
    };
  }),
};

export const getDefaultWalletShape = (): IWallet => {
  return cloneDeep(walletModel.walletinfo);
};
