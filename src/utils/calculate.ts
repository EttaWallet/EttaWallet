import { LSP_FEE_ESTIMATE_API, LSP_PUBKEY } from '../../config';
import { showErrorBanner } from './alerts';
import { getLightningStore, hasEnoughRemoteBalance } from './lightning/helpers';

/**
 * Attempts to estimate fees payable if LSP involvement is deemed necessary
 * @returns {number}
 */
export const estimateInvoiceFees = async (
  amountSats: number
): Promise<{
  amount_msat: number;
  id: string;
}> => {
  let feeData;
  if (!hasEnoughRemoteBalance({ amountSats })) {
    try {
      const response = await fetch(`${LSP_FEE_ESTIMATE_API}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount_msat: amountSats * 1000, // get amount in msats
          pubkey: LSP_PUBKEY,
        }),
      });

      feeData = await response.json();
    } catch (e) {
      showErrorBanner({
        message: e.message,
      });
    }
  }
  return {
    amount_msat: feeData.amount_msat,
    id: feeData.id,
  };
};

/**
 * Returns highest remote balance across all open channel
 * @returns {number}
 */
export const getMaxRemoteBalance = (): number => {
  // get openchannel ids from lightning store
  const openChannelIds = getLightningStore().openChannelIds;
  // get all channels from lightning store
  const AllChannels = getLightningStore().channels;

  const openChannels = Object.values(AllChannels).filter((channel) => {
    return openChannelIds.includes(channel.channel_id);
  });

  let maxRemoteBalance = 0;

  // loop through all open channels and check if any has sufficient inbound liquidity
  for (const channel in openChannels) {
    if (openChannels[channel].is_channel_ready && openChannels[channel].inbound_capacity_sat > 0) {
      maxRemoteBalance = openChannels[channel].inbound_capacity_sat;
    }
  }
  return maxRemoteBalance;
};
