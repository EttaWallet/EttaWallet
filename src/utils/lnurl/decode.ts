import {
  getParams,
  LNURLAuthParams,
  LNURLChannelParams,
  LNURLPayParams,
  LNURLResponse,
  LNURLWithdrawParams,
} from 'js-lnurl';
import { err, ok, Result } from '../result';
import { TLNURLPayCallback, TLNURLWithdrawCallback } from '../types';
import { addUrlParams, randomNonce } from './helpers';

/**
 * Parses LNURL
 * @param url
 * @returns {Promise<Err<unknown> | Ok<LNURLResponse | LNURLAuthParams | LNURLPayParams>>}
 */
export const getLNURLParams = async (
  url: string
): Promise<
  Result<
    LNURLAuthParams | LNURLWithdrawParams | LNURLResponse | LNURLChannelParams | LNURLPayParams
  >
> => {
  try {
    const params = await getParams(url);

    const status = 'status' in params ? params.status : '';
    if (status === 'ERROR') {
      const reason = 'reason' in params ? params.reason : '';
      if (reason) {
        return err(reason);
      }

      return err('Unknown error parsing LNURL params');
    }

    const tag = 'tag' in params ? params.tag : '';

    switch (tag) {
      case 'withdrawRequest':
      case 'login':
      case 'channelRequest':
      case 'payRequest': {
        return ok(params);
      }
    }

    return err(`${tag} not yet implemented`);
  } catch (e) {
    return err(e);
  }
};

/**
 * Creates a pay request URL to call to get the invoice from
 * the remote node
 * @param callback
 * @param sats
 * @param comment
 * @param fromNodes
 */
export const createPayRequestUrl = ({
  params: { callback },
  milliSats,
  comment,
  fromNodes,
}: TLNURLPayCallback): Result<string> => {
  const nonce = randomNonce();

  return ok(
    addUrlParams(
      callback,
      { amount: milliSats, nonce, comment, fromnodes: fromNodes },
      { arrayFormat: 'comma' }
    )
  );
};

/**
 * Creates a withdraw callback URL once user's invoice
 * is ready to be paid
 * @param k1
 * @param callback
 * @param invoice
 * @return {Ok<string>}
 */
export const createWithdrawCallbackUrl = ({
  params: { k1, callback },
  paymentRequest,
}: TLNURLWithdrawCallback): Result<string> => {
  return ok(addUrlParams(callback, { k1, pr: paymentRequest }));
};
