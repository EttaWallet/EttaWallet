import { LSP_API, LSP_FEE_ESTIMATE_API } from '../../../config';
import { showErrorBanner } from '../alerts';
import { getNodeIdFromStorage } from '../lightning/helpers';
import { Result, ok } from '../result';
import { LspFeeResponse, LspWrappedRequest } from '../types';

/**
 * Attempts to estimate fees payable to the LSP for a zero conf channel
 * @param {number} amountSats
 * @returns {LspFeeResponse}
 */
export const getLspFeeEstimate = async (amountSats: number): Promise<Result<LspFeeResponse>> => {
  const nodeId = await getNodeIdFromStorage();
  try {
    const response = await fetch(`${LSP_FEE_ESTIMATE_API}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount_msat: amountSats * 1000, // get amount in msats
        pubkey: nodeId,
      }),
    });
    const { amount_msat, id } = await response.json();

    return ok({ amount_msat, id });
  } catch (e) {
    showErrorBanner({
      message: e.message,
    });

    // return err(e);
  }
};

/**
 * Attempts to estimate fees payable to the LSP for a zero conf channel
 * @param {string} bolt11
 * @param {string} fee_id
 * @param {boolean} simpleTaproot
 * @returns {string}
 */
export const getLspWrappedInvoice = async ({
  bolt11,
  fee_id,
}: LspWrappedRequest): Promise<Result<string>> => {
  try {
    const response = await fetch(`${LSP_API}/proposal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bolt11: bolt11,
        fee_id: fee_id,
      }),
    });
    const { jit_bolt11 } = await response.json();

    return ok(jit_bolt11);
  } catch (e) {
    showErrorBanner({
      message: e.message,
    });

    // return err(e);
  }
};
