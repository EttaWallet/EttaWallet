import lm, {
  TAccount,
  TAvailableNetworks,
  TChannel,
  TChannelManagerClaim,
  TChannelManagerPaymentSent,
  TCreatePaymentReq,
  TInvoice,
  TPaymentReq,
} from '@synonymdev/react-native-ldk';
import {
  EPaymentType,
  IWalletItem,
  NodeState,
  TContact,
  TCreateLightningInvoice,
  TLightningNodeVersion,
  TLightningPayment,
  TWalletName,
} from '../types';
import Keychain from 'react-native-keychain';
import { err, ok, Result } from '../result';
import RNFS from 'react-native-fs';
import mmkvStorage, { StorageItem } from '../../storage/disk';
import {
  getAllPendingChannels,
  getNodeVersion,
  isLdkRunning,
  keepLdkSynced,
  refreshLdk,
  setupLdk,
} from '../../ldk';
import store from '../../state/store';
import {
  createDefaultWallet,
  getBip39Passphrase,
  getSelectedNetwork,
  getSelectedWallet,
  refreshWallet,
  updateFeeEstimates,
} from '../wallet';
import { retrieveStoredKeychainItem } from '../keychain';
import { InteractionManager } from 'react-native';
import { connectToElectrum, subscribeToHeader } from '../electrum';
import ldk from '@synonymdev/react-native-ldk/dist/ldk';

import * as bitcoin from 'bitcoinjs-lib';
import { reduceValue, sleep } from '../helpers';
import { timeDeltaInDays } from '../time';
import { transactionFeedHeader } from '../time';
import i18n from '../../i18n';
import { showErrorBanner, showWarningBanner } from '../alerts';
import {
  CHANNEL_OPEN_DEPOSIT_SATS,
  FAUCET_API,
  FAUCET_MACAROON,
  LSP_NODE_URI,
} from '../../../config';
import Logger from '../logger';
import { getMaxRemoteBalance } from '../calculate';
import { getLspFeeEstimate, getLspWrappedInvoice } from '../lsp/helpers';

const LDK_ACCOUNT_SUFFIX = 'ldkaccount';

export const DEFAULT_LIGHTNING_PEERS: IWalletItem<string[]> = {
  bitcoin: [],
  bitcoinRegtest: [
    //lnd1
    '027372e6d29f0870946632579a501585cede4e9de029c196299c388fa60f6be021@127.0.0.1:9735',
    //lnd2
    '03741a6c756345277561d0328131c40ea48bd0100f9a1a0304ec4ab29492278bf2@127.0.0.1:9737',
    //cln
    '02617fc86d4d379d25cdd03acb33f767ae8cfa3a0531f6dafa36c1bc92af8563ac@127.0.0.1:9836',
  ],
  bitcoinTestnet: [
    // voltage lsp for zero-conf channel
    '02c1b1cba5a07d77aad88f8e798b87e4fc32b74fbab018685b37a7a14a349822d7@44.238.195.48:9735',
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
    const response = await retrieveStoredKeychainItem(selectedWallet);
    if (!response) {
      return err('mnemonic not found');
    }
    return ok(response);
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
 * Attempts to create a bolt11 invoice.
 * @param {TCreatePaymentReq} req
 * @returns {Promise<Result<TInvoice>>}
 */
export const createPaymentRequest = (req: TCreatePaymentReq): Promise<Result<TInvoice>> =>
  lm.createAndStorePaymentRequest(req);

/**
 * Returns whether the user(checks state object) has any open lightning channels.
 * @returns {boolean}
 */
export const hasOpenLightningChannels = (): boolean => {
  const availableChannels = getLightningStore().openChannelIds;
  return Object.values(availableChannels).length > 0;
};

/**
 * Returns whether the any of the open lightning channels has a sufficient remote balance
 * or inbound liquidity to receive a payment.
 * @param {number} amountSats
 * @returns {boolean}
 */
export const hasEnoughRemoteBalance = ({ amountSats }: { amountSats?: number }): boolean => {
  // get openchannel ids from lightning store
  const openChannelIds = getLightningStore().openChannelIds;
  // get all channels from lightning store
  const AllChannels = getLightningStore().channels;

  const openChannels = Object.values(AllChannels).filter((channel) => {
    return openChannelIds.includes(channel.channel_id);
  });

  // loop through all open channels and check if any has sufficient inbound liquidity
  for (const channel in openChannels) {
    if (
      openChannels[channel].is_channel_ready &&
      openChannels[channel].inbound_capacity_sat > amountSats!
    ) {
      return true;
    }
  }
  return false;
};

/**
 * Creates and stores a lightning invoice, for the specified amount,
 * Also, determines when to liase with LSP if liquidity requirements aren't fulfilled
 * or if no channels exist
 * @param {number} amountSats
 * @param {string} [description]
 * @param {number} [expiryDeltaSeconds]
 * @param {TAvailableNetworks} [selectedNetwork]
 */
export const createLightningInvoice = async ({
  amountSats,
  description,
  expiryDeltaSeconds,
  selectedNetwork,
}: TCreateLightningInvoice): Promise<Result<TInvoice>> => {
  if (!selectedNetwork) {
    selectedNetwork = getSelectedNetwork();
  }

  // @TODO: Cater to zero amount invoices when dealing with LSP.

  description =
    !hasOpenLightningChannels() || !hasEnoughRemoteBalance({ amountSats })
      ? ''
      : getLightningStore().defaultPRDescription;
  // LSP requires a max expiry period of 3600 so if conditions to use LSP return false, expiryDeltaSeconds should be 3600
  expiryDeltaSeconds =
    !hasOpenLightningChannels() || !hasEnoughRemoteBalance({ amountSats })
      ? 3600
      : getLightningStore().defaultPRExpiry;

  const invoice = await createPaymentRequest({
    amountSats,
    description,
    expiryDeltaSeconds,
  });

  if (invoice.isErr()) {
    return err(invoice.error.message);
  }

  // add invoice to store
  store.dispatch.lightning.addInvoice(invoice.value);

  if (!hasOpenLightningChannels()) {
    // @todo: implement JIT at this point.
    // get the generated invoice, send it to LSP
    // calculate fees
    // return wrapped invoice + fees
    // dispath action to add invoice to state object
    Logger.info('No open lightning channels found');
    await sleep(1000);
    try {
      const fees = await getLspFeeEstimate(invoice.value.amount_satoshis);

      if (fees.isOk()) {
        // get wrapped invoice from LSP
        const wrappedInvoice = await getLspWrappedInvoice({
          bolt11: invoice.value.to_str,
          fee_id: fees.value.id,
        });

        const payload = {
          payment_hash: invoice.value.payment_hash,
          modified_request: wrappedInvoice.value,
        };
        store.dispatch.lightning.updateInvoice(payload);
      }
    } catch (error) {
      showWarningBanner({
        title: 'Error fetching invoice',
        message: error.message,
      });
    }
  } else if (hasOpenLightningChannels() && !hasEnoughRemoteBalance({ amountSats })) {
    try {
      const fees = await getLspFeeEstimate(invoice.value.amount_satoshis);

      if (fees.isOk()) {
        // get wrapped invoice from LSP
        const wrappedInvoice = await getLspWrappedInvoice({
          bolt11: invoice.value.to_str,
          fee_id: fees.value.id,
        });

        const payload = {
          payment_hash: invoice.value.payment_hash,
          modified_request: wrappedInvoice.value,
        };
        console.log('payload: ', payload);
        store.dispatch.lightning.updateInvoice(payload);
      }
    } catch (error) {
      showWarningBanner({
        title: 'Error fetching invoice',
        message: error.message,
      });
    }
  } else {
    Logger.info('Got open channels and enough inbound liquidity to receive this amount');
  }

  return ok(invoice.value);
};

export const decodeLightningInvoice = ({
  paymentRequest,
}: TPaymentReq): Promise<Result<TInvoice>> => {
  paymentRequest = paymentRequest.replace('lightning:', '').trim();
  return ldk.decode({ paymentRequest });
};

export const getClaimedPaymentsFromNode = async (): Promise<TChannelManagerClaim[]> =>
  lm.getLdkPaymentsClaimed();

export const getSentPaymentsFromNode = async (): Promise<TChannelManagerPaymentSent[]> =>
  lm.getLdkPaymentsSent();

export const getBolt11FromHash = async ({
  paymentHash,
}: {
  paymentHash: string;
}): Promise<TInvoice | undefined> => lm.getInvoiceFromPaymentHash(paymentHash);

export const syncPaymentsWithStore = async (): Promise<Result<string>> => {
  let payments: TLightningPayment[] = [];
  const receivedTxs = await getClaimedPaymentsFromNode();
  for (const tx of receivedTxs) {
    // get bolt11
    const invoice = await getBolt11FromHash({ paymentHash: tx.payment_hash });

    payments.push({
      payment_hash: tx.payment_hash,
      amount_sat: tx.amount_sat,
      payment_preimage: tx.payment_preimage,
      payment_secret: tx.payment_secret,
      spontaneous_payment_preimage: tx.spontaneous_payment_preimage,
      unix_timestamp: tx.unix_timestamp,
      state: tx.state,
      type: EPaymentType.received,
      invoice: invoice?.to_str ?? '',
    });
  }

  const sentTxs = await getSentPaymentsFromNode();
  for (const tx of sentTxs) {
    // @todo: store bolt11 for paid tx
    payments.push({
      payment_hash: tx.payment_hash,
      amount_sat: tx.amount_sat,
      payment_preimage: tx.payment_preimage,
      fee_paid_sat: tx.fee_paid_sat,
      unix_timestamp: tx.unix_timestamp,
      state: tx.state,
      type: EPaymentType.sent,
    });
  }

  // push to payments store
  store.dispatch.lightning.addPayments(payments);
};

/**
 * Attempts to pay a bolt11 invoice.
 * @param {number} amount_in_sats
 * @param {string} paymentRequest
 * @returns {Promise<Result<string>>}
 */
export const payInvoice = async (
  paymentRequest: string,
  amount_in_sats?: number
): Promise<Result<TChannelManagerPaymentSent>> => {
  try {
    const addPeersResponse = await addPeers().then();
    if (addPeersResponse.isErr()) {
      return err(addPeersResponse.error.message);
    }
    const decodedInvoice = await decodeLightningInvoice({
      paymentRequest: paymentRequest,
    });
    if (decodedInvoice.isErr()) {
      return err(decodedInvoice.error.message);
    }

    const payResponse = await lm.payWithTimeout({
      paymentRequest: paymentRequest,
      amountSats: amount_in_sats ?? 0,
      timeout: 60000,
    });
    if (payResponse.isErr()) {
      console.log('payResponse/error: ', payResponse);
      return err(payResponse.error.message);
    }

    refreshLdk({}).then();
    return ok(payResponse.value);
  } catch (e) {
    console.log(e);
    return err(e);
  }
};

/**
 * Parses a node uri.
 * @param {string} str
 * @returns {{ publicKey: string; ip: string; port: number; }}
 */
export const parseNodeUri = (
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
 * Returns previously saved lightning peers from storage. (Excludes default lightning peers.)
 * @param {TAvailableNetworks} [selectedNetwork]
 */
export const getCustomLightningPeers = ({
  selectedNetwork,
}: {
  selectedNetwork?: TAvailableNetworks;
}): string[] => {
  if (!selectedNetwork) {
    selectedNetwork = getSelectedNetwork();
  }
  const peers = getLightningStore().peers;
  if (peers) {
    return peers;
  }
  return [];
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
  const parsedUri = parseNodeUri(peer);
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
  selectedNetwork,
}: {
  selectedNetwork?: TAvailableNetworks;
} = {}): Promise<Result<string[]>> => {
  try {
    if (!selectedNetwork) {
      selectedNetwork = getSelectedNetwork();
    }

    // defaulting to LSP_NODE_URI for now. We will rely on the LSP to open channels and route payments

    const defaultLightningPeers = [LSP_NODE_URI];
    // @TODO: Create user UI for adding custom peers in Lightning settings.
    // Defaulting to LSP and a few other well connected peers.
    // const customLightningPeers = getCustomLightningPeers({
    //   selectedNetwork,
    // });
    // const peers = [...defaultLightningPeers, ...customLightningPeers];

    // focusing on default peers only for now.
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
 * Attempts to save a custom lightning peer to storage.
 * @param {TAvailableNetworks} [selectedNetwork]
 * @param {string} peer
 */
export const savePeer = ({
  selectedNetwork,
  peer,
}: {
  selectedNetwork?: TAvailableNetworks;
  peer: string;
}): Result<string> => {
  if (!selectedNetwork) {
    selectedNetwork = getSelectedNetwork();
  }

  if (!peer) {
    return err('Invalid Peer Data');
  }
  // Check that the URI is valid.
  const parsedPeerData = parseNodeUri(peer);
  if (parsedPeerData.isErr()) {
    return err(parsedPeerData.error.message);
  }
  // Ensure we haven't already added this peer.
  const existingPeers = getCustomLightningPeers({
    selectedNetwork,
  });
  if (existingPeers.includes(peer)) {
    return ok('Peer Already Added');
  }

  // add peer to state store
  store.dispatch.lightning.addPeer(peer);
  return ok('Successfully Saved Lightning Peer.');
};

/**
 * Filters out and removes expired invoices from the invoices array
 * @returns {Promise<Result<string>>}
 */
export const removeExpiredInvoices = async (): Promise<Result<string>> => {
  //dispatch action to set invoices in state to only current invoices
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

    store.dispatch.lightning.setLdkState(NodeState.START);

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

    store.dispatch.lightning.setLdkState(NodeState.START);

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

      // update channels
      await updateLightningChannels(),
      // update balance
      await updateClaimableBalance({ selectedNetwork }),
      // update maximum receivable amount
      await updateMaxReceivableAmount(),
      // remove invoices that have surpassed expiry time from state
      await removeExpiredInvoices(),
    ]);

    // ensure the node is up and running before we go anywhere
    const isRunning = await isLdkRunning();
    if (!isRunning) {
      startLightning({ selectedNetwork });
    } else {
      store.dispatch.lightning.setLdkState(NodeState.COMPLETE);
    }

    return ok('Wallet started');
  } catch (e) {
    store.dispatch.lightning.setLdkState(NodeState.ERROR);
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
      name = getSelectedNetwork();
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
 * @param {TAvailableNetworks} [selectedNetwork]
 */
export const getLdkAccount = async ({
  selectedNetwork,
}: {
  selectedNetwork?: TAvailableNetworks;
} = {}): Promise<Result<TAccount>> => {
  if (!selectedNetwork) {
    selectedNetwork = getSelectedNetwork();
  }
  const mnemonicPhrase = await getMnemonicPhrase();
  if (mnemonicPhrase.isErr()) {
    return err(mnemonicPhrase.error.message);
  }
  const name = `${selectedNetwork}${LDK_ACCOUNT_SUFFIX}`;
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
 * This method will save all channels (both pending, open & closed) to the local state store
 * and update openChannelIds to reference channels that are currently open.
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

  // update channels and openChannelIDs object in lightning store
  store.dispatch.lightning.updateChannels(payload);
  return ok(lightningChannels.value);
};

/**
 * Retrieves the total wallet display values for the currently selected network.
 * @param {boolean} [subtractReserveBalance]
 * @param {TAvailableNetworks} [selectedNetwork]
 */
export const getTotalBalance = ({
  selectedNetwork,
}: {
  selectedNetwork?: TAvailableNetworks;
}): {
  lightningBalance: number; // Total lightning funds (spendable + reserved + claimable)
  spendableBalance: number; // Share of lightning funds that are spendable
  reserveBalance: number; // Share of lightning funds that are locked up in channels
  claimableBalance: number; // Funds that will be available after a channel opens/closes
} => {
  if (!selectedNetwork) {
    selectedNetwork = getSelectedNetwork();
  }

  // get openchannel ids from lightning store
  const openChannelIds = getLightningStore().openChannelIds;
  // get all channels from lightning store
  const channels = getLightningStore().channels;
  // filter channels array so we only remain with open channels

  const openChannels = Object.values(channels).filter((channel) => {
    return openChannelIds.includes(channel.channel_id);
  });

  const claimableBalance = getLightningStore().claimableBalance;
  let spendableBalance = 0;
  let reserveBalance = 0;

  openChannels.forEach((channel) => {
    if (channel.is_channel_ready) {
      const spendable = channel.outbound_capacity_sat;
      const unspendable = channel.balance_sat - spendable;
      reserveBalance += unspendable;
      spendableBalance += spendable;
    }
  });

  const lightningBalance = spendableBalance + reserveBalance + claimableBalance;

  // // reduce the balance_sat from each ready channel into one sum and compute for punishment reserve if desired
  // balance = Object.values(openChannels).reduce((previousValue, currentChannel) => {
  //   if (currentChannel.is_channel_ready) {
  //     let reserveBalance = 0;
  //     if (subtractReserveBalance) {
  //       reserveBalance = currentChannel.unspendable_punishment_reserve ?? 0;
  //     }
  //     return previousValue + currentChannel.balance_sat - reserveBalance;
  //   }
  //   return previousValue;
  // }, balance);

  return {
    lightningBalance,
    spendableBalance,
    claimableBalance,
    reserveBalance,
  };
};

/**
 * Returns the claimable balance for all lightning channels.
 * @param {boolean} [ignoreOpenChannels]
 * @param {TAvailableNetworks} [selectedNetwork]
 * @returns {Promise<number>}
 */
export const getClaimableBalance = async ({
  ignoreOpenChannels = true, // setting this to true to get actual balance. @Todo: look into this in spec
  selectedNetwork,
}: {
  ignoreOpenChannels?: boolean;
  selectedNetwork?: TAvailableNetworks;
}): Promise<number> => {
  if (!selectedNetwork) {
    selectedNetwork = getSelectedNetwork();
  }
  const { spendableBalance, reserveBalance } = getTotalBalance({});
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

  return Math.abs(spendableBalance + reserveBalance - claimableBalance.value);
  // return Math.abs(spendableBalance + reserveBalance);
};

export const updateClaimableBalance = async ({
  selectedNetwork,
}: {
  selectedNetwork?: TAvailableNetworks;
}): Promise<Result<string>> => {
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

export const updateMaxReceivableAmount = async (): Promise<Result<string>> => {
  const maxReceivable = getMaxRemoteBalance();
  // update max receivable in store
  store.dispatch.lightning.setMaxReceivable(maxReceivable);
  return ok('Successfully updated maximum amount receivable.');
};

/**
 * Removes a lightning invoice from the invoices array via its payment hash.
 * @param {string} paymentHash
 * @returns {Promise<Result<string>>}
 */
export const removeInvoice = async ({
  paymentHash,
}: {
  paymentHash: string;
  selectedNetwork?: TAvailableNetworks;
}): Promise<Result<string>> => {
  if (!paymentHash) {
    return err('No payment hash provided.');
  }

  store.dispatch.lightning.removeInvoice(paymentHash);

  return ok('Successfully removed lightning invoice.');
};

// Groupings:
// Recent -> Last 7 days.
// [Current month] - "July" -> Captures transactions from the current month that aren’t captured in Recent.
// [Previous months] - "June" -> Captures transactions by month.
// [Months over a year ago] — "July 2019" -> Same as above, but with year appended.
// Sections are hidden if they have no items.
export function groupActivityInSections<T extends { timestamp: number }>(
  items: TLightningPayment[]
) {
  const sectionsMap: {
    [key: string]: {
      data: T[];
      daysSinceTransaction: number;
    };
  } = {};

  items.reduce((sections, item) => {
    const daysSinceTransaction = timeDeltaInDays(Date.now(), item.unix_timestamp!);
    const key =
      daysSinceTransaction <= 7
        ? i18n.t('Last 7 days')
        : transactionFeedHeader(item.unix_timestamp!, i18n);
    sections[key] = sections[key] || {
      daysSinceTransaction,
      data: [],
    };
    // @ts-ignore
    sections[key].data.push(item);
    return sections;
  }, sectionsMap);

  const sectionsArray = Object.entries(sectionsMap).map(([key, value]) => ({
    title: key,
    data: value.data.sort((a, b) => b.timestamp - a.timestamp), // Sort the data in descending order of timestamp
  }));

  // const sortedSections = sectionsArray.sort((a, b) => b.data[0].timestamp - a.data[0].timestamp);

  return sectionsArray;
}

export function countRecentTransactions(payments: TLightningPayment[]): number {
  const now = Math.floor(Date.now() / 1000); // Current time since Unix epoch in seconds
  const sevenDaysAgo = now - 7 * 24 * 60 * 60; // 7 days in seconds
  let count = 0;

  for (const paymentKey in payments) {
    const item = payments[paymentKey];
    const { unix_timestamp } = item;

    if (unix_timestamp && unix_timestamp >= sevenDaysAgo && unix_timestamp <= now) {
      count++;
    }
  }

  return count;
}

/**
 * Wipes LDK data from storage
 * @returns {Promise<Result<string>>}
 */
export const wipeLdkStorage = async ({
  selectedNetwork,
}: {
  selectedNetwork?: TAvailableNetworks;
}): Promise<Result<string>> => {
  if (!selectedNetwork) {
    selectedNetwork = getSelectedNetwork();
  }

  await ldk.stop();
  const path = `${RNFS.DocumentDirectoryPath}/ldk/${lm.account.name}`;

  const deleteAllFiles = async (dirpath: string): Promise<void> => {
    const items = await RNFS.readDir(dirpath);
    for (const item of items) {
      if (item.isFile()) {
        await RNFS.unlink(item.path);
      } else {
        deleteAllFiles(item.path);
      }
    }
  };

  try {
    // delete all files in the directory
    // NOTE: this is a workaround for RNFS.unlink(folder) freezing the app
    await deleteAllFiles(path);
  } catch (e) {
    return err(e);
  }

  return ok(`${selectedNetwork}'s LDK directory wiped successfully`);
};

export const getContact = ({ contactId }: { contactId: string }): Result<TContact> => {
  try {
    const allContacts = getLightningStore().contacts;
    const contact = allContacts.filter((c) => c.id === contactId);
    if (contact.length > 0) {
      return ok(contact[0]);
    }
  } catch (e) {
    return err(e.message);
  }
};

/**
 * Automatically open channel for user.
 * @param {TAvailableNetworks} [selectedNetwork]
 * @returns {Promise<string>}
 */
export const openLightningChannel = async ({
  selectedNetwork,
}: {
  selectedNetwork?: TAvailableNetworks;
}): Promise<Result<string>> => {
  if (!selectedNetwork) {
    selectedNetwork = getSelectedNetwork();
  }

  try {
    const invoice = await createLightningInvoice({
      amountSats: CHANNEL_OPEN_DEPOSIT_SATS,
      description: '',
      expiryDeltaSeconds: 3600,
    });

    if (invoice.isErr()) {
      console.log(invoice.error.message);
      // return err(invoice.error.message);
    }
    await sleep(5000);
    // attempt paying invoice via faucet
    payInvoiceWithFaucet({
      bolt11: invoice.value.to_str,
    })
      .then(async (paymentHash) => {
        console.log('Payment successful:', paymentHash);
        // check if channel exists or retry
        const pendingChannels = await getAllPendingChannels({ fromStorage: false });
        if (pendingChannels.isErr()) {
          return err('No pending channels');
        }
        return ok('new channel created');
      })
      .catch((error) => {
        return err(error.message);
      });
  } catch (e) {
    showErrorBanner({
      title: 'Channel creation failed',
      message: e.message,
    });
  }
};

export const payInvoiceWithFaucet = async ({
  bolt11,
}: {
  bolt11?: string;
}): Promise<Result<string>> => {
  if (!bolt11) {
    return err('No bolt11 provided');
  }

  const headers = {
    'Grpc-Metadata-macaroon': FAUCET_MACAROON!,
    'Content-Type': 'application/json',
  };

  interface PayInvoiceResponse {
    payment_error: string;
    payment_hash: string;
  }

  const body = JSON.stringify({
    payment_request: bolt11,
  });

  try {
    const response = await fetch(`${FAUCET_API}/v1/channels/transactions`, {
      method: 'POST',
      headers: headers,
      body: body,
    });

    // is fetch ok(200)?
    if (!response.ok) {
      const text = await response.text();
      return err(`Payment failed with status ${response.status}: ${text}`);
    }
    // did our request return an error?
    const data: PayInvoiceResponse = await response.json();
    // if (data.payment_error) {
    //   throw new Error(`Payment failed with error: ${data.payment_error}`);
    // }

    return data;
  } catch (e) {
    console.log('error@payInvoiceWithFaucet: ', e.message);
    return err(e.message);
  }
};

export const wasInvoiceSettled = async ({
  r_hash,
}: {
  r_hash?: string;
}): Promise<Result<boolean>> => {
  if (!r_hash) {
    return err('No bolt11 provided');
  }

  const headers = {
    'Grpc-Metadata-macaroon': FAUCET_MACAROON!,
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(`${FAUCET_API}/v1/invoice/${r_hash}`, {
      method: 'GET',
      headers: headers,
    });

    // is fetch ok(200)?
    if (!response.ok) {
      const text = await response.text();
      return err(`Lookup failed with status ${response.status}: ${text}`);
    }
    // did our request return an error?
    const data = await response.json();
    // if (data.payment_error) {
    //   throw new Error(`Payment failed with error: ${data.payment_error}`);
    let status = false;
    if (data.status === 1) {
      status = true;
    }

    return status;
  } catch (e) {
    console.log('error@wasInvoiceSettled: ', e.message);
    return err(e.message);
  }
};
