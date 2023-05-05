import { EAvailableNetworks, TAvailableNetworks } from '../utils/networks';
import {
  EAddressType,
  ICreateWallet,
  IGetFeeEstimatesResponse,
  IKeyDerivationPath,
  IKeyDerivationPathData,
  IOnchainFees,
  IWallets,
  TKeyDerivationAccount,
  TKeyDerivationAccountType,
  TKeyDerivationChange,
  TKeyDerivationCoinType,
  TKeyDerivationPurpose,
  TWalletName,
} from './types';
import store from '../state/store';
import { getKeychainValue, setKeychainValue } from './keychain';
import { Result, err, ok } from './result';
import * as bip39 from 'bip39';
import { getDefaultWalletShape, walletModel } from '../state/models/wallet';
import { subscribeToAddresses } from './electrum/helpers';
import * as bitcoin from 'bitcoinjs-lib';
import { InteractionManager } from 'react-native';
import { refreshLdk } from '../ldk';
import { generateMnemonic, getBitcoinAddress } from './bitcoin';
import { IWallet } from './types';

export const WALLET_SEED_HASH_PREFIX = Buffer.from('@ettaln/wallet-uuid');

export const REFRESH_INTERVAL = 60 * 30; // in seconds, 30 minutes

export const seedHash = (seed: Buffer): string => {
  return bitcoin.crypto.sha256(Buffer.concat([WALLET_SEED_HASH_PREFIX, seed])).toString('hex');
};

/**
 * Returns the current state of the wallet store
 * @return IAddressTypes
 */
export const getWalletStore = () => {
  return store.getState().wallet;
};

/**
 * Returns the currently selected network (bitcoin | bitcoinTestnet).
 * @return {TAvailableNetworks}
 */
export const getSelectedNetwork = (): TAvailableNetworks => {
  return getWalletStore().selectedNetwork;
};

/**
 * Returns the currently selected wallet (Ex: 'wallet0').
 * @return {TWalletName}
 */
export const getSelectedWallet = (): TWalletName => {
  return getWalletStore().defaultWallet;
};

/**
 * Returns the currently selected address type (p2pkh | p2sh | p2wpkh | p2tr).
 * @returns {EAddressType}
 */
export const getSelectedAddressType = ({
  selectedNetwork,
}: {
  selectedNetwork?: TAvailableNetworks;
} = {}): EAddressType => {
  if (!selectedNetwork) {
    selectedNetwork = getSelectedNetwork();
  }

  const wallet = getWalletStore().walletinfo;
  if (wallet?.addressType[selectedNetwork]) {
    return wallet.addressType[selectedNetwork];
  } else {
    return getDefaultWalletShape().addressType[selectedNetwork];
  }
};

/**
 * Get bip39 passphrase for a specified wallet.
 * @async
 * @return {Promise<string>}
 */
export const getBip39Passphrase = async (selectedWallet?: TWalletName): Promise<string> => {
  try {
    if (!selectedWallet) {
      selectedWallet = getSelectedWallet();
    }
    const key = `${selectedWallet}passphrase`;
    const bip39PassphraseResult = await getKeychainValue({ key });
    if (!bip39PassphraseResult.error && bip39PassphraseResult.data) {
      return bip39PassphraseResult.data;
    }
    return '';
  } catch {
    return '';
  }
};

/**
 * Determine if a given mnemonic is valid.
 * @param {string} mnemonic - The mnemonic to validate.
 * @return {boolean}
 */
export const validateMnemonic = (mnemonic: string): boolean => {
  try {
    return bip39.validateMnemonic(mnemonic);
  } catch (error) {
    console.error('error validating mnemonic', error);
    return false;
  }
};

export const keyDerivationAccountTypes: {
  onchain: TKeyDerivationAccount;
} = {
  onchain: '0',
};

/**
 * Returns the next available receive address for the given network and wallet.
 * @param {TAvailableNetworks} [selectedNetwork]
 * @return {Result<string>}
 */
export const getReceiveAddress = async ({
  addressType,
  selectedNetwork,
}: {
  addressType?: EAddressType;
  selectedNetwork?: TAvailableNetworks;
}): Promise<Result<string>> => {
  try {
    if (!selectedNetwork) {
      selectedNetwork = getSelectedNetwork();
    }

    if (!addressType) {
      addressType = getSelectedAddressType({ selectedNetwork });
    }

    let keyDerivationPath;

    // Set derivation path accordingly based on address type.
    const keyDerivationPathResponse = getKeyDerivationPath({
      selectedNetwork,
      addressType,
    });
    if (keyDerivationPathResponse.isErr()) {
      return err(keyDerivationPathResponse.error.message);
    } else {
      keyDerivationPath = keyDerivationPathResponse.value;
    }

    // get address index from wallet store
    const index = getWalletStore().walletinfo.addressIndex;
    const path = { ...keyDerivationPath! };
    path.addressIndex = `${index}`;
    const addressPath = formatKeyDerivationPath({
      path,
      selectedNetwork,
      accountType: 'onchain',
      changeAddress: false,
      addressIndex: `${index}`,
    });
    if (addressPath.isErr()) {
      return err(addressPath.error.message);
    }

    const addressResponse = await getBitcoinAddress({
      selectedNetwork,
      type: addressType,
      path: addressPath.value.pathString,
    });

    if (addressResponse) {
      // after address is generated, increment address index in wallet store:
      const newAddressIndex = index + 1;
      store.dispatch.wallet.setAddressIndex(newAddressIndex);
      return addressResponse;
    } else {
      return err('No receive address available.');
    }
  } catch (e) {
    return err(e);
  }
};

/**
 * Parses a key derivation path object and returns it in string format. Ex: "m/84'/0'/0'/0/0"
 * @param {IKeyDerivationPath} path
 * @param {TKeyDerivationPurpose | string} [purpose]
 * @param {boolean} [changeAddress]
 * @param {TKeyDerivationAccountType} [accountType]
 * @param {string} [addressIndex]
 * @param {TAvailableNetworks} [selectedNetwork]
 * @return {Result<string>}
 */
export const getKeyDerivationPathString = ({
  path,
  purpose,
  accountType,
  changeAddress,
  addressIndex = '0',
  selectedNetwork,
}: {
  path: IKeyDerivationPath;
  purpose?: TKeyDerivationPurpose;
  accountType?: TKeyDerivationAccountType;
  changeAddress?: boolean;
  addressIndex?: string;
  selectedNetwork?: TAvailableNetworks;
}): Result<string> => {
  try {
    if (!path) {
      return err('No path specified.');
    }
    //Specifically specifying purpose will override the default accountType purpose value.
    if (purpose) {
      path.purpose = purpose;
    }

    if (selectedNetwork) {
      path.coinType = selectedNetwork.toLocaleLowerCase().includes('testnet') ? '1' : '0';
    }
    if (accountType) {
      path.account = getKeyDerivationAccount(accountType);
    }
    if (changeAddress !== undefined) {
      path.change = changeAddress ? '1' : '0';
    }
    return ok(
      `m/${path.purpose}'/${path.coinType}'/${path.account}'/${path.change}/${addressIndex}`
    );
  } catch (e) {
    return err(e);
  }
};

/**
 * Formats and returns the provided derivation path string and object.
 * @param {IKeyDerivationPath} path
 * @param {TKeyDerivationPurpose | string} [purpose]
 * @param {boolean} [changeAddress]
 * @param {TKeyDerivationAccountType} [accountType]
 * @param {string} [addressIndex]
 * @param {TAvailableNetworks} [selectedNetwork]
 * @return {Result<{IKeyDerivationPathData}>} Derivation Path Data
 */
export const formatKeyDerivationPath = ({
  path,
  purpose,
  selectedNetwork,
  accountType = 'onchain',
  changeAddress = false,
  addressIndex = '0',
}: {
  path: IKeyDerivationPath | string;
  purpose?: TKeyDerivationPurpose;
  selectedNetwork?: TAvailableNetworks;
  accountType?: TKeyDerivationAccountType;
  changeAddress?: boolean;
  addressIndex?: string;
}): Result<IKeyDerivationPathData> => {
  try {
    if (!selectedNetwork) {
      selectedNetwork = getSelectedNetwork();
    }

    if (typeof path === 'string') {
      const derivationPathResponse = getKeyDerivationPathObject({
        path,
        purpose,
        selectedNetwork,
        accountType,
        changeAddress,
        addressIndex,
      });
      if (derivationPathResponse.isErr()) {
        return err(derivationPathResponse.error.message);
      }
      path = derivationPathResponse.value;
    }
    const pathObject = path;

    const pathStringResponse = getKeyDerivationPathString({
      //@ts-ignore hmm
      path: pathObject,
      purpose,
      selectedNetwork,
      accountType,
      changeAddress,
      addressIndex,
    });
    if (pathStringResponse.isErr()) {
      return err(pathStringResponse.error.message);
    }
    const pathString = pathStringResponse.value;
    return ok({ pathObject, pathString });
  } catch (e) {
    return err(e);
  }
};

/**
 * Returns the account param of the key derivation path based on the specified account type.
 * @param {TKeyDerivationAccountType} [accountType]
 * @return {TKeyDerivationAccount}
 */
export const getKeyDerivationAccount = (
  accountType: TKeyDerivationAccountType = 'onchain'
): TKeyDerivationAccount => {
  return keyDerivationAccountTypes[accountType];
};

/**
 * Parses a key derivation path in string format Ex: "m/84'/0'/0'/0/0" and returns IKeyDerivationPath.
 * @param {string} keyDerivationPath
 * @param {TKeyDerivationPurpose | string} [purpose]
 * @param {boolean} [changeAddress]
 * @param {TKeyDerivationAccountType} [accountType]
 * @param {string} [addressIndex]
 * @param {TAvailableNetworks} [selectedNetwork]
 * @return {Result<IKeyDerivationPath>}
 */
export const getKeyDerivationPathObject = ({
  path = '',
  purpose,
  accountType,
  changeAddress,
  addressIndex,
  selectedNetwork,
}: {
  path: string;
  purpose?: TKeyDerivationPurpose;
  accountType?: TKeyDerivationAccountType;
  changeAddress?: boolean;
  addressIndex?: string;
  selectedNetwork?: TAvailableNetworks;
}): Result<IKeyDerivationPath> => {
  try {
    const parsedPath = path.replace(/'/g, '').split('/');

    if (!purpose) {
      purpose = parsedPath[1] as TKeyDerivationPurpose;
    }

    let coinType = parsedPath[2] as TKeyDerivationCoinType;
    if (selectedNetwork) {
      coinType = selectedNetwork.toLocaleLowerCase().includes('testnet') ? '1' : '0';
    }

    let account = parsedPath[3] as TKeyDerivationAccount;
    if (accountType) {
      account = getKeyDerivationAccount(accountType);
    }

    let change = parsedPath[4] as TKeyDerivationChange;
    if (changeAddress !== undefined) {
      change = changeAddress ? '1' : '0';
    }

    if (!addressIndex) {
      addressIndex = parsedPath[5];
    }

    return ok({
      purpose,
      coinType,
      account,
      change,
      addressIndex,
    });
  } catch (e) {
    return err(e);
  }
};

/**
 * Returns the derivation path object for the specified addressType and network.
 * @param {EAddressType} addressType
 * @param {TAvailableNetworks} [selectedNetwork]
 * @returns Result<IKeyDerivationPath>
 */
export const getKeyDerivationPath = ({
  addressType,
  selectedNetwork,
}: {
  addressType: EAddressType;
  selectedNetwork?: TAvailableNetworks;
}): Result<IKeyDerivationPath> => {
  try {
    if (!selectedNetwork) {
      selectedNetwork = getSelectedNetwork();
    }
    const addressTypes = getWalletStore().addressTypes;
    const keyDerivationPathResponse = getKeyDerivationPathObject({
      selectedNetwork,
      path: addressTypes[addressType].path,
    });
    if (keyDerivationPathResponse.isErr()) {
      return err(keyDerivationPathResponse.error.message);
    }
    return ok(keyDerivationPathResponse.value);
  } catch (e) {
    return err(e);
  }
};

/**
 * Generates a newly specified wallet.
 * @param {string} [wallet]
 * @param {string} [mnemonic]
 * @param {string} [bip39Passphrase]
 * @return {Promise<Result<IWallet>>}
 */
export const createDefaultWallet = async ({
  walletName = getDefaultWalletShape().id,
  bip39Passphrase = '',
  addressTypes,
  selectedNetwork,
}: ICreateWallet): Promise<Result<IWallets>> => {
  try {
    if (!selectedNetwork) {
      selectedNetwork = getSelectedNetwork();
    }

    if (!addressTypes) {
      // using native segwit by default
      addressTypes = { p2wpkh: getWalletStore().addressTypes.p2wpkh };
    }

    const selectedAddressType = getSelectedAddressType();

    // check if request came with bip39 passphrase
    if (!bip39Passphrase) {
      bip39Passphrase = await getBip39Passphrase(walletName);
    }

    // generate new mnemonic
    const mnemonic = await generateMnemonic({});
    if (!mnemonic) {
      return err('Unable to generate mnemonic.');
    }

    // validate mnemonic
    if (!validateMnemonic(mnemonic)) {
      return err('Invalid Mnemonic');
    }

    // store mnemonic in device keychain
    await setKeychainValue({ key: walletName, value: mnemonic });
    // store bip39passphrase too in device keychain
    await setKeychainValue({
      key: `${walletName}passphrase`,
      value: bip39Passphrase,
    });

    // generate seed from mnemonic and bip39Passphrase
    const seed = await bip39.mnemonicToSeed(mnemonic, bip39Passphrase);

    // compute seed hash
    const hash = seedHash(seed);

    // get walletinfo defaults from our wallet state model
    const defaultWalletShape = getDefaultWalletShape();

    // update default wallet
    const payload: IWallet = {
      ...defaultWalletShape,
      seedHash: hash,
      addressType: {
        bitcoin: selectedAddressType,
        bitcoinTestnet: selectedAddressType,
        bitcoinRegtest: selectedAddressType,
      },
      id: walletName,
    };

    // dispatch action to update walletinfo object in wallet store
    store.dispatch.wallet.updateWalletInfo(payload);
    // dispatch action to set walletExists to true
    store.dispatch.wallet.setWalletExists(true);
    return ok('');
  } catch (e) {
    return err(e);
  }
};

export const refreshWallet = async ({
  selectedNetwork,
}: {
  selectedNetwork?: TAvailableNetworks;
} = {}): Promise<Result<string>> => {
  try {
    if (!selectedNetwork) {
      selectedNetwork = getSelectedNetwork();
    }

    // wait for interactions/animations to be completed
    await new Promise((resolve) => InteractionManager.runAfterInteractions(() => resolve(null)));

    const isConnectedToElectrum = store.getState().app.isConnectedToElectrum;

    if (isConnectedToElectrum) {
      await Promise.all([
        subscribeToAddresses({
          selectedNetwork,
        }),
      ]);
    }

    await refreshLdk({ selectedNetwork });

    // reorg transactions, run tests etc

    return ok('');
  } catch (e) {
    return err(e);
  }
};

/**
 * Returns the current fee estimates for the provided network.
 * @param {TAvailableNetworks} [selectedNetwork]
 * @returns {Promise<IOnchainFees>}
 */
export const getFeeEstimates = async (
  selectedNetwork?: TAvailableNetworks
): Promise<IOnchainFees> => {
  try {
    if (!selectedNetwork) {
      selectedNetwork = getSelectedNetwork();
    }

    if (__DEV__ && selectedNetwork === EAvailableNetworks.bitcoinRegtest) {
      return walletModel.fees;
    }

    const urlModifier = selectedNetwork === 'bitcoin' ? '' : 'testnet/';
    const response = await fetch(`https://mempool.space/${urlModifier}api/v1/fees/recommended`);
    const res: IGetFeeEstimatesResponse = await response.json();
    return {
      fast: res.fastestFee,
      normal: res.halfHourFee,
      slow: res.hourFee,
      minimum: res.minimumFee,
      timestamp: Date.now(),
    };
  } catch {
    return walletModel.fees;
  }
};

export const updateFeeEstimates = async ({
  selectedNetwork,
  forceUpdate = false,
}: {
  selectedNetwork: TAvailableNetworks;
  forceUpdate?: boolean;
}): Promise<Result<string>> => {
  const feesStore = getWalletStore().fees;
  const timestamp = feesStore.timestamp;
  const difference = Math.floor((Date.now() - timestamp) / 1000);

  if (forceUpdate || (timestamp && difference > REFRESH_INTERVAL)) {
    const feeEstimates = await getFeeEstimates(selectedNetwork);
    // update fees object in state
    store.dispatch.wallet.updateFees(feeEstimates);
  }

  return ok('Successfully updated on-chain fee estimates.');
};
