import * as electrum from 'rn-electrum-client/helpers';
import { err, ok, Result } from '../result';
import { getItem, updateHeader } from '../../ldk';
import { Block } from 'bitcoinjs-lib';
import * as tls from './tls';
import { customPeers, selectedNetwork } from '../lightning/constants';
import { THeader } from '@synonymdev/react-native-ldk';
import { IGetHeaderResponse, ISubscribeToHeader, TGetAddressHistory } from '../types';
import { getAddressFromScriptPubKey, getScriptHash } from '../lightning/helpers';

/**
 * Returns the block hash given a block hex.
 * Leaving blockHex empty will return the last known block hash from storage.
 * @param {string} [blockHex]
 * @returns {string}
 */
export const getBlockHashFromHex = async ({ blockHex }: { blockHex?: string }): Promise<string> => {
  // If empty, return the last known block hex from storage.
  if (!blockHex) {
    const { hex } = await getBlockHeader();
    blockHex = hex;
  }
  const block = Block.fromHex(blockHex);
  const hash = block.getId();
  return hash;
};

/**
 * Returns last known block height, and it's corresponding hex from local storage.
 * @returns {THeader}
 */
export const getBlockHeader = async (): Promise<THeader> => {
  const header = await getItem('header');
  return JSON.parse(header);
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
 * @returns {Promise<Result<string>>}
 */
export const getBlockHex = async ({ height = 0 }: { height?: number }): Promise<Result<string>> => {
  const response: IGetHeaderResponse = await electrum.getHeader({
    height,
    network: selectedNetwork,
  });
  if (response.error) {
    return err(response.data);
  }
  return ok(response.data);
};

export const connectToElectrum = async ({
  options = { net: undefined, tls: undefined },
}: {
  options?: { net?: any; tls?: any };
}): Promise<Result<string>> => {
  const net = options.net ?? global?.net;
  const _tls = options.tls ?? tls;

  console.info('NET', net);

  const startResponse = await electrum.start({
    network: selectedNetwork,
    customPeers: customPeers[selectedNetwork],
    net,
    tls: _tls,
  });

  if (startResponse.error) {
    //Attempt one more time
    const { error, data } = await electrum.start({
      network: selectedNetwork,
      customPeers: customPeers[selectedNetwork],
      net,
      tls: _tls,
    });
    if (error) {
      return err(data);
    }
  }
  return ok('Successfully connected.');
};

/**
 * Subscribes to the current networks headers.
 * @param {Function} [onReceive]
 * @return {Promise<Result<string>>}
 */
export const subscribeToHeader = async ({
  onReceive,
}: {
  onReceive?: Function;
}): Promise<Result<THeader>> => {
  const subscribeResponse: ISubscribeToHeader = await electrum.subscribeHeader({
    network: selectedNetwork,
    onReceive: async (data) => {
      const hex = data[0].hex;
      const hash = getBlockHashFromHex({ blockHex: hex });
      const header = { ...data[0], hash };
      await updateHeader({
        header,
      });
      if (onReceive) {
        onReceive();
      }
    },
  });
  if (subscribeResponse.error) {
    return err('Unable to subscribe to headers.');
  }
  // Update local storage with current height and hex.
  const hex = subscribeResponse.data.hex;
  const hash = await getBlockHashFromHex({ blockHex: hex });
  const header = { ...subscribeResponse.data, hash };
  await updateHeader({
    header,
  });
  return ok(header);
};

export const getScriptPubKeyHistory = async (
  scriptPubkey: string
): Promise<TGetAddressHistory[]> => {
  try {
    const address = getAddressFromScriptPubKey(scriptPubkey);
    const scriptHash = getScriptHash(address);
    const response = await electrum.getAddressScriptHashesHistory({
      scriptHashes: [scriptHash],
      network: selectedNetwork,
    });

    /*
		const mempoolResponse = await electrum.getAddressScriptHashesMempool({
			scriptHashes: [scriptHash],
			network: selectedNetwork,
		});

		if (response.error || mempoolResponse.error) {
			return [];
		}
		const combinedResponse = [...response.data, ...mempoolResponse.data];
		*/

    let history: { txid: string; height: number }[] = [];
    await Promise.all(
      response.data.map(({ result }): void => {
        if (result && result?.length > 0) {
          result.map((item) => {
            // @ts-ignore
            history.push({
              txid: item?.tx_hash ?? '',
              height: item?.height ?? 0,
            });
          });
        }
      })
    );

    return history;
  } catch {
    return [];
  }
};
