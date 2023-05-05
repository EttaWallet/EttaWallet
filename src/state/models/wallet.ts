import { Action, action } from 'easy-peasy';
import { TAvailableNetworks } from '../../utils/networks';
import {
  EAddressType,
  EBoostType,
  EFeeId,
  IAddressTypes,
  IBitcoinTransactionData,
  IFormattedTransactions,
  IHeader,
  IKeyDerivationPath,
  IOnchainFees,
  IWallet,
  IWalletItem,
  TWalletName,
  addressTypes,
  defaultKeyDerivationPath,
  numberTypeItems,
  objectTypeItems,
} from '../../utils/types';
import { EAvailableNetworks } from '../../utils/networks';
import { header as headerShape } from '../../utils/types';
import { cloneDeep } from 'lodash';

// @TODO: add translatable strings to error and success messages

export const defaultBitcoinTransactionData: IBitcoinTransactionData = {
  outputs: [],
  inputs: [],
  changeAddress: '',
  fiatAmount: 0,
  fee: 512,
  satsPerByte: 2,
  selectedFeeId: EFeeId.none,
  message: '',
  label: '',
  rbf: false,
  boostType: EBoostType.cpfp,
  minFee: 1,
  max: false,
  tags: [],
  lightningInvoice: '',
};

export const bitcoinTransaction: Readonly<IWalletItem<IBitcoinTransactionData>> = {
  bitcoin: defaultBitcoinTransactionData,
  bitcoinTestnet: defaultBitcoinTransactionData,
  bitcoinRegtest: defaultBitcoinTransactionData,
};

export interface WalletModelType {
  walletExists: boolean;
  selectedNetwork: TAvailableNetworks;
  defaultWallet: TWalletName;
  header: IHeader;
  addressTypes: IAddressTypes;
  walletinfo: {
    id: TWalletName;
    name: string;
    type: string;
    addressIndex: number;
    transactions: IWalletItem<IFormattedTransactions>;
    balance: IWalletItem<number>;
    lastUpdated: IWalletItem<number>;
    hasBackedUpWallet: boolean;
    walletBackupTimestamp: string;
    keyDerivationPath: IWalletItem<IKeyDerivationPath>;
    networkTypePath: IWalletItem<string>;
    addressType: {
      bitcoin: EAddressType;
      bitcoinTestnet: EAddressType;
      bitcoinRegtest: EAddressType;
    };
    transaction: IWalletItem<IBitcoinTransactionData>;
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
  selectedNetwork: EAvailableNetworks.bitcoinTestnet,
  defaultWallet: 'wallet0',
  header: headerShape,
  addressTypes: addressTypes,
  walletinfo: {
    id: 'wallet0',
    name: '',
    type: 'default',
    addressIndex: 0,
    transactions: objectTypeItems,
    balance: numberTypeItems,
    lastUpdated: numberTypeItems,
    hasBackedUpWallet: false,
    walletBackupTimestamp: '',
    keyDerivationPath: {
      bitcoin: defaultKeyDerivationPath,
      bitcoinTestnet: {
        ...defaultKeyDerivationPath,
        coinType: '0',
      },
      bitcoinRegtest: defaultKeyDerivationPath,
    },
    networkTypePath: {
      bitcoin: '0',
      bitcoinTestnet: '1',
      bitcoinRegtest: '0',
    },
    addressType: {
      bitcoin: EAddressType.p2wpkh,
      bitcoinTestnet: EAddressType.p2wpkh,
      bitcoinRegtest: EAddressType.p2wpkh,
    },
    transaction: bitcoinTransaction,
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
