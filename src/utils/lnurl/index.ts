import { Result, err, ok } from '../result';
import { TLNURLPayCallback } from '../types';
import { LNURLPayResult, LNURLWithdrawParams } from 'js-lnurl';
import { createPayRequestUrl, createWithdrawCallbackUrl } from './decode';
import { callRemote } from './helpers';

const callLnurlPay = async (url: string): Promise<Result<LNURLPayResult>> => {
  const fetchRes = await fetch(url);

  const body: { status: string; reason: string } & LNURLPayResult = await fetchRes.json();

  if (!body) {
    return err('Unknown HTTP error');
  }

  if (body?.status?.toUpperCase() === 'ERROR') {
    return err(body.reason);
  }

  if (!(typeof body.pr === 'string') || !Array.isArray(body.routes)) {
    return err('LNURL pay response is invalid');
  }

  return ok(body);
};

/**
 * Calls LNURL-PAY callback with the details the
 * receiver should use in their invoice
 * @param details
 * @return {Promise<Err<unknown> | Ok<string> | Err<string>>}
 */
export const lnurlPay = async (details: TLNURLPayCallback): Promise<Result<LNURLPayResult>> => {
  const callbackUrlRes = createPayRequestUrl(details);
  if (callbackUrlRes.isErr()) {
    return err(callbackUrlRes.error);
  }

  return await callLnurlPay(callbackUrlRes.value);
  // TODO verify that h tag in provided invoice is a hash of metadata string converted to byte array in UTF-8 encoding.
  // TODO verify that amount in provided invoice equals an amount previously specified by user.
};

/**
 * Calls LNURL-WITHDRAW callback with newly created invoice.
 * Url needs to be decoded first so invoice can be created with correct amounts.
 * @param params
 * @param paymentRequest
 * @return {Promise<Err<unknown> | Ok<string> | Err<string>>}
 */
export const lnurlWithdraw = async (
  params: LNURLWithdrawParams,
  paymentRequest: string
): Promise<Result<string>> => {
  const callbackUrlRes = createWithdrawCallbackUrl({
    params,
    paymentRequest,
  });
  if (callbackUrlRes.isErr()) {
    return err(callbackUrlRes.error);
  }

  return await callRemote(callbackUrlRes.value);
};
