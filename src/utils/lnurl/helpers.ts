import queryString from 'query-string';
import { Result, err, ok } from '../result';

export const callRemote = async (url: string): Promise<Result<string>> => {
  const fetchRes = await fetch(url);

  const body: { status: string; reason: string } = await fetchRes.json();

  if (!body) {
    return err('Unknown HTTP error');
  }

  if (body?.status?.toUpperCase() === 'OK') {
    return ok('Authenticated');
  }

  if (body?.status?.toUpperCase() === 'ERROR') {
    return err(body.reason);
  }

  return err('Unknown error');
};

/**
 * Add query params to given url
 * @param url
 * @param params
 * @returns {string}
 */
export const addUrlParams = (
  url: string,
  params: queryString.StringifiableRecord,
  options?: queryString.StringifyOptions
): string => {
  const parsed = queryString.parseUrl(url, options);
  Object.entries(params).forEach(([k, v]) => {
    parsed.query[k] = String(v);
  });
  return queryString.stringifyUrl(parsed, options);
};

/**
 * Random nonce to prevent URL's from caching
 * @returns {string}
 */
export const randomNonce = (): string => {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 8; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};
