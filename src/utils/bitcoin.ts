import * as bitcoin from 'bitcoinjs-lib';
import * as bip39 from 'bip39';
import { BIP32Factory } from 'bip32';
import ecc from '@bitcoinerlab/secp256k1';
import { TAvailableNetworks } from '@synonymdev/react-native-ldk';
import { Result, err } from './result';
import { getBip39Passphrase, getSelectedNetwork } from './wallet';
import { IGetAddress, IGetAddressResponse } from './types';
import { getMnemonicPhrase } from './lightning/helpers';
import { getBitcoinJSNetwork } from './networks';

// You must wrap a tiny-secp256k1 compatible implementation
const BIP32 = BIP32Factory(ecc);

const sha256 = (str) => {
  return bitcoin.crypto.sha256(str);
};

/**
 * @param {string} accountSeed
 * @returns {string}
 */
export const getMnemonicPhraseFromSeed = (accountSeed: string): string => {
  return bip39.entropyToMnemonic(accountSeed);
};

export const generateMnemonic = async ({ strength = 128 }: { strength?: number }) => {
  try {
    const mnemonic = bip39.generateMnemonic(strength);
    return { error: false, value: mnemonic };
  } catch (e) {
    return { error: true, value: e };
  }
};

export const getPrivateKey = async ({
  mnemonic = '',
  bip39Passphrase = '',
  path = '',
  selectedNetwork = undefined,
}: {
  mnemonic: string;
  path: string;
  bip39Passphrase: string;
  selectedNetwork?: TAvailableNetworks;
}) => {
  try {
    if (!selectedNetwork) {
      selectedNetwork = getSelectedNetwork();
    }

    const seed = await bip39.mnemonicToSeed(mnemonic, bip39Passphrase);
    const network = getBitcoinJSNetwork[selectedNetwork!];
    const root = BIP32.fromSeed(seed, network);
    const addressKeypair = root.derivePath(path);
    return { error: false, value: addressKeypair.toWIF() };
  } catch (e) {
    return { error: true, value: e };
  }
};

export const getBitcoinAddress = async ({
  path,
  selectedNetwork,
  type,
}: IGetAddress): Promise<Result<IGetAddressResponse>> => {
  return new Promise(async (resolve) => {
    try {
      if (!selectedNetwork) {
        selectedNetwork = getSelectedNetwork();
      }

      if (!path) {
        return resolve({ error: true, value: 'No path provided.' });
      }
      if (!type) {
        return resolve({ error: true, value: 'No address type provided.' });
      }

      //   const mnemonic = bip39.generateMnemonic();

      const mnemonicResponse = await getMnemonicPhrase();
      if (mnemonicResponse.isErr()) {
        return err(mnemonicResponse.error.message);
      }

      const mnemonic = mnemonicResponse.value;

      console.log(mnemonic);

      const bip39Passphrase = await getBip39Passphrase();
      const network = getBitcoinJSNetwork(selectedNetwork);
      const seed = await bip39.mnemonicToSeed(mnemonic, bip39Passphrase);
      const root = BIP32.fromSeed(seed, network);
      const keyPair = root.derivePath(path);
      let address = '';
      switch (type) {
        case 'p2wpkh':
          //Get Native Bech32 (bc1) addresses
          address = bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey, network }).address!;
          break;
        case 'p2sh':
          //Get Segwit P2SH Address (3)
          address = bitcoin.payments.p2sh({
            redeem: bitcoin.payments.p2wpkh({
              pubkey: keyPair.publicKey,
              network,
            }),
            network,
          }).address!;
          break;
        case 'p2pkh':
          //Get Legacy Address (1)
          address = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network }).address!;
          break;
      }
      const value = {
        address,
        path,
        publicKey: keyPair.publicKey.toString('hex'),
      };
      return resolve({ error: false, value });
    } catch (e) {
      return err(e);
    }
  });
};

export const getBitcoinScriptHash = async (
  address: string,
  selectedNetwork?: TAvailableNetworks
): Promise<string> => {
  return new Promise((resolve) => {
    try {
      if (!address || !selectedNetwork) {
        return resolve('No address or network provided.');
      }
      const network = getBitcoinJSNetwork(selectedNetwork);
      const script = bitcoin.address.toOutputScript(address, network);
      const hash = sha256(script);
      const reversedHash = Buffer.from(hash.reverse());
      const value = reversedHash.toString('hex');
      return resolve(value);
    } catch (e) {
      return resolve(e);
    }
  });
};
