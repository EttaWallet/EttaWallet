import { TCreatePaymentReq, TInvoice } from '@synonymdev/react-native-ldk';
import { TAvailableNetworks } from './networks';

export enum AppState {
  Background = 'Background',
  Active = 'Active',
  Inactive = 'Inactive',
}

export enum ErrorCategory {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
}

export enum TransactionState {
  Success = 'Successful',
  Pending = 'Pending',
  Failed = 'Failed',
}

export enum PinType {
  Unset = 'Unset',
  Custom = 'Custom',
  Device = 'Device',
}

export interface IResponse<T> {
  error: boolean;
  data: T;
}
// Electrum
export interface IFormattedPeerData {
  ip?: string;
  host: string;
  version?: string;
  ssl: string | number;
  tcp: string | number;
}

export interface ISubscribeToHeader {
  data: {
    height: number;
    hex: string;
  };
  error: boolean;
  id: string;
  method: string;
}

export interface ISubscribeToAddress {
  data: {
    id: number;
    jsonrpc: string;
    result: null;
  };
  error: boolean;
  id: number;
  method: string;
}

export interface IGetHeaderResponse {
  id: Number;
  error: boolean;
  method: 'getHeader';
  data: string;
  network: TAvailableNetworks;
}

export type TGetAddressHistory = { txid: string; height: number };

export interface IHeader {
  height: number;
  hash: string;
  hex: string;
}

export type TProtocol = 'ssl' | 'tcp';

export interface ICustomElectrumPeer {
  host: string;
  ssl: number; //ssl port
  tcp: number; //tcp port
  protocol: TProtocol;
}

export const header: Readonly<IHeader> = {
  height: 0,
  hash: '',
  hex: '',
};

export enum EAccount {
  name = 'wallet0',
  currentAccountKey = 'currentAccount',
}

export type TWalletName = `wallet${number}`;

export enum EAddressType {
  p2wpkh = 'p2wpkh',
  p2sh = 'p2sh',
  p2pkh = 'p2pkh',
  // p2wsh = 'p2wsh',
  // p2tr = 'p2tr',
}

export interface IAddressTypeData {
  type: EAddressType;
  path: string;
  label: string;
}

export type IAddressTypes = {
  [key in EAddressType]: IAddressTypeData;
};

export type IAddressTypeContent<T> = {
  [key in EAddressType]: T;
};

export interface IAddress {
  index: number;
  path: string;
  address: string;
  scriptHash: string;
  publicKey: string;
}

export interface IAddresses {
  [scriptHash: string]: IAddress;
}

export interface ICreateWallet {
  walletName?: TWalletName;
  mnemonic?: string;
  bip39Passphrase?: string;
  addressCount?: number;
  changeAddressCount?: number;
  addressTypes?: Partial<IAddressTypes>;
  selectedNetwork?: TAvailableNetworks;
}

export interface IWalletStore {
  walletExists: boolean;
  selectedNetwork: TAvailableNetworks;
  addressTypes: IAddressTypes;
  header: IWalletItem<IHeader>;
}

export interface IWalletItem<T> {
  bitcoin: T;
  bitcoinTestnet: T;
  bitcoinRegtest: T;
  timestamp?: number | null;
}

export interface IOutput {
  address?: string; //Address to send to.
  value?: number; //Amount denominated in sats.
  index: number; //Used to specify which output to update or edit when using updateBitcoinTransaction.
}

export enum EFeeId {
  instant = 'instant',
  fast = 'fast',
  normal = 'normal',
  slow = 'slow',
  minimum = 'minimum',
  custom = 'custom',
  none = 'none',
}

export enum EBoostType {
  rbf = 'rbf',
  cpfp = 'cpfp',
}

//On-chain fee estimates in sats/vbyte
export interface IOnchainFees {
  fast: number; // 10-20 mins
  normal: number; // 20-60 mins
  slow: number; // 1-2 hrs
  minimum: number;
  timestamp: number;
}

export interface IFees {
  onchain: IOnchainFees;
}

export interface IGetFeeEstimatesResponse {
  fastestFee: number;
  halfHourFee: number;
  hourFee: number;
  minimumFee: number;
}
export interface IWallet {
  id: TWalletName;
  name: string;
  type: string;
  seedHash?: string;
  balance: number;
  lastUpdated: number;
  hasBackedUpWallet: boolean;
  walletBackupTimestamp: string;
  keyDerivationPath: IKeyDerivationPath;
  networkTypePath: string;
  addressType: EAddressType;
}

export interface IVin {
  scriptSig: {
    asm: string;
    hex: string;
  };
  sequence: number;
  txid: string;
  txinwitness: string[];
  vout: number;
}

export interface ITxHash {
  tx_hash: string;
}

export interface IUtxo {
  address: string;
  index: number;
  path: string;
  scriptHash: string;
  height: number;
  tx_hash: string;
  tx_pos: number;
  value: number;
}

export type TKeyDerivationAccountType = 'onchain';
export type TKeyDerivationPurpose = '84' | '49' | '44'; //"p2wpkh" | "p2sh" | "p2pkh";
export type TKeyDerivationCoinType = '0' | '1'; //"mainnet" | "testnet";
export type TKeyDerivationAccount = '0'; //"On-Chain Wallet";
export type TKeyDerivationChange = '0' | '1'; //"Receiving Address" | "Change Address";
export type TKeyDerivationAddressIndex = string;

// m / purpose' / coin_type' / account' / change / address_index
export interface IKeyDerivationPath {
  purpose: TKeyDerivationPurpose;
  coinType: TKeyDerivationCoinType;
  account: TKeyDerivationAccount;
  change: TKeyDerivationChange;
  addressIndex: TKeyDerivationAddressIndex;
}

export interface IKeyDerivationPathData {
  pathString: string;
  pathObject: IKeyDerivationPath;
}

// Lightning

export enum NodeState {
  OFFLINE = 'offline',
  ERROR = 'error',
  START = 'start',
  COMPLETE = 'complete',
}

export enum EPaymentType {
  sent = 'sent',
  received = 'received',
}

export type IInvoice = {
  [key: string]: TInvoice;
};

export enum EPaymentRequestType {
  channelopen = 'channelopen',
  invoice = 'invoice',
}

export type TLdkInvoice = TInvoice & {
  tags: {};
  note: string;
  category: EPaymentRequestType;
};

export type TCreateLightningInvoice = TCreatePaymentReq & {
  selectedNetwork?: TAvailableNetworks;
  checkOpenChannels?: boolean;
};

export type TLightningPayment = {
  invoice: TInvoice;
  type: EPaymentType;
};

export type TLightningNodeVersion = {
  ldk: string;
  c_bindings: string;
};

export type TUseChannelBalance = {
  spendingTotal: number; // How many sats the user has reserved in the channel. (Outbound capacity + Punishment Reserve)
  spendingAvailable: number; // How much the user is able to spend from a channel. (Outbound capacity - Punishment Reserve)
  receivingTotal: number; // How many sats the counterparty has reserved in the channel. (Inbound capacity + Punishment Reserve)
  receivingAvailable: number; // How many sats the user is able to receive in a channel. (Inbound capacity - Punishment Reserve)
  capacity: number; // Total capacity of the channel. (spendingTotal + receivingTotal)
};

export type TLightningActivityItem = {
  id: string;
  txType: EPaymentType;
  txId: string;
  value: number;
  address: string;
  message: string;
  timestamp: number;
};

export enum ELightningDataType {
  paymentRequest = 'paymentRequest',
  nodeId = 'nodeId',
}

export type TDecodedInput = {
  type: ELightningDataType;
  value?: string;
  amount?: number;
};

export interface IDecodedData {
  network?: TAvailableNetworks;
  dataType: ELightningDataType;
  sats?: number;
  paymentRequest?: string;
  message?: string;
  url?: string; // possibly node URI
}

// Wallets
export interface IGetAddress {
  path: string;
  type: EAddressType;
  selectedNetwork?: TAvailableNetworks;
}

export interface IGetAddressResponse {
  address: string;
  path: string;
  publicKey: string;
}

export interface IGenerateAddresses {
  selectedWallet?: TWalletName;
  addressCount?: number;
  changeAddressCount?: number;
  addressIndex?: number;
  changeAddressIndex?: number;
  selectedNetwork?: TAvailableNetworks;
  keyDerivationPath?: IKeyDerivationPath;
  accountType?: TKeyDerivationAccountType;
  addressType?: EAddressType;
  seed?: Buffer;
}

export interface IGenerateAddressesResponse {
  addresses: IAddresses;
  changeAddresses: IAddresses;
}

export const addressContent: Readonly<IAddress> = {
  index: -1,
  path: '',
  address: '',
  scriptHash: '',
  publicKey: '',
};

export const addressTypes: Readonly<IAddressTypes> = {
  [EAddressType.p2pkh]: {
    path: "m/44'/0'/0'/0/0",
    type: EAddressType.p2pkh,
    label: 'legacy',
  },
  [EAddressType.p2sh]: {
    path: "m/49'/0'/0'/0/0",
    type: EAddressType.p2sh,
    label: 'segwit',
  },
  [EAddressType.p2wpkh]: {
    path: "m/84'/0'/0'/0/0",
    type: EAddressType.p2wpkh,
    label: 'bech32',
  },
};

export interface IElectrumPeerData {
  host: string;
  port: string;
  protocol: 'tcp' | 'ssl';
}

export enum ELocalCurrencyCode {
  USD = 'USD',
  UGX = 'UGX',
  KES = 'KES',
  EUR = 'EUR',
  GBP = 'GBP',
  GHS = 'GHS',
  NGN = 'NGN',
  RWF = 'RWF',
}

export enum ELocalCurrencySymbol {
  USD = '$',
  UGX = 'UGX',
  KES = 'KSh',
  EUR = '€',
  GBP = '£',
  GHS = 'GH₵',
  NGN = '₦',
  RWF = 'FRw',
}

export type TModifyInvoice = {
  payment_hash: TLdkInvoice['payment_hash'];
  modified_request: TLdkInvoice['to_str'];
};
