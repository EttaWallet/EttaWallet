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
