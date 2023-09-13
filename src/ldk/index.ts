import { err, ok, Result } from '../utils/result';
//@ts-ignore
import * as electrum from 'rn-electrum-client/helpers';
import {
  getBlockHeader,
  getBlockHex,
  getScriptPubKeyHistory,
  broadcastTransaction,
} from '../utils/electrum';
import lm, {
  DefaultTransactionDataShape,
  EEventTypes,
  TChannel,
  TChannelManagerClaim,
  TChannelManagerOpenChannelRequest,
  TChannelManagerPaymentFailed,
  TChannelManagerPaymentPathFailed,
  TChannelManagerPaymentPathSuccessful,
  TChannelManagerPaymentSent,
  TChannelUpdate,
  TInvoice,
  TTransactionData,
  TTransactionPosition,
  TUserConfig,
} from '@synonymdev/react-native-ldk';
import ldk from '@synonymdev/react-native-ldk/dist/ldk';
import {
  updateLdkVersion,
  updateLdkNodeId,
  setLdkStoragePath,
  getLdkAccount,
  updateLightningChannels,
  updateClaimableBalance,
  getLightningStore,
  updateMaxReceivableAmount,
  removeExpiredInvoices,
  syncPaymentsWithStore,
  addPeers,
  DEFAULT_LIGHTNING_PEERS,
} from '../utils/lightning/helpers';
import { TLightningNodeVersion } from '../utils/types';
import { EmitterSubscription, InteractionManager } from 'react-native';
import { promiseTimeout, sleep, tryNTimes } from '../utils/helpers';
import { getBestBlock, getTransactionMerkle } from '../utils/electrum/helpers';
import { getLdkNetwork, TAvailableNetworks } from '../utils/networks';
import { getReceiveAddress, getSelectedNetwork, getWalletStore } from '../utils/wallet';
import { showSuccessBanner, showToast } from '../utils/alerts';
import { navigate } from '../navigation/NavigationService';
import { Screens } from '../navigation/Screens';
import { showErrorBanner } from '../utils/alerts';
import store from '../state/store';

let LDKIsStayingSynced = false;

// Subscribe to LDK module events
let onPaymentClaimedSubscription: EmitterSubscription | undefined;
let onPaymentSentSubscription: EmitterSubscription | undefined;
let onPaymentFailedSubscription: EmitterSubscription | undefined;
let onOpenChannelSubscription: EmitterSubscription | undefined;
let onChannelSubscription: EmitterSubscription | undefined;
let onPaymentPathSuccessSubscription: EmitterSubscription | undefined;
let onPaymentPathFailedSubscription: EmitterSubscription | undefined;

/**
 * Syncs LDK to the current height.
 * @returns {Promise<Result<string>>}
 */
export const refreshLdk = async ({
  selectedNetwork,
}: {
  selectedNetwork?: TAvailableNetworks;
}): Promise<Result<string>> => {
  try {
    // wait for the bells and whistles to finish
    await new Promise((resolve) => InteractionManager.runAfterInteractions(() => resolve(null)));

    if (!selectedNetwork) {
      selectedNetwork = getSelectedNetwork();
    }

    const isRunning = await isLdkRunning();
    if (!isRunning) {
      // Not up, attempt to reset LDK
      await resetLdk();
      // run fresh ldk setup; no need to refresh(sync) at this time.
      const setupResponse = await setupLdk({ selectedNetwork, shouldRefreshLdk: false });
      if (setupResponse.isErr()) {
        return err(setupResponse.error.message);
      }
      // keep synced every 2mins(default or define frequency param)
      keepLdkSynced({}).then();
    }
    const syncResponse = await lm.syncLdk();
    await lm.setFees();
    if (syncResponse.isErr()) {
      return err(syncResponse.error.message);
    }

    // update channels
    await updateLightningChannels();
    await Promise.all([addPeers({ selectedNetwork }), await updateLightningChannels()]);
    // update balance
    await updateClaimableBalance({ selectedNetwork });
    // update maximum receivable amount
    await updateMaxReceivableAmount();

    // remove invoices that have surpassed expiry time from state
    await removeExpiredInvoices();

    // sync ldk payments activity with payments store object
    await syncPaymentsWithStore();

    return ok('');
  } catch (e) {
    return err(`@refreshLdk ${e}`);
  }
};

/* Attempt to restart Ldk */
export const restartLdk = async (): Promise<Result<string>> => {
  await new Promise((resolve) => InteractionManager.runAfterInteractions(() => resolve(null)));

  return await ldk.restart();
};

/* Attempt to stop Ldk */
export const resetLdk = async (): Promise<Result<string>> => {
  await new Promise((resolve) => InteractionManager.runAfterInteractions(() => resolve(null)));

  return await ldk.stop();
};

/**
 * Check if LDK is running.
 * @returns {Promise<boolean>}
 */
export const isLdkRunning = async (): Promise<boolean> => {
  const getNodeIdResponse = await promiseTimeout<Result<string>>(2000, getNodeId());
  if (getNodeIdResponse.isOk()) {
    return true;
  } else {
    return false;
  }
};

/**
 * Pauses execution until LDK is setup.
 * @returns {Promise<void>}
 */
export const waitForLdk = async (): Promise<void> => {
  await tryNTimes({
    toTry: getNodeId,
    interval: 500,
  });
};

/**
 * Attempts to keep LDK in sync every 2-minutes.
 * @param {number} frequency
 */
export const keepLdkSynced = async ({
  frequency = 120000,
  selectedNetwork,
}: {
  frequency?: number;
  selectedNetwork?: TAvailableNetworks;
}): Promise<void> => {
  if (LDKIsStayingSynced) {
    return;
  } else {
    LDKIsStayingSynced = true;
  }

  if (!selectedNetwork) {
    selectedNetwork = getSelectedNetwork();
  }

  let error: string = '';
  while (!error) {
    const syncRes = await refreshLdk({ selectedNetwork });

    if (!syncRes) {
      error = 'Could not refresh LDK.';
      LDKIsStayingSynced = false;
      break;
    }
    await sleep(frequency);
  }
};

/**
 * Returns the current LDK node id.
 * @returns {Promise<Result<string>>}
 */
export const getNodeId = async (): Promise<Result<string>> => {
  try {
    return await ldk.nodeId();
  } catch (e) {
    return err(e);
  }
};

/**
 * Returns LDK and c-bindings version.
 * @returns {Promise<Result<TLightningNodeVersion>}
 */
export const getNodeVersion = (): Promise<Result<TLightningNodeVersion>> => {
  return ldk.version();
};

const defaultUserConfig: TUserConfig = {
  channel_handshake_config: {
    announced_channel: false,
    max_htlc_value_in_flight_percent_of_channel: 100,
    minimum_depth: 0,
    negotiate_anchors_zero_fee_htlc_tx: true, //Required for zero conf
  },
  manually_accept_inbound_channels: true,
  accept_inbound_channels: true, // to allow zero conf
  accept_intercept_htlcs: true, // required by Voltage LSP Flow2.0? // LDK versions prior to 0.0.113 not supported
  accept_mpp_keysend: true,
  accept_forwards_to_priv_channels: true,
};

/**
 * Used to spin-up LDK services.
 * In order, this method:
 * 1. Fetches and sets the genesis hash.
 * 2. Retrieves and sets the seed from storage.
 * 3. Starts ldk with the necessary params.
 * 4. Syncs LDK.
 */
export const setupLdk = async ({
  selectedNetwork,
  shouldRefreshLdk = true,
}: {
  selectedNetwork: TAvailableNetworks;
  shouldRefreshLdk?: boolean;
}): Promise<Result<string>> => {
  try {
    if (!selectedNetwork) {
      selectedNetwork = getSelectedNetwork();
    }
    // start from clean slate
    await resetLdk();

    const account = await getLdkAccount();
    if (account.isErr()) {
      return err(account.error.message);
    }

    const _getAddress = async (): Promise<string> => {
      // return a valid receive address for the selected network
      const res = await getReceiveAddress({ selectedNetwork });
      if (res) {
        return res;
      }
      return '';
    };

    const _broadcastTransaction = async (rawTx: string): Promise<string> => {
      const res = await broadcastTransaction({
        rawTx,
        selectedNetwork,
      });
      if (res.isErr()) {
        return '';
      }
      return res.value;
    };

    const storageRes = await setLdkStoragePath();
    if (storageRes.isErr()) {
      return err(storageRes.error);
    }

    // derive fees from updated state
    const feesStore = getWalletStore().fees;

    // start the lightning manager
    const lmStart = await lm.start({
      account: account.value,
      getFees: () =>
        Promise.resolve({
          highPriority: feesStore.fast,
          normal: feesStore.normal,
          background: feesStore.slow,
        }),
      network: getLdkNetwork(selectedNetwork),
      getBestBlock,
      getAddress: _getAddress,
      broadcastTransaction: _broadcastTransaction,
      getTransactionData: (txId) => _getTransactionData(txId, selectedNetwork),
      getScriptPubKeyHistory: (scriptPubkey) => {
        return getScriptPubKeyHistory(scriptPubkey, selectedNetwork);
      },
      getTransactionPosition: (params) => {
        return getTransactionPosition({ ...params, selectedNetwork });
      },
      userConfig: defaultUserConfig,
      trustedZeroConfPeers: [DEFAULT_LIGHTNING_PEERS[selectedNetwork]],
    });
    if (lmStart.isErr()) {
      return err(`@lmStart: ${lmStart.error.message}`);
    }

    // Grab node id and add it to state
    const nodeIdRes = await ldk.nodeId();
    if (nodeIdRes.isErr()) {
      return err(nodeIdRes.error.message);
    }
    await Promise.all([
      await updateLdkNodeId({
        nodeId: nodeIdRes.value,
      }),
      // also update ldk node version in state
      updateLdkVersion(),
      // removeUnusedPeers({ selectedWallet, selectedNetwork }),
    ]);
    // if yes, start sync
    if (shouldRefreshLdk) {
      await refreshLdk({ selectedNetwork });
    }

    // subscribe to events from LDK
    subscribeToPayments({ selectedNetwork });

    return ok(`LDK NodeID: ${nodeIdRes.value}`);
  } catch (e) {
    return err(e.toString());
  }
};

/**
 * Returns the transaction header, height and hex (transaction) for a given txid.
 * @param {string} txId
 * @param {TAvailableNetworks} [selectedNetwork]
 * @returns {Promise<TTransactionData>}
 */
export const _getTransactionData = async (
  txId: string = '',
  selectedNetwork?: TAvailableNetworks
): Promise<TTransactionData> => {
  let transactionData = DefaultTransactionDataShape;
  try {
    const data = {
      key: 'tx_hash',
      data: [
        {
          tx_hash: txId,
        },
      ],
    };

    if (selectedNetwork) {
      selectedNetwork = getSelectedNetwork();
    }

    const response = await electrum.getTransactions({
      txHashes: data,
      network: selectedNetwork,
    });

    if (response.error || !response.data || response.data[0].error) {
      console.log(
        `@getTransactions: something ain't right: ${JSON.stringify(response.data[0].error.message)}`
      );
      return transactionData;
    }

    const { confirmations, hex: hex_encoded_tx, vout } = response.data[0].result;
    const header = getBlockHeader();
    const currentHeight = header.height;
    let confirmedHeight = 0;
    if (confirmations) {
      confirmedHeight = currentHeight - confirmations + 1;
    }
    const hexEncodedHeader = await getBlockHex({
      height: confirmedHeight,
      selectedNetwork,
    });
    if (hexEncodedHeader.isErr()) {
      return transactionData;
    }
    const voutData = vout.map(({ n, value, scriptPubKey: { hex } }) => {
      return { n, hex, value };
    });
    return {
      header: hexEncodedHeader.value,
      height: confirmedHeight,
      transaction: hex_encoded_tx,
      vout: voutData,
    };
  } catch {
    return transactionData;
  }
};

/**
 * Returns the position/index of the provided tx_hash within a block.
 * @param {string} tx_hash
 * @param {number} height
 * @returns {Promise<number>}
 */
export const getTransactionPosition = async ({
  tx_hash,
  height,
  selectedNetwork,
}: {
  tx_hash: string;
  height: number;
  selectedNetwork?: TAvailableNetworks;
}): Promise<TTransactionPosition> => {
  const response = await getTransactionMerkle({
    tx_hash,
    height,
    selectedNetwork,
  });
  if (response.error || isNaN(response.data?.pos) || response.data?.pos < 0) {
    return -1;
  }
  return response.data.pos;
};
/**
 * Retrieves any pending/unpaid invoices from the invoices array via payment hash.
 * @param {string} paymentHash
 * @param {TAvailableNetworks} [selectedNetwork]
 */
export const getPendingInvoice = ({
  paymentHash,
  selectedNetwork,
}: {
  paymentHash: string;
  selectedNetwork?: TAvailableNetworks;
}): Result<TInvoice> => {
  try {
    if (!selectedNetwork) {
      selectedNetwork = getSelectedNetwork();
    }
    const invoices = getLightningStore().invoices;
    const invoice = invoices.filter((inv) => inv.payment_hash === paymentHash);
    if (invoice.length > 0) {
      return ok(invoice[0]);
    }
    return err('Unable to find any pending invoices.');
  } catch (e) {
    return err(e);
  }
};

/**
 * Retrieves any pending channels from the channels object via announced channelId.
 * @param {string} channelId
 * @param {TAvailableNetworks} [selectedNetwork]
 */
export const getPendingChannel = ({
  channelId,
  selectedNetwork,
}: {
  channelId: string;
  selectedNetwork?: TAvailableNetworks;
}): Result<TInvoice> => {
  try {
    if (!selectedNetwork) {
      selectedNetwork = getSelectedNetwork();
    }
    const channels = getLightningStore().channels;
    const channel = Object.values(channels).filter((c) => c.channel_id === channelId);
    if (channel.length > 0) {
      return ok(channel[0]);
    }
    return err('Unable to find any pending channels.');
  } catch (e) {
    return err(e);
  }
};

/**
 * Returns an array of pending and open channels
 * @returns Promise<Result<TChannel[]>>
 */
export const getChannelsFromLdk = (): Promise<Result<TChannel[]>> => {
  return ldk.listChannels();
};

/**
 * Returns an array of unconfirmed/pending lightning channels from either storage or directly from the LDK node.
 * @param {boolean} [fromStorage]
 * @param {TAvailableNetworks} [selectedNetwork]
 * @returns {Promise<Result<TChannel[]>>}
 */
export const getAllPendingChannels = async ({
  fromStorage = false,
  selectedNetwork,
}: {
  fromStorage?: boolean;
  selectedNetwork?: TAvailableNetworks;
}): Promise<Result<TChannel[]>> => {
  let channels: TChannel[];
  if (fromStorage) {
    if (!selectedNetwork) {
      selectedNetwork = getSelectedNetwork();
    }
    const channelsStore = getLightningStore().channels;
    channels = Object.values(channelsStore);
  } else {
    const channelsResponse = await getChannelsFromLdk();
    if (channelsResponse.isErr()) {
      return err(channelsResponse.error.message);
    }
    channels = channelsResponse.value;
  }
  const pendingChannels = channels.filter((channel) => !channel.is_channel_ready);
  return ok(pendingChannels);
};

export const handleReceivedPayment = async ({
  payment,
  selectedNetwork,
}: {
  payment: TChannelManagerClaim;
  selectedNetwork?: TAvailableNetworks;
}): Promise<void> => {
  if (!selectedNetwork) {
    selectedNetwork = getSelectedNetwork();
  }
  showToast({
    message: `Incoming payment: ${payment.amount_sat} sats`,
  });
  const invoice = getPendingInvoice({
    paymentHash: payment.payment_hash,
    selectedNetwork,
  });

  if (invoice.isOk()) {
    // and remove associated invoice from store via matching payment_hash
    store.dispatch.lightning.removeInvoice(payment.payment_hash);

    await refreshLdk({ selectedNetwork });

    navigate(Screens.TransactionSuccessScreen, {
      txId: payment.payment_hash,
      amountInSats: payment.amount_sat,
    });
  }
};

export const handleNewChannelSubscription = async ({
  channel,
  selectedNetwork,
}: {
  channel: TChannelUpdate;
  selectedNetwork?: TAvailableNetworks;
}): Promise<void> => {
  if (!selectedNetwork) {
    selectedNetwork = getSelectedNetwork();
  }
  const pendingChannel = getPendingChannel({
    channelId: channel.channel_id,
    selectedNetwork,
  });
  if (pendingChannel.isOk()) {
    // show channel opening screen
    navigate(Screens.ChannelStatusScreen, {
      channel: pendingChannel,
    });
  }
};

/**
 * Handle inbound zero-conf channels manually via the OpenChannelRequest event.
 * @param {TChannelManagerOpenChannelRequest} [newChannel]
 * @param {TAvailableNetworks} [selectedNetwork]
 */
export const handleOpenZeroConfChannel = async ({
  newChannel,
  selectedNetwork,
}: {
  newChannel: TChannelManagerOpenChannelRequest;
  selectedNetwork?: TAvailableNetworks;
}): Promise<void> => {
  if (!selectedNetwork) {
    selectedNetwork = getSelectedNetwork();
  }

  const {
    counterparty_node_id,
    temp_channel_id,
    push_sat,
    funding_satoshis,
    requires_zero_conf,
    supports_zero_conf,
    requires_anchors_zero_fee_htlc_tx,
  } = newChannel;

  console.log(
    `new inbound channel: ${temp_channel_id} from: ${counterparty_node_id}; requires zero conf: ${requires_zero_conf}; supports zero conf: ${supports_zero_conf}; requires anchors: ${requires_anchors_zero_fee_htlc_tx} and capacity ${funding_satoshis} pushing ${push_sat} sats to Etta`
  );
};

/**
 * Subscribes to incoming lightning payments.
 * @param {TAvailableNetworks} [selectedNetwork]
 */
export const subscribeToPayments = ({
  selectedNetwork,
}: {
  selectedNetwork?: TAvailableNetworks;
}): void => {
  if (!selectedNetwork) {
    selectedNetwork = getSelectedNetwork();
  }
  /***
   * Handle received payments.
   */
  if (!onPaymentClaimedSubscription) {
    onPaymentClaimedSubscription = ldk.onEvent(
      EEventTypes.channel_manager_payment_claimed,
      (res: TChannelManagerClaim) => {
        handleReceivedPayment({
          payment: res,
          selectedNetwork,
        }).then();
      }
    );
  }
  /***
   * Handle sent payments.
   */
  if (!onPaymentSentSubscription) {
    onPaymentSentSubscription = ldk.onEvent(
      EEventTypes.channel_manager_payment_sent,
      (res: TChannelManagerPaymentSent) => {
        showSuccessBanner({
          title: 'Sent!',
          message: 'Payment is on the way',
          dismissAfter: 3000,
        });
        console.log('onPaymentSentSubscription: ', res);
        refreshLdk({ selectedNetwork }).then();
      }
    );
  }
  /***
   * Handle failed payments.
   */
  if (!onPaymentFailedSubscription) {
    onPaymentFailedSubscription = ldk.onEvent(
      EEventTypes.channel_manager_payment_failed,
      (res: TChannelManagerPaymentFailed) => {
        console.log('onPaymentFailedSubscription: ', res);
      }
    );
  }
  /***
   * Handle failed payments path
   */
  if (!onPaymentPathFailedSubscription) {
    onPaymentPathFailedSubscription = ldk.onEvent(
      EEventTypes.channel_manager_payment_path_failed,
      (res: TChannelManagerPaymentPathFailed) => {
        console.log('onPaymentPathFailedSubscription: ', res);
      }
    );
  }
  /**
   * Manually handle zero-conf inbound channels. Must set manually_accept_inbound_channels to true
   * in userConfig and use the method accept_inbound_channel_from_trusted_peer_0conf which is
   * currently unavailable
   */
  if (!onOpenChannelSubscription) {
    onOpenChannelSubscription = ldk.onEvent(
      EEventTypes.channel_manager_open_channel_request,
      (_res: TChannelManagerOpenChannelRequest) => {
        handleOpenZeroConfChannel({
          newChannel: _res,
          selectedNetwork,
        });

        refreshLdk({ selectedNetwork }).then();
      }
    );
  }
  if (!onChannelSubscription) {
    onChannelSubscription = ldk.onEvent(EEventTypes.new_channel, (_res: TChannelUpdate) => {
      // showToastWithCTA({
      //   message: 'New channel opened successfully',
      //   buttonLabel: 'Explore',
      //   buttonAction: () => navigate(Screens.ChannelsScreen),
      // });
      // console.info('channel opened successfully. Make this a toast');
      handleNewChannelSubscription({
        channel: _res,
        selectedNetwork,
      }).then();
      refreshLdk({ selectedNetwork }).then();
    });
  }
  if (!onPaymentPathSuccessSubscription) {
    onPaymentPathSuccessSubscription = ldk.onEvent(
      EEventTypes.channel_manager_payment_path_successful,
      (_res: TChannelManagerPaymentPathSuccessful) => {
        // update payment object that matches payment hash
        console.log('onPaymentPathSuccessSubscription: ', _res);
        store.dispatch.lightning.updatePayment({
          payment_hash: _res.payment_hash,
          updates: {
            pathData: _res.path_hops,
          },
        });
        refreshLdk({ selectedNetwork }).then();
      }
    );
  }
  if (!onPaymentFailedSubscription) {
    onPaymentFailedSubscription = ldk.onEvent(
      EEventTypes.channel_manager_payment_path_failed,
      (_res: TChannelManagerPaymentPathFailed) => {
        showErrorBanner({
          title: 'Payment failed',
          message: "Couldn't find a route to the payee",
          dismissAfter: 3000,
        });
        refreshLdk({ selectedNetwork }).then();
      }
    );
  }
};

export const unsubscribeFromLDKSubscriptions = (): void => {
  onPaymentClaimedSubscription?.remove();
  onPaymentFailedSubscription?.remove();
  onPaymentSentSubscription?.remove();
  onChannelSubscription?.remove();
  onPaymentPathSuccessSubscription?.remove();
  onPaymentPathFailedSubscription?.remove();
  console.info('unsubscribing from all emitters');
};
