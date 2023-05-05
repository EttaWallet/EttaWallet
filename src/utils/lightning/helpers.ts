import lm, {
  TAccount,
  TAvailableNetworks,
  TChannel,
  TCreatePaymentReq,
  TInvoice,
} from '@synonymdev/react-native-ldk';
import { IWalletItem, TCreateLightningInvoice, TLightningNodeVersion, TWalletName } from '../types';
import Keychain from 'react-native-keychain';
import { err, ok, Result } from '../result';
import RNFS from 'react-native-fs';
import mmkvStorage, { StorageItem } from '../../storage/disk';
import { getNodeVersion, isLdkRunning, keepLdkSynced, setupLdk } from '../../ldk';
import store from '../../state/store';
import {
  createDefaultWallet,
  getBip39Passphrase,
  getSelectedNetwork,
  getSelectedWallet,
  refreshWallet,
  updateFeeEstimates,
} from '../wallet';
import { getKeychainValue } from '../keychain';
import { InteractionManager } from 'react-native';
import { connectToElectrum, subscribeToHeader } from '../electrum';
import ldk from '@synonymdev/react-native-ldk/dist/ldk';

import * as bitcoin from 'bitcoinjs-lib';
import { reduceValue } from '../helpers';

const LDK_ACCOUNT_SUFFIX = 'ldkaccount';

export const DEFAULT_LIGHTNING_PEERS: IWalletItem<string[]> = {
  bitcoin: [],
  bitcoinRegtest: [],
  bitcoinTestnet: [
    // voltage lsp for zero-conf channel
    '025804d4431ad05b06a1a1ee41f22fefeb8ce800b0be3a92ff3b9f594a263da34e@44.228.24.253:9735',
  ],
};

/**
 * Returns the current state of the lightning store
 * @return IAddressTypes
 */
export const getLightningStore = () => {
  return store.getState().lightning;
};

export const setLdkStoragePath = (): Promise<Result<string>> =>
  lm.setBaseStoragePath(`${RNFS.DocumentDirectoryPath}/ldk/`);

/**
 * Get onchain mnemonic phrase for a given wallet from storage.
 * @async
 * @param {TWalletName} [selectedWallet]
 * @return {Promise<Result<string>>}
 */
export const getMnemonicPhrase = async (selectedWallet?: TWalletName): Promise<Result<string>> => {
  try {
    if (!selectedWallet) {
      selectedWallet = getSelectedWallet();
    }
    const response = await getKeychainValue({ key: selectedWallet });
    if (response.error) {
      return err(response.data);
    }
    return ok(response.data);
  } catch (e) {
    return err(e);
  }
};

export const getNodeIdFromStorage = async (): Promise<string> => {
  return await mmkvStorage.getItem(StorageItem.ldkNodeId);
};

/**
 * Attempts to update the node id for the given wallet and network.
 * @param {string} nodeId
 * @param {TWalletName} [selectedWallet]
 * @param {TAvailableNetworks} [selectedNetwork]
 */
export const updateLdkNodeId = async ({ nodeId }: { nodeId: string }): Promise<Result<string>> => {
  const nodeIdFromStorage = await getNodeIdFromStorage();
  if (nodeId && nodeIdFromStorage !== nodeId) {
    // dispatch action to update nodeId in state
    store.dispatch.lightning.setNodeId(nodeId);
    // also save nodeId to disk
    mmkvStorage.setItem(StorageItem.ldkNodeId, nodeId);
  }
  return ok('No need to update nodeId.');
};

/**
 * Attempts to grab, update and save the lightning node version to storage.
 * @returns {Promise<Result<TLightningNodeVersion>>}
 */
export const updateLdkVersion = async (): Promise<Result<TLightningNodeVersion>> => {
  const updateLdkVersionAction = store.dispatch.lightning.setLdkVersion;
  try {
    const version = await getNodeVersion();
    if (version.isErr()) {
      return err(version.error.message);
    }
    const currentVersion = store.getState().lightning.ldkVersion;
    if (version.value.ldk !== currentVersion) {
      // update ldk version in store and disk
      updateLdkVersionAction(version.value);
    }
    return ok(version.value);
  } catch (e) {
    console.log(e);
    return err(e);
  }
};

/**
 * Returns whether the usern(checks state object) has any open lightning channels.
 * @param {TWalletName} [selectedWallet]
 * @param {TAvailableNetworks} [selectedNetwork]
 * @returns {boolean}
 */
export const hasOpenLightningChannels = ({
  selectedNetwork,
}: {
  selectedNetwork?: TAvailableNetworks;
}): boolean => {
  if (!selectedNetwork) {
    selectedNetwork = getSelectedNetwork();
  }
  const availableChannels = getLightningStore().openChannelIds[selectedNetwork];
  return availableChannels.length > 0;
};

/**
 * Creates and stores a lightning invoice, for the specified amount, and refreshes/re-adds peers.
 * @param {number} amountSats
 * @param {string} [description]
 * @param {number} [expiryDeltaSeconds]
 * @param {TAvailableNetworks} [selectedNetwork]
 * @param {TWalletName} [selectedWallet]
 */
export const createLightningInvoice = async ({
  amountSats,
  description,
  expiryDeltaSeconds,
  selectedNetwork,
  selectedWallet,
}: TCreateLightningInvoice): Promise<Result<TInvoice>> => {
  if (!selectedNetwork) {
    selectedNetwork = getSelectedNetwork();
  }
  if (!selectedWallet) {
    selectedWallet = getSelectedWallet();
  }
  // if (!hasOpenLightningChannels({ selectedNetwork })) {
  //   return err('No lightning channels available to receive an invoice.');
  // }
  const invoice = await createPaymentRequest({
    amountSats,
    description,
    expiryDeltaSeconds,
  });
  if (invoice.isErr()) {
    return err(invoice.error.message);
  }

  addPeers({ selectedNetwork, selectedWallet }).then();

  // dispath action to add invoice to state object
  store.dispatch.lightning.addInvoice(invoice.value);
  return ok(invoice.value);
};

/**
 * Attempts to create a bolt11 invoice.
 * @param {TCreatePaymentReq} req
 * @returns {Promise<Result<TInvoice>>}
 */
export const createPaymentRequest = (req: TCreatePaymentReq): Promise<Result<TInvoice>> =>
  ldk.createPaymentRequest(req);

/**
 * Parses a lightning uri.
 * @param {string} str
 * @returns {{ publicKey: string; ip: string; port: number; }}
 */
export const parseLightningUri = (
  str: string
): Result<{
  publicKey: string;
  ip: string;
  port: number;
}> => {
  const uri = str.split('@');
  const publicKey = uri[0];
  if (uri.length !== 2) {
    return err('Invalid URI.');
  }
  const parsed = uri[1].split(':');
  if (parsed.length < 2) {
    return err('Invalid URI.');
  }
  const ip = parsed[0];
  const port = Number(parsed[1]);
  return ok({
    publicKey,
    ip,
    port,
  });
};

/**
 * Prompt LDK to add a specified peer.
 * @param {string} peer
 * @param {number} [timeout]
 */
export const addPeer = async ({
  peer,
  timeout = 5000,
}: {
  peer: string;
  timeout?: number;
}): Promise<Result<string>> => {
  const parsedUri = parseLightningUri(peer);
  if (parsedUri.isErr()) {
    return err(parsedUri.error.message);
  }
  return await lm.addPeer({
    pubKey: parsedUri.value.publicKey,
    address: parsedUri.value.ip,
    port: parsedUri.value.port,
    timeout,
  });
};

/**
 * Adds default, and all custom lightning peers.
 * @returns {Promise<Result<string[]>>}
 */
export const addPeers = async ({
  selectedWallet,
  selectedNetwork,
}: {
  selectedWallet?: TWalletName;
  selectedNetwork?: TAvailableNetworks;
} = {}): Promise<Result<string[]>> => {
  try {
    if (!selectedWallet) {
      selectedWallet = getSelectedWallet();
    }
    if (!selectedNetwork) {
      selectedNetwork = getSelectedNetwork();
    }
    const defaultLightningPeers = DEFAULT_LIGHTNING_PEERS[selectedNetwork];
    // @TODO: Create user UI for adding custom peers in Lightning settings.
    // Defaulting to LSP and a few other well connected peers.
    // const customLightningPeers = getCustomLightningPeers({
    //   selectedNetwork,
    //   selectedWallet,
    // });
    // const peers = [...defaultLightningPeers, ...customLightningPeers];

    const addPeerRes = await Promise.all(
      defaultLightningPeers.map(async (peer) => {
        const addPeerResponse = await addPeer({
          peer,
          timeout: 5000,
        });
        if (addPeerResponse.isErr()) {
          console.log(addPeerResponse.error.message);
          return addPeerResponse.error.message;
        }
        return addPeerResponse.value;
      })
    );
    return ok(addPeerRes);
  } catch (e) {
    console.log(e);
    return err(e);
  }
};

/**
 * Filters out and removes expired invoices from the invoices array
 * @returns {Promise<Result<string>>}
 */
export const removeExpiredInvoices = async (): Promise<Result<string>> => {
  //dispatch action to update invoices in state
  setInterval(() => {
    store.dispatch.lightning.removeExpiredInvoices;
  }, 60 * 1000);
  return ok('');
};

export const startLightning = async ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  restore = false,
  selectedNetwork,
}: {
  restore?: boolean;
  selectedNetwork?: TAvailableNetworks;
}): Promise<Result<string>> => {
  try {
    // wait for interactions/animations to be completed
    await new Promise((resolve) => InteractionManager.runAfterInteractions(() => resolve(null)));

    if (!selectedNetwork) {
      selectedNetwork = getSelectedNetwork();
    }
    let isConnectedToElectrum = false;

    // get the LSP (Voltage at the moment) ready to buy liquidity
    // await setupLSP(selectedNetwork);
    // updateExchangeRates().then();

    // connect to electrum
    const electrumResponse = await connectToElectrum({
      selectedNetwork,
    });
    if (electrumResponse.isOk()) {
      isConnectedToElectrum = true;
      // Ensure the on-chain wallet & LDK syncs when a new block is detected.
      const onReceive = (): void => {
        refreshWallet({
          selectedNetwork,
        });
        console.log('onReceive', onReceive);
      };
      // Ensure we are subscribed to and save new header information.
      subscribeToHeader({ selectedNetwork, onReceive }).then();
    }

    const mnemonicResponse = await getMnemonicPhrase();
    if (mnemonicResponse.isErr()) {
      console.log('mnemonicResponse: ', mnemonicResponse);
      return err(mnemonicResponse.error.message);
    }
    const mnemonic = mnemonicResponse.value;

    const walletExists = store.getState().wallet.walletExists;
    if (!walletExists) {
      const bip39Passphrase = await getBip39Passphrase();
      const createRes = await createDefaultWallet({ mnemonic, bip39Passphrase });
      if (createRes.isErr()) {
        return err(createRes.error.message);
      }
    }

    // Setup LDK
    if (isConnectedToElectrum) {
      const setupResponse = await setupLdk({
        selectedNetwork,
        shouldRefreshLdk: false,
      });
      if (setupResponse.isOk()) {
        keepLdkSynced({ selectedNetwork }).then();
      }
    }

    await Promise.all([
      updateFeeEstimates({ selectedNetwork, forceUpdate: true }),
      // if we restore wallet, we need to generate addresses for all types
      refreshWallet(),
    ]);
    // await runChecks({ selectedNetwork });

    // update channels
    await updateLightningChannels();
    await updateClaimableBalance({ selectedNetwork });
    // remove invoices that have surpassed expiry time from state
    await removeExpiredInvoices();

    // ensure the node is up and running before we go anywhere
    const isRunning = await isLdkRunning();
    if (!isRunning) {
      startLightning({ selectedNetwork });
    } else {
      store.dispatch.lightning.setNodeStarted(true);
    }

    return ok('Wallet started');
  } catch (e) {
    return err(e);
  }
};

/**
 * Use Keychain to save LDK name & seed to secure storage.
 * @param {string} name
 * @param {string} seed
 */
export const setLdkAccount = async ({ name, seed }: TAccount): Promise<boolean> => {
  try {
    if (!name) {
      name = getSelectedWallet();
      name = `${name}${LDK_ACCOUNT_SUFFIX}`;
    }
    const account: TAccount = {
      name,
      seed,
    };
    const setRes = await Keychain.setGenericPassword(name, JSON.stringify(account), {
      service: name,
    });
    if (!setRes || setRes?.service !== name || setRes?.storage !== 'keychain') {
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

/**
 * Retrieve LDK account info from storage.
 * @param {TWalletName} [selectedWallet]
 * @param {TAvailableNetworks} [selectedNetwork]
 */
export const getLdkAccount = async ({
  selectedWallet,
  selectedNetwork,
}: {
  selectedWallet?: TWalletName;
  selectedNetwork?: TAvailableNetworks;
} = {}): Promise<Result<TAccount>> => {
  if (!selectedWallet) {
    selectedWallet = getSelectedWallet();
  }
  if (!selectedNetwork) {
    selectedNetwork = getSelectedNetwork();
  }
  const mnemonicPhrase = await getMnemonicPhrase();
  if (mnemonicPhrase.isErr()) {
    return err(mnemonicPhrase.error.message);
  }
  const name = `${selectedWallet}${selectedNetwork}${LDK_ACCOUNT_SUFFIX}`;
  try {
    const result = await Keychain.getGenericPassword({ service: name });
    if (!!result && result?.password) {
      // Return existing account.
      return ok(JSON.parse(result?.password));
    } else {
      const defaultAccount = _getDefaultAccount(name, mnemonicPhrase.value);
      // Setup default account.
      const setAccountResponse = await setLdkAccount(defaultAccount);
      if (setAccountResponse) {
        return ok(defaultAccount);
      } else {
        return err('Unable to set LDK account.');
      }
    }
  } catch (e) {
    console.log(e);
    const defaultAccount = _getDefaultAccount(name, mnemonicPhrase.value);
    return ok(defaultAccount);
  }
};
const _getDefaultAccount = (name: string, mnemonic: string): TAccount => {
  // @ts-ignore
  const ldkSeed = bitcoin.crypto.sha256(mnemonic).toString('hex');
  return {
    name,
    seed: ldkSeed,
  };
};

/**
 * Returns an array of pending and open channels from LDK
 * @returns Promise<Result<TChannel[]>>
 */
export const getLightningChannels = (): Promise<Result<TChannel[]>> => {
  return ldk.listChannels();
};

/**
 * Attempts to update the lightning channels for the given wallet and network.
 * This method will save all channels (both pending, open & closed) to redux and update openChannelIds to reference channels that are currently open.
 * @param {TWalletName} [selectedWallet]
 * @param {TAvailableNetworks} [selectedNetwork]
 */
export const updateLightningChannels = async (): Promise<Result<TChannel[]>> => {
  const lightningChannels = await getLightningChannels();
  if (lightningChannels.isErr()) {
    return err(lightningChannels.error.message);
  }

  const channels: { [channelId: string]: TChannel } = {};
  const openChannelIds: string[] = [];

  lightningChannels.value.forEach((channel) => {
    channels[channel.channel_id] = channel;
    if (!openChannelIds.includes(channel.channel_id)) {
      openChannelIds.push(channel.channel_id);
    }
  });

  const payload = {
    channels,
    openChannelIds,
  };
  // update channels in lightning store
  store.dispatch.lightning.updateChannels(payload.channels);
  // update open channels
  store.dispatch.lightning.updateOpenChannels(payload.openChannelIds);
  return ok(lightningChannels.value);
};

/**
 * Retrieves the total wallet display values for the currently selected wallet and network.
 * @param {boolean} [subtractReserveBalance]
 */
export const getTotalBalance = ({
  subtractReserveBalance = true,
}: {
  subtractReserveBalance?: boolean;
}): number => {
  let balance = 0;

  // get openchannel ids from lightning store
  const openChannelIds = getLightningStore().openChannelIds;
  // get all channels from lightning store
  const channels = getLightningStore().channels;
  // filter channels array so we only remain with open channels
  const openChannels = Object.values(channels).filter((channel) => {
    return openChannelIds.includes(channel.channel_id);
  });
  // reduce the balance_sat from each ready channel into one sum and compute for punishment reserve if desired
  balance = Object.values(openChannels).reduce((previousValue, currentChannel) => {
    if (currentChannel.is_channel_ready) {
      let reserveBalance = 0;
      if (subtractReserveBalance) {
        reserveBalance = currentChannel.unspendable_punishment_reserve ?? 0;
      }
      return previousValue + currentChannel.balance_sat - reserveBalance;
    }
    return previousValue;
  }, balance);

  console.log('@getTotalBalance:', balance);
  return balance;
};

/**
 * Returns the claimable balance for all lightning channels.
 * @param {boolean} [ignoreOpenChannels]
 * @param {TAvailableNetworks} [selectedNetwork]
 * @returns {Promise<number>}
 */
export const getClaimableBalance = async ({
  ignoreOpenChannels = false,
  selectedNetwork,
}: {
  ignoreOpenChannels?: boolean;
  selectedNetwork?: TAvailableNetworks;
}): Promise<number> => {
  if (!selectedNetwork) {
    selectedNetwork = getSelectedNetwork();
  }
  const lightningBalance = getTotalBalance({
    subtractReserveBalance: false,
  });
  const claimableBalanceRes = await ldk.claimableBalances(ignoreOpenChannels);
  if (claimableBalanceRes.isErr()) {
    return 0;
  }
  const claimableBalance = reduceValue({
    arr: claimableBalanceRes.value,
    value: 'claimable_amount_satoshis',
  });
  if (claimableBalance.isErr()) {
    return 0;
  }
  return Math.abs(lightningBalance - claimableBalance.value);
};

export const updateClaimableBalance = async ({
  selectedWallet,
  selectedNetwork,
}: {
  selectedWallet?: TWalletName;
  selectedNetwork?: TAvailableNetworks;
}): Promise<Result<string>> => {
  if (!selectedWallet) {
    selectedWallet = getSelectedWallet();
  }
  if (!selectedNetwork) {
    selectedNetwork = getSelectedNetwork();
  }

  const claimableBalance = await getClaimableBalance({
    selectedNetwork,
  });

  // update claimable balance in store
  store.dispatch.lightning.updateClaimableBalance(claimableBalance);
  return ok('Successfully Updated Claimable Balance.');
};
