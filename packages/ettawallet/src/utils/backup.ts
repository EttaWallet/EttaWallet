/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import Logger from './logger';
import CryptoJS from 'crypto-js';
import { ErrorMessages } from './errors';
import {
  removeStoredItem,
  retrieveStoredItem,
  storeItem,
} from '../../storage/keychain';
import { getPassword } from '../utils/auth';

const TAG = 'Backup/utils';

const MNEMONIC_STORAGE_KEY = 'mnemonic';

export function countMnemonicWords(phrase: string): number {
  return [...phrase.trim().split(/\s+/)].length;
}

export function formatBackupPhraseOnEdit(phrase: string) {
  return phrase.replace(/\s+/gm, ' ');
}

function isValidMnemonic(phrase: string, length: number) {
  return (
    !!phrase && countMnemonicWords(formatBackupPhraseOnEdit(phrase)) === length
  );
}

export function isValidBackupPhrase(phrase: string) {
  return isValidMnemonic(phrase, 12);
}

export async function storeMnemonic(
  mnemonic: string,
  account: string | null,
  password?: string
) {
  if (!account) {
    throw new Error('Account not yet initialized');
  }
  const passwordToUse = password ?? (await getPassword(account));
  const encryptedMnemonic = await encryptMnemonic(mnemonic, passwordToUse);
  return storeItem({ key: MNEMONIC_STORAGE_KEY, value: encryptedMnemonic });
}

export async function clearStoredMnemonic() {
  await removeStoredItem(MNEMONIC_STORAGE_KEY);
}

export async function getStoredMnemonic(
  account: string | null,
  password?: string
): Promise<string | null> {
  try {
    if (!account) {
      throw new Error('Account not yet initialized');
    }

    Logger.debug(TAG, 'Checking keystore for mnemonic');
    const encryptedMnemonic = await retrieveStoredItem(MNEMONIC_STORAGE_KEY);
    if (!encryptedMnemonic) {
      throw new Error('No mnemonic found in storage');
    }

    const passwordToUse = password ?? (await getPassword(account));
    return decryptMnemonic(encryptedMnemonic, passwordToUse);
  } catch (error) {
    Logger.error(TAG, 'Failed to retrieve mnemonic', error);
    return null;
  }
}

export function onGetMnemonicFail(
  viewError: (error: ErrorMessages) => void,
  context?: string
) {
  viewError(ErrorMessages.FAILED_FETCH_MNEMONIC);
}

export async function encryptMnemonic(phrase: string, password: string) {
  return CryptoJS.AES.encrypt(phrase, password).toString();
}

export async function decryptMnemonic(
  encryptedMnemonic: string,
  password: string
) {
  const bytes = CryptoJS.AES.decrypt(encryptedMnemonic, password);
  return bytes.toString(CryptoJS.enc.Utf8);
}
