import { EAvailableNetworks, TAvailableNetworks } from '../utils/networks';
import {
  EAddressType,
  IAddress,
  IAddresses,
  ICreateWallet,
  IGenerateAddresses,
  IGenerateAddressesResponse,
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
import { GAP_LIMIT } from './electrum/helpers';
import * as bitcoin from 'bitcoinjs-lib';
import { InteractionManager } from 'react-native';
import { refreshLdk } from '../ldk';
import { objectKeys } from './helpers';
import { getBitcoinAddress, getBitcoinScriptHash } from './bitcoin';

export const WALLET_SEED_HASH_PREFIX = Buffer.from('@ettaln/wallet-uuid');

const NUMBER_OF_ADDRESSES = 5;

export const REFRESH_INTERVAL = 60 * 30; // in seconds, 30 minutes

export const seedHash = (seed: Buffer): string => {
  return bitcoin.crypto.sha256(Buffer.concat([WALLET_SEED_HASH_PREFIX, seed])).toString('hex');
};

/**
 * Returns available address types for the given network and wallet
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
 * Returns the difference between the current address index and the last used address index.
 * @param {TAvailableNetworks} [selectedNetwork]
 * @returns {Result<{ addressDelta: number; changeAddressDelta: number }>}
 */
export const getGapLimit = ({
  selectedNetwork,
  addressType,
}: {
  selectedNetwork?: TAvailableNetworks;
  addressType?: EAddressType;
}): Result<{ addressDelta: number; changeAddressDelta: number }> => {
  try {
    if (!selectedNetwork) {
      selectedNetwork = getSelectedNetwork();
    }

    if (!addressType) {
      addressType = getSelectedAddressType({ selectedNetwork });
    }
    const walletStore = getWalletStore();

    const currentWallet = walletStore.walletinfo;

    const addressIndex = currentWallet.addressIndex[selectedNetwork][addressType].index;
    const lastUsedAddressIndex =
      currentWallet.lastUsedAddressIndex[selectedNetwork][addressType].index;
    const changeAddressIndex = currentWallet.changeAddressIndex[selectedNetwork][addressType].index;
    const lastUsedChangeAddressIndex =
      currentWallet.lastUsedChangeAddressIndex[selectedNetwork][addressType].index;
    const addressDelta = Math.abs(
      addressIndex - (lastUsedAddressIndex > 0 ? lastUsedAddressIndex : 0)
    );
    const changeAddressDelta = Math.abs(
      changeAddressIndex - (lastUsedChangeAddressIndex > 0 ? lastUsedChangeAddressIndex : 0)
    );

    return ok({ addressDelta, changeAddressDelta });
  } catch (e) {
    console.log(e);
    return err(e);
  }
};

export const generateNewReceiveAddress = async ({
  selectedNetwork,
  addressType,
  keyDerivationPath,
}: {
  selectedNetwork?: TAvailableNetworks;
  addressType?: EAddressType;
  keyDerivationPath?: IKeyDerivationPath;
}): Promise<Result<IAddress>> => {
  try {
    if (!selectedNetwork) {
      selectedNetwork = getSelectedNetwork();
    }

    if (!addressType) {
      addressType = getSelectedAddressType({ selectedNetwork });
    }

    const addressTypes = getWalletStore().addressTypes;

    const currentWallet = getWalletStore().walletinfo;

    const getGapLimitResponse = getGapLimit({
      selectedNetwork,
      addressType,
    });
    if (getGapLimitResponse.isErr()) {
      return err(getGapLimitResponse.error.message);
    }
    const { addressDelta } = getGapLimitResponse.value;

    // If the address delta exceeds the default gap limit, only return the current address index.
    if (addressDelta >= GAP_LIMIT) {
      const addressIndex = currentWallet.addressIndex[selectedNetwork];
      const receiveAddress = addressIndex[addressType];
      return ok(receiveAddress);
    }

    const { path } = addressTypes[addressType];
    if (!keyDerivationPath) {
      const keyDerivationPathResponse = getKeyDerivationPathObject({
        selectedNetwork,
        path,
      });
      if (keyDerivationPathResponse.isErr()) {
        return err(keyDerivationPathResponse.error.message);
      }
      keyDerivationPath = keyDerivationPathResponse.value;
    }
    const addresses = currentWallet.addresses[selectedNetwork][addressType];
    const currentAddressIndex = currentWallet.addressIndex[selectedNetwork][addressType].index;
    const nextAddressIndex = Object.values(addresses).find((address) => {
      return address.index === currentAddressIndex + 1;
    });

    // Check if the next address index already exists or if it needs to be generated.
    if (nextAddressIndex) {
      // Update addressIndex and return the address content.
      const payload = {
        addressIndex: nextAddressIndex,
        addressType,
      };
      store.dispatch.wallet.setAddressIndexes({
        addressIndex: payload.addressIndex[payload.addressType],
      });
      return ok(nextAddressIndex);
    }

    // We need to generate, save and return the new address.
    const addAddressesRes = await addAddresses({
      addressCount: 1,
      changeAddressCount: 0,
      addressIndex: currentAddressIndex + 1,
      changeAddressIndex: 0,
      selectedNetwork,
      keyDerivationPath,
      addressType,
    });
    if (addAddressesRes.isErr()) {
      return err(addAddressesRes.error.message);
    }
    const addressKeys = Object.keys(addAddressesRes.value.addresses);
    // If for any reason the phone was unable to generate the new address, return error.
    if (!addressKeys.length) {
      return err('Unable to generate addresses at this time.');
    }
    const newAddressIndex = addAddressesRes.value.addresses[addressKeys[0]];
    const payload = {
      addressIndex: newAddressIndex,
      addressType,
    };
    // update address indexes in state object
    store.dispatch.wallet.setAddressIndexes({
      addressIndex: payload.addressIndex[payload.addressType],
    });
    return ok(newAddressIndex);
  } catch (e) {
    console.log(e);
    return err(e);
  }
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

    const wallet = getWalletStore().walletinfo;

    const addressIndex = wallet.addressIndex[selectedNetwork];
    const receiveAddress = addressIndex[addressType].address;
    if (receiveAddress) {
      return ok(receiveAddress);
    }
    const addresses = wallet?.addresses[selectedNetwork][addressType];

    // Check if addresses were generated, but the index has not been set yet.
    if (Object.keys(addresses).length > 0 && addressIndex[addressType].index < 0) {
      // Grab and return the address at index 0.
      const address = Object.values(addresses).find(({ index }) => index === 0);
      if (address) {
        return ok(address.address);
      }
    }
    // Fallback to generating a new receive address on the fly.
    const generatedAddress = await generateNewReceiveAddress({
      selectedNetwork,
      addressType,
    });
    if (generatedAddress.isOk()) {
      return ok(generatedAddress.value.address);
    } else {
      console.log(generatedAddress.error.message);
    }
    return err('No receive address available.');
  } catch (e) {
    return err(e);
  }
};

/**
 * This method will compare a set of specified addresses to the currently stored addresses and remove any duplicates.
 * @param {IAddresses} addresses
 * @param {IAddresses} changeAddresses
 * @param {selectedWallet} selectedWallet
 * @param {selectedNetwork} selectedNetwork
 */
export const removeDuplicateAddresses = async ({
  addresses = {},
  changeAddresses = {},
  selectedNetwork,
}: {
  addresses?: IAddresses;
  changeAddresses?: IAddresses;
  selectedWallet?: TWalletName;
  selectedNetwork?: TAvailableNetworks;
}): Promise<Result<IGenerateAddressesResponse>> => {
  try {
    if (!selectedNetwork) {
      selectedNetwork = getSelectedNetwork();
    }

    const currentWallet = getWalletStore().walletinfo;

    const currentAddressTypeContent = currentWallet.addresses[selectedNetwork];
    const currentChangeAddressTypeContent = currentWallet.changeAddresses[selectedNetwork];

    //Remove any duplicate addresses.
    await Promise.all([
      objectKeys(currentAddressTypeContent).map(async (addressType) => {
        await Promise.all(
          objectKeys(addresses).map((scriptHash) => {
            if (scriptHash in currentAddressTypeContent[addressType]) {
              delete addresses[scriptHash];
            }
          })
        );
      }),

      objectKeys(currentChangeAddressTypeContent).map(async (addressType) => {
        await Promise.all(
          objectKeys(changeAddresses).map((scriptHash) => {
            if (scriptHash in currentChangeAddressTypeContent[addressType]) {
              delete changeAddresses[scriptHash];
            }
          })
        );
      }),
    ]);

    return ok({ addresses, changeAddresses });
  } catch (e) {
    return err(e);
  }
};

/**
 * This method will generate addresses as specified and return an object of filtered addresses to ensure no duplicates are returned.
 * @async
 * @param {TWalletName} [selectedWallet]
 * @param {number} [addressAmount]
 * @param {number} [changeAddressAmount]
 * @param {number} [addressIndex]
 * @param {number} [changeAddressIndex]
 * @param {TAvailableNetworks} [selectedNetwork]
 * @param {IKeyDerivationPath} [keyDerivationPath]
 * @param {EAddressType} [addressType]
 * @return {Promise<Result<IGenerateAddressesResponse>>}
 */
export const addAddresses = async ({
  addressCount = 5,
  changeAddressCount = 5,
  addressIndex = 0,
  changeAddressIndex = 0,
  selectedNetwork,
  addressType,
  keyDerivationPath,
}: IGenerateAddresses): Promise<Result<IGenerateAddressesResponse>> => {
  if (!selectedNetwork) {
    selectedNetwork = getSelectedNetwork();
  }

  if (!addressType) {
    addressType = getSelectedAddressType({ selectedNetwork });
  }

  const addressTypes = getWalletStore().addressTypes;
  const { path, type } = addressTypes[addressType];
  if (!keyDerivationPath) {
    const keyDerivationPathResponse = getKeyDerivationPathObject({
      selectedNetwork,
      path,
    });
    if (keyDerivationPathResponse.isErr()) {
      return err(keyDerivationPathResponse.error.message);
    }
    keyDerivationPath = keyDerivationPathResponse.value;
  }
  const generatedAddresses = await generateAddresses({
    addressCount,
    changeAddressCount,
    addressIndex,
    changeAddressIndex,
    selectedNetwork,
    keyDerivationPath,
    addressType: type,
  });
  if (generatedAddresses.isErr()) {
    return err(generatedAddresses.error);
  }

  const removeDuplicateResponse = await removeDuplicateAddresses({
    addresses: generatedAddresses.value.addresses,
    changeAddresses: generatedAddresses.value.changeAddresses,
    selectedNetwork,
  });
  if (removeDuplicateResponse.isErr()) {
    return err(removeDuplicateResponse.error.message);
  }

  const addresses = removeDuplicateResponse.value.addresses;
  const changeAddresses = removeDuplicateResponse.value.changeAddresses;
  if (!Object.keys(addresses).length && !Object.keys(changeAddresses).length) {
    return err('No addresses to add.');
  }

  const payload = {
    addresses,
    changeAddresses,
    addressType,
  };
  // update addresses in state object
  store.dispatch.wallet.setAddresses({
    addresses: payload.addresses[payload.addressType],
    changeAddresses: payload.changeAddresses[payload.addressType],
  });
  return ok({ ...generatedAddresses.value, addressType: type });
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
 * Generates a series of addresses based on the specified params.
 * @async
 * @param {string} selectedWallet - Wallet ID
 * @param {number} [addressAmount] - Number of addresses to generate.
 * @param {number} [changeAddressAmount] - Number of changeAddresses to generate.
 * @param {number} [addressIndex] - What index to start generating addresses at.
 * @param {number} [changeAddressIndex] - What index to start generating changeAddresses at.
 * @param {string} [selectedNetwork] - What network to generate addresses for (bitcoin or bitcoinTestnet).
 * @param {string} [keyDerivationPath] - The path to generate addresses from.
 * @param [TKeyDerivationAccountType] - Specifies which account to generate an address from (onchain).
 * @param {string} [addressType] - Determines what type of address to generate (p2pkh, p2sh, p2wpkh).
 */
export const generateAddresses = async ({
  selectedWallet,
  addressCount = 10,
  changeAddressCount = 10,
  addressIndex = 0,
  changeAddressIndex = 0,
  selectedNetwork,
  keyDerivationPath,
  accountType = 'onchain',
  addressType,
}: IGenerateAddresses): Promise<Result<IGenerateAddressesResponse>> => {
  try {
    if (!selectedWallet) {
      selectedWallet = getSelectedWallet();
    }
    if (!selectedNetwork) {
      selectedNetwork = getSelectedNetwork();
    }
    if (!addressType) {
      // default to native segwit
      addressType = getSelectedAddressType({ selectedNetwork });
    }

    if (!keyDerivationPath) {
      // Set derivation path accordingly based on address type.
      const keyDerivationPathResponse = getKeyDerivationPath({
        selectedNetwork,
        addressType,
      });
      if (keyDerivationPathResponse.isErr()) {
        return err(keyDerivationPathResponse.error.message);
      }
      keyDerivationPath = keyDerivationPathResponse.value;
    }

    const type = addressType;
    const addresses = {} as IAddresses;
    const changeAddresses = {} as IAddresses;
    const addressArray = new Array(addressCount).fill(null);
    const changeAddressArray = new Array(changeAddressCount).fill(null);

    await Promise.all(
      addressArray.map(async (_item, i) => {
        try {
          const index = i + addressIndex;
          const path = { ...keyDerivationPath! };
          path.addressIndex = `${index}`;
          const addressPath = formatKeyDerivationPath({
            path,
            selectedNetwork,
            accountType,
            changeAddress: false,
            addressIndex: `${index}`,
          });
          if (addressPath.isErr()) {
            return err(addressPath.error.message);
          }
          const address = await getBitcoinAddress({
            path: addressPath.value.pathString,
            selectedNetwork,
            type,
          });
          if (!address) {
            return err('No address supplied');
          }
          const scriptHash = await getBitcoinScriptHash(address.value.address, selectedNetwork);
          if (!scriptHash) {
            return err('Unable to get script hash.');
          }
          addresses[scriptHash] = {
            ...address.value,
            index,
            scriptHash,
          };
        } catch {}
      })
    );

    await Promise.all(
      changeAddressArray.map(async (_item, i) => {
        try {
          const index = i + changeAddressIndex;
          const path = { ...keyDerivationPath! };
          path.addressIndex = `${index}`;
          const changeAddressPath = formatKeyDerivationPath({
            path,
            selectedNetwork,
            accountType,
            changeAddress: true,
            addressIndex: `${index}`,
          });
          if (changeAddressPath.isErr()) {
            return err(changeAddressPath.error.message);
          }

          const address = await getBitcoinAddress({
            path: changeAddressPath.value.pathString,
            selectedNetwork,
            type,
          });
          if (!address) {
            return err('No address supplied');
          }
          const scriptHash = await getBitcoinScriptHash(address.value.address, selectedNetwork);
          if (!scriptHash) {
            return err('Unable to get script hash.');
          }
          changeAddresses[scriptHash] = {
            ...address.value,
            index,
            scriptHash,
          };
        } catch {}
      })
    );

    return ok({ addresses, changeAddresses });
  } catch (e) {
    return err(e);
  }
};

/**
 * Generates a newly specified wallet.
 * @param {string} [wallet]
 * @param {number} [addressAmount]
 * @param {number} [changeAddressAmount]
 * @param {string} [mnemonic]
 * @param {string} [bip39Passphrase]
 * @return {Promise<Result<IWallets>>}
 */
export const createDefaultWallet = async ({
  walletName = getDefaultWalletShape().id,
  addressCount = NUMBER_OF_ADDRESSES,
  changeAddressCount = NUMBER_OF_ADDRESSES,
  mnemonic = '',
  bip39Passphrase = '',
  addressTypes,
  selectedNetwork,
}: ICreateWallet): Promise<Result<IWallets>> => {
  try {
    if (!selectedNetwork) {
      selectedNetwork = getSelectedNetwork();
    }

    if (!addressTypes) {
      // if nothing else specified use only Native Segwit by default
      addressTypes = { p2wpkh: getWalletStore().addressTypes.p2wpkh };
    }

    const selectedAddressType = getSelectedAddressType();

    if (!bip39Passphrase) {
      bip39Passphrase = await getBip39Passphrase(walletName);
    }

    if (!validateMnemonic(mnemonic)) {
      return err('Invalid Mnemonic');
    }
    await setKeychainValue({ key: walletName, value: mnemonic });
    await setKeychainValue({
      key: `${walletName}passphrase`,
      value: bip39Passphrase,
    });

    const seed = await bip39.mnemonicToSeed(mnemonic, bip39Passphrase);

    // get walletinfo defaults from our wallet state model
    const defaultWalletShape = getDefaultWalletShape();

    //Generate a set of addresses & changeAddresses for each network.
    const addressesObj = defaultWalletShape.addresses;
    const changeAddressesObj = defaultWalletShape.changeAddresses;
    const addressIndex = defaultWalletShape.addressIndex;
    const changeAddressIndex = defaultWalletShape.changeAddressIndex;
    const lastUsedAddressIndex = defaultWalletShape.lastUsedAddressIndex;
    const lastUsedChangeAddressIndex = defaultWalletShape.lastUsedChangeAddressIndex;

    for (const { type, path } of Object.values(addressTypes)) {
      const pathObject = getKeyDerivationPathObject({
        path,
        selectedNetwork,
      });
      if (pathObject.isErr()) {
        return err(pathObject.error.message);
      }
      const generatedAddresses = await generateAddresses({
        selectedNetwork,
        addressCount,
        changeAddressCount,
        keyDerivationPath: pathObject.value,
        addressType: type,
      });
      if (generatedAddresses.isErr()) {
        return err(generatedAddresses.error);
      }
      const { addresses, changeAddresses } = generatedAddresses.value;
      const addressZeroIndex = Object.values(addresses).find((a: any) => a.index === 0);
      const changeAddressZeroIndex = Object.values(changeAddresses).find((a: any) => a.index === 0);
      if (addressZeroIndex) {
        addressIndex[selectedNetwork][type] = addressZeroIndex;
      }
      if (changeAddressZeroIndex) {
        changeAddressIndex[selectedNetwork][type] = changeAddressZeroIndex;
      }
      addressesObj[selectedNetwork][type] = addresses;
      changeAddressesObj[selectedNetwork][type] = changeAddresses;
    }

    const payload: IWallets = {
      [walletName]: {
        ...defaultWalletShape,
        seedHash: seedHash(seed),
        addressType: {
          bitcoin: selectedAddressType,
          bitcoinTestnet: selectedAddressType,
          bitcoinRegtest: selectedAddressType,
        },
        addressIndex,
        changeAddressIndex,
        addresses: addressesObj,
        changeAddresses: changeAddressesObj,
        lastUsedAddressIndex,
        lastUsedChangeAddressIndex,
        id: walletName,
      },
    };
    return ok(payload);
  } catch (e) {
    return err(e);
  }
};

/**
 * Creates and stores a newly specified wallet.
 * @param {string} [wallet]
 * @param {number} [addressAmount]
 * @param {number} [changeAddressAmount]
 * @param {string} [mnemonic]
 * @param {string} [bip39Passphrase]
 * @return {Promise<Result<string>>}
 */
export const createWallet = async ({
  walletName = getWalletStore().defaultWallet,
  addressCount = NUMBER_OF_ADDRESSES,
  changeAddressCount = NUMBER_OF_ADDRESSES,
  mnemonic = '',
  bip39Passphrase = '',
  selectedNetwork,
}: ICreateWallet = {}): Promise<Result<string>> => {
  try {
    const response = await createDefaultWallet({
      walletName,
      addressCount,
      changeAddressCount,
      mnemonic,
      bip39Passphrase,
      selectedNetwork,
    });
    if (response.isErr()) {
      return err(response.error.message);
    }
    // dispatch action to update wallet store object
    store.dispatch.wallet.updateWalletInfo(response.value);
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
    // wait for interactions/animations to be completed
    await new Promise((resolve) => InteractionManager.runAfterInteractions(() => resolve(null)));

    if (!selectedNetwork) {
      selectedNetwork = getSelectedNetwork();
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
