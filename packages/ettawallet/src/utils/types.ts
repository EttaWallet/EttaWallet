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
