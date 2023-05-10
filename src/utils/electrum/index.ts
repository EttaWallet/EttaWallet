import * as electrum from 'rn-electrum-client/helpers';
import { err, ok, Result } from '../result';
import { getAddressFromScriptPubKey, updateHeader } from './helpers';
import { Block } from 'bitcoinjs-lib';
import {
  ICustomElectrumPeer,
  IGetHeaderResponse,
  IHeader,
  ISubscribeToHeader,
  IWalletItem,
  TGetAddressHistory,
} from '../types';
import { TAvailableNetworks } from '../networks';
import { getSelectedNetwork } from '../wallet';
import { getCustomElectrumPeers, hardcodedPeers } from './helpers';
import store from '../../state/store';
import { getBitcoinScriptHash } from '../bitcoin';

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
type TCustomElectrumPeerOptionalProtocol = PartialBy<ICustomElectrumPeer, 'protocol'>;

const tempElectrumServers: IWalletItem<TCustomElectrumPeerOptionalProtocol[]> = {
  bitcoin: hardcodedPeers.bitcoin,
  bitcoinTestnet: hardcodedPeers.bitcoinTestnet,
  bitcoinRegtest: [],
};
/**
 * Returns the block hash given a block hex.
 * Leaving blockHex empty will return the last known block hash from storage.
 * @param {string} [blockHex]
 * @param {TAvailableNetworks} [selectedNetwork]
 * @returns {string}
 */
export const getBlockHashFromHex = ({
  blockHex,
  selectedNetwork,
}: {
  blockHex?: string;
  selectedNetwork?: TAvailableNetworks;
}): string => {
  if (!selectedNetwork) {
    selectedNetwork = getSelectedNetwork();
  }
  // If empty, return the last known block hex from storage.
  if (!blockHex) {
    const { hex } = getBlockHeader();
    blockHex = hex;
  }
  const block = Block.fromHex(blockHex);
  const hash = block.getId();
  return hash;
};

/**
 * Returns last known block height, and it's corresponding hex from local storage.
 * @returns {IHeader}
 */
export const getBlockHeader = (): IHeader => {
  return store.getState().wallet.header;
};

/**
 * Returns the block hash for the provided height and network.
 * @param {number} [height]
 * @returns {Promise<Result<string>>}
 */
export const getBlockHashFromHeight = async ({
  height = 0,
}: {
  height?: number;
}): Promise<Result<string>> => {
  const response = await getBlockHex({ height });
  if (response.isErr()) {
    return err(response.error.message);
  }
  const blockHash = await getBlockHashFromHex({ blockHex: response.value });
  return ok(blockHash);
};

/**
 * Returns the block hex of the provided block height.
 * @param {number} [height]
 * @param {TAvailableNetworks} [selectedNetwork]
 * @returns {Promise<Result<string>>}
 */
export const getBlockHex = async ({
  height = 0,
  selectedNetwork,
}: {
  height?: number;
  selectedNetwork?: TAvailableNetworks;
}): Promise<Result<string>> => {
  if (!selectedNetwork) {
    selectedNetwork = getSelectedNetwork();
  }
  const response: IGetHeaderResponse = await electrum.getHeader({
    height,
    network: selectedNetwork,
  });
  if (response.error) {
    return err(response.data);
  }
  return ok(response.data);
};

/**
 * Connects to the provided electrum peer. Otherwise, it will attempt to connect to a set of default peers.
 * @param {TAvailableNetworks} [selectedNetwork]
 * @param {number} [retryAttempts]
 * @param {ICustomElectrumPeer[]} [customPeers]
 * @param {{ net: undefined, tls: undefined }} [options]
 * @return {Promise<Result<string>>}
 */
export const connectToElectrum = async ({
  selectedNetwork,
  retryAttempts = 2,
  customPeers,
  options = { net: undefined, tls: undefined },
}: {
  selectedNetwork?: TAvailableNetworks;
  retryAttempts?: number;
  customPeers?: TCustomElectrumPeerOptionalProtocol[];
  options?: { net?: any; tls?: any };
} = {}): Promise<Result<string>> => {
  if (!selectedNetwork) {
    selectedNetwork = getSelectedNetwork();
  }
  const net = options.net ?? global?.net;
  // const _tls = options.tls ?? tls;
  const _tls = options.tls ?? global?.tls;

  //Attempt to disconnect from any old/lingering connections
  await electrum.stop({ network: selectedNetwork });

  // Fetch any stored custom peers.
  if (!customPeers) {
    customPeers = getCustomElectrumPeers({ selectedNetwork });
  }
  // if no custom peers, use default peers from state
  if (customPeers.length < 1) {
    customPeers = tempElectrumServers[selectedNetwork];
  }

  let startResponse = { error: true, data: '' };
  for (let i = 0; i < retryAttempts; i++) {
    startResponse = await electrum.start({
      network: selectedNetwork,
      customPeers,
      net,
      tls: _tls,
    });
    if (!startResponse.error) {
      break;
    }
  }

  if (startResponse.error) {
    //Attempt one more time
    const { error, data } = await electrum.start({
      network: selectedNetwork,
      customPeers,
      net,
      tls: _tls,
    });
    if (error) {
      const msg = data || 'An unknown error occurred.';
      return err(msg);
    }
    return ok(data);
  }
  // update state
  store.dispatch.app.setIsConnectedToElectrum(true);
  return ok(startResponse.data);
};

/**
 * Subscribes to the current networks headers.
 * @param {string} [selectedNetwork]
 * @param {Function} [onReceive]
 * @return {Promise<Result<string>>}
 */
export const subscribeToHeader = async ({
  selectedNetwork,
  onReceive,
}: {
  selectedNetwork?: TAvailableNetworks;
  onReceive?: () => void;
}): Promise<Result<IHeader>> => {
  if (!selectedNetwork) {
    selectedNetwork = getSelectedNetwork();
  }
  const subscribeResponse: ISubscribeToHeader = await electrum.subscribeHeader({
    network: selectedNetwork,
    onReceive: async (data) => {
      const hex = data[0].hex;
      const hash = getBlockHashFromHex({ blockHex: hex, selectedNetwork });
      updateHeader({
        selectedNetwork,
        header: { ...data[0], hash },
      });
      onReceive?.();
    },
  });
  if (subscribeResponse.error) {
    return err('Unable to subscribe to headers.');
  }

  // @ts-ignore
  if (subscribeResponse?.data === 'Already Subscribed.') {
    return ok(getBlockHeader());
  }
  // Update local storage with current height and hex.
  const hex = subscribeResponse.data.hex;
  const hash = getBlockHashFromHex({ blockHex: hex, selectedNetwork });
  const header = { ...subscribeResponse.data, hash };
  updateHeader({
    selectedNetwork,
    header,
  });
  return ok(header);
};

/**
 * Used to retrieve scriptPubkey history for LDK.
 * @param {string} scriptPubkey
 * @param {TAvailableNetworks} [selectedNetwork]
 * @returns {Promise<TGetAddressHistory[]>}
 */
export const getScriptPubKeyHistory = async (
  scriptPubkey: string,
  selectedNetwork?: TAvailableNetworks
): Promise<TGetAddressHistory[]> => {
  if (!selectedNetwork) {
    selectedNetwork = getSelectedNetwork();
  }
  let history: { txid: string; height: number }[] = [];
  const address = getAddressFromScriptPubKey(scriptPubkey, selectedNetwork);
  if (!address) {
    return history;
  }
  const scriptHash = await getBitcoinScriptHash(address, selectedNetwork);
  if (!scriptHash) {
    return history;
  }
  const response = await electrum.getAddressScriptHashesHistory({
    scriptHashes: [scriptHash],
    network: selectedNetwork,
  });
  if (response.error) {
    return history;
  }
  await Promise.all(
    response.data.map(({ result }): void => {
      if (result && result?.length > 0) {
        result.map((item) => {
          history.push({
            txid: item?.tx_hash ?? '',
            height: item?.height ?? 0,
          });
        });
      }
    })
  );
  return history;
};

/**
 * Returns combined balance of provided addresses.
 * @param {string[]} addresses
 * @param {TAvailableNetworks} [selectedNetwork]
 */
export const getAddressBalance = async ({
  addresses = [],
  selectedNetwork,
}: {
  addresses: string[];
  selectedNetwork?: TAvailableNetworks;
}): Promise<Result<number>> => {
  try {
    if (!selectedNetwork) {
      selectedNetwork = getSelectedNetwork();
    }
    const scriptHashes = await Promise.all(
      addresses.map(async (address) => {
        if (!selectedNetwork) {
          selectedNetwork = getSelectedNetwork();
        }
        return await getBitcoinScriptHash(address, selectedNetwork);
      })
    );
    const res = await electrum.getAddressScriptHashBalances({
      scriptHashes,
      network: selectedNetwork,
    });
    if (res.error) {
      return err(res.data);
    }
    return ok(
      res.data.reduce((acc, cur) => {
        return acc + Number(cur.result?.confirmed ?? 0) + Number(cur.result?.unconfirmed ?? 0);
      }, 0) || 0
    );
  } catch (e) {
    return err(e);
  }
};

export const broadcastTransaction = async ({
  rawTx,
  selectedNetwork,
}: {
  rawTx: string;
  selectedNetwork?: TAvailableNetworks;
}): Promise<Result<string>> => {
  if (!selectedNetwork) {
    selectedNetwork = getSelectedNetwork();
  }

  const broadcastResponse = await electrum.broadcastTransaction({
    rawTx,
    network: selectedNetwork,
  });
  // TODO: This needs to be resolved in rn-electrum-client
  if (broadcastResponse.error || broadcastResponse.data.includes(' ')) {
    return err(broadcastResponse.data);
  }
  return ok(broadcastResponse.data);
};
