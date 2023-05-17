import * as electrum from 'rn-electrum-client/helpers';
import { TAvailableNetworks, networks } from '../networks';
import { Result, err } from '../result';
import {
  ICustomElectrumPeer,
  IElectrumPeerData,
  IFormattedPeerData,
  IHeader,
  ISubscribeToAddress,
  TWalletName,
} from '../types';
import { ok } from 'assert';
import { getSelectedNetwork, getWalletStore, refreshWallet } from '../wallet';
import store from '../../state/store';
import * as bitcoin from 'bitcoinjs-lib';
import { THeader } from '@synonymdev/react-native-ldk';
import { header as defaultHeader } from '../types';

export const CHUNK_LIMIT = 15; // control # requests to electrum
export const GAP_LIMIT = 20;

export const hardcodedPeers = {
  bitcoin: [
    { host: 'electrum.aantonop.com', ssl: 50002, tcp: 50001 },
    { host: 'bitcoin.lukechilds.co', ssl: 50002, tcp: 50001 },
    { host: 'electrum.hodlister.co', ssl: 50002, tcp: 50001 },
    { host: 'electrum3.hodlister.co', ssl: 50002, tcp: 50001 },
    { host: 'ecdsa.net', ssl: 110, tcp: 50001 },
    { host: 'kirsche.emzy.de', ssl: 50002, tcp: 50001 },
  ],
  bitcoinTestnet: [
    { host: 'testnet.hsmiths.com', ssl: 53012, tcp: 53011 },
    { host: 'tn.not.fyi', ssl: 55002, tcp: 55001 },
    { host: 'testnet.aranguren.org', ssl: 51002, tcp: 51001 },
  ],
  bitcoinRegtest: [{ host: '35.233.47.252', ssl: 18482, tcp: 18483 }],
};

/**
 * Formats the peer data response from an Electrum server.
 * @param {[string, string, [string, string, string]]} data
 * @return Result<IFormattedPeerData>
 */
export const formatPeerData = (
  data: [string, string, [string, string, string]]
): Result<IFormattedPeerData> => {
  try {
    if (!data) {
      return err('No data provided.');
    }
    if (data?.length !== 3) {
      return err('Invalid peer data');
    }
    if (data[2]?.length < 2) {
      return err('Invalid peer data');
    }
    const [ip, host, ports] = data;
    const [version, ssl, tcp] = ports;
    return ok({
      ip,
      host,
      version,
      ssl,
      tcp,
    });
  } catch (e) {
    return err(e);
  }
};

/**
 * Returns an array of peers.
 * If unable to acquire peers from an Electrum server the method will default to the hardcoded peers in peers.json.
 * @param {TAvailableNetworks} [selectedNetwork]
 * @return Promise<Result<IFormattedPeerData[]>>
 */
export const getPeers = async ({
  selectedNetwork,
}: {
  selectedNetwork: TAvailableNetworks;
}): Promise<Result<IFormattedPeerData[]>> => {
  try {
    if (!selectedNetwork) {
      selectedNetwork = getSelectedNetwork();
    }
    const response = await electrum.getPeers({ network: selectedNetwork });
    if (!response.error) {
      // Return an array of peers provided by the currently connected electrum server.
      let peers: IFormattedPeerData[] = [];
      await Promise.all(
        response.data.map(async (peer) => {
          const formattedPeer = await formatPeerData(peer);
          if (formattedPeer.isOk()) {
            peers.push(formattedPeer.value);
          }
        })
      );
      if (peers?.length > 0) {
        return ok(peers);
      }
    }
    // No peers available grab hardcoded peers instead.
    return ok(hardcodedPeers[selectedNetwork]);
  } catch (e) {
    console.log(e);
    return err(e);
  }
};

export const getCustomElectrumPeers = ({
  selectedNetwork,
}: {
  selectedNetwork?: TAvailableNetworks;
}): ICustomElectrumPeer[] => {
  if (!selectedNetwork) {
    selectedNetwork = getSelectedNetwork();
  }

  return store.getState().settings.customElectrumPeers[selectedNetwork];
};

/**
 * Saves block header information to storage.
 * @param {IHeader} header
 * @param {TAvailableNetworks} [selectedNetwork]
 */
export const updateHeader = ({
  header,
  selectedNetwork,
}: {
  header: IHeader;
  selectedNetwork?: TAvailableNetworks;
}): void => {
  if (!selectedNetwork) {
    selectedNetwork = getSelectedNetwork();
  }
  const payload = {
    header,
    selectedNetwork,
  };
  // update header action to modify header state in wallet.ts
  store.dispatch.wallet.setHeader(payload.header); // fix this formatting in payload
};

/**
 * Returns last known header information from storage.
 * @returns {Promise<THeader>}
 */
export const getBestBlock = async (): Promise<THeader> => {
  try {
    const header = getWalletStore().header;
    return header?.hash ? header : defaultHeader;
  } catch (e) {
    console.log(e);
    return defaultHeader;
  }
};

/**
 * Get address for a given scriptPubKey.
 * @param scriptPubKey
 * @param selectedNetwork
 * @returns {string}
 */
export const getAddressFromScriptPubKey = (
  scriptPubKey: string,
  selectedNetwork?: TAvailableNetworks
): string => {
  if (!selectedNetwork) {
    selectedNetwork = getSelectedNetwork();
  }
  const network = networks[selectedNetwork];
  return bitcoin.address.fromOutputScript(Buffer.from(scriptPubKey, 'hex'), network);
};

export const getTransactionMerkle = async ({
  tx_hash,
  height,
  selectedNetwork,
}: {
  tx_hash: string;
  height: number;
  selectedNetwork?: TAvailableNetworks;
}): Promise<any> => {
  if (!selectedNetwork) {
    selectedNetwork = getSelectedNetwork();
  }

  return await electrum.getTransactionMerkle({
    tx_hash,
    height,
    network: selectedNetwork,
  });
};

/**
 * Subscribes to the next available addressScriptHash.
 * @param {TAvailableNetworks} [selectedNetwork]
 * @param {TWalletName} [selectedWallet]
 * @param scriptHashes
 * @param onReceive
 * @return {Promise<Result<string>>}
 */
export const subscribeToAddresses = async ({
  selectedNetwork,
  scriptHashes = [],
  onReceive,
}: {
  selectedNetwork?: TAvailableNetworks;
  selectedWallet?: TWalletName;
  scriptHashes?: string[];
  onReceive?: () => void;
}): Promise<Result<string>> => {
  if (!selectedNetwork) {
    selectedNetwork = getSelectedNetwork();
  }

  // Subscribe to all provided scriphashes.
  await Promise.all(
    scriptHashes.map(async (addressScriptHash) => {
      const subscribeAddressResponse: ISubscribeToAddress = await electrum.subscribeAddress({
        scriptHash: addressScriptHash,
        network: selectedNetwork,
        onReceive: (): void => {
          refreshWallet();
          onReceive?.();
        },
      });
      if (subscribeAddressResponse.error) {
        return err('Unable to subscribe to receiving addresses.');
      }
    })
  );
  return ok('Successfully subscribed to addresses.');
};

/**
 * Returns the currently connected Electrum peer.
 * @param {TAvailableNetworks} [selectedNetwork]
 * @return {Promise<Result<IElectrumPeerData>>}
 */
export const getConnectedElectrumPeer = async (
  selectedNetwork?: TAvailableNetworks
): Promise<Result<IElectrumPeerData>> => {
  try {
    if (!selectedNetwork) {
      selectedNetwork = getSelectedNetwork();
    }
    const response = await electrum.getConnectedPeer(selectedNetwork);
    console.log('@getConnectedElectrumPeer: ', response);
    if (response?.host && response?.port && response?.protocol) {
      return ok(response);
    }
    return err('No peer available.');
  } catch (e) {
    return err(e);
  }
};
