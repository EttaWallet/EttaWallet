import BigNumber from 'bignumber.js';

export enum PincodeType {
  Unset = 'Unset',
  CustomPin = 'CustomPin',
  PhoneAuth = 'PhoneAuth',
}

export enum Mode {
  Entering,
  Checking,
  Failed,
}

export interface Content {
  word: string;
  index: number;
}

export interface FeeStruct {
  label: string;
  time: string;
  type: string;
  rate: string;
  amount: number;
}

export interface LocalAmountStruct {
  value: BigNumber.Value;
  currencyCode: string;
  exchangeRate: string;
}

export interface BtcAmountStruct {
  value: BigNumber.Value;
  localAmount?: LocalAmountStruct;
}

export interface TransactionStruct {
  transactionHash: string;
  timestamp: number;
  block: string;
  address: string;
  amount: BtcAmountStruct;
  metadata: [];
  fees: FeeStruct[];
}
