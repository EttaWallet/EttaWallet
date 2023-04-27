import { Action, action } from 'easy-peasy';
import { TAvailableNetworks } from '../../utils/networks';
import {
  EAddressType,
  EBoostType,
  EFeeId,
  IAddress,
  IAddressTypeContent,
  IAddressTypes,
  IAddresses,
  IBitcoinTransactionData,
  IFormattedTransactions,
  IHeader,
  IKeyDerivationPath,
  IOnchainFees,
  IUtxo,
  IWallet,
  IWalletItem,
  TWalletName,
  addressContent,
  addressTypes,
  arrayTypeItems,
  defaultKeyDerivationPath,
  getAddressTypeContent,
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

export const getAddressIndexShape = (): IWalletItem<IAddressTypeContent<IAddress>> => {
  return cloneDeep({
    [EAvailableNetworks.bitcoin]: getAddressTypeContent<IAddress>(addressContent),
    [EAvailableNetworks.bitcoinTestnet]: getAddressTypeContent<IAddress>(addressContent),
    [EAvailableNetworks.bitcoinRegtest]: getAddressTypeContent<IAddress>(addressContent),
    timestamp: null,
  });
};

export const getAddressesShape = (): IWalletItem<IAddressTypeContent<IAddresses>> => {
  return cloneDeep({
    [EAvailableNetworks.bitcoin]: getAddressTypeContent<IAddresses>({}),
    [EAvailableNetworks.bitcoinTestnet]: getAddressTypeContent<IAddresses>({}),
    [EAvailableNetworks.bitcoinRegtest]: getAddressTypeContent<IAddresses>({}),
    timestamp: null,
  });
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
    addresses: IWalletItem<IAddressTypeContent<IAddresses>>;
    addressIndex: IWalletItem<IAddressTypeContent<IAddress>>;
    lastUsedAddressIndex: IWalletItem<IAddressTypeContent<IAddress>>;
    changeAddresses: IWalletItem<IAddressTypeContent<IAddresses>>;
    changeAddressIndex: IWalletItem<IAddressTypeContent<IAddress>>;
    lastUsedChangeAddressIndex: IWalletItem<IAddressTypeContent<IAddress>>;
    utxos: IWalletItem<IUtxo[]>;
    transactions: IWalletItem<IFormattedTransactions>;
    blacklistedUtxos: IWalletItem<[]>;
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
    rbfData: IWalletItem<object>;
    transaction: IWalletItem<IBitcoinTransactionData>;
  };
  setHeader: Action<WalletModelType, IHeader>;
  updateWalletInfo: Action<WalletModelType, Partial<WalletModelType['walletinfo']>>;
  fees: IOnchainFees;
  updateFees: Action<WalletModelType, IOnchainFees>;
  setAddresses: Action<WalletModelType, Partial<WalletModelType['walletinfo']>>;
  setAddressIndexes: Action<WalletModelType, Partial<WalletModelType['walletinfo']>>;
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
    addresses: getAddressesShape(),
    addressIndex: getAddressIndexShape(),
    lastUsedAddressIndex: getAddressIndexShape(),
    changeAddresses: getAddressesShape(),
    changeAddressIndex: getAddressIndexShape(),
    lastUsedChangeAddressIndex: getAddressIndexShape(),
    utxos: arrayTypeItems,
    transactions: objectTypeItems,
    blacklistedUtxos: arrayTypeItems,
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
    rbfData: objectTypeItems,
    transaction: bitcoinTransaction,
  },
  fees: {
    fast: 4, // 10-20 mins
    normal: 3, // 20-60 mins
    slow: 2, // 1-2 hrs
    minimum: 1,
    timestamp: Date.now() - 60 * 30 * 1000 - 1, // minus 30 mins
  },
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
  setAddresses: action((state, payload) => {
    state.walletinfo.addresses = { ...state.walletinfo.addresses, ...payload };
  }),
  setAddressIndexes: action((state, payload) => {
    state.walletinfo.addressIndex = { ...state.walletinfo.addressIndex, ...payload };
  }),
};

export const defaultWalletShape: Readonly<IWallet> = {
  id: 'wallet0',
  name: '',
  type: 'default',
  addresses: getAddressesShape(),
  addressIndex: getAddressIndexShape(),
  lastUsedAddressIndex: getAddressIndexShape(),
  changeAddresses: getAddressesShape(),
  changeAddressIndex: getAddressIndexShape(),
  lastUsedChangeAddressIndex: getAddressIndexShape(),
  utxos: arrayTypeItems,
  transactions: objectTypeItems,
  blacklistedUtxos: arrayTypeItems,
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
  rbfData: objectTypeItems,
  transaction: bitcoinTransaction,
};

export const getDefaultWalletShape = (): IWallet => {
  return cloneDeep(defaultWalletShape);
};
