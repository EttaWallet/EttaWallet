import mmkvStorage, { StorageItem } from '../../storage/disk';
import { getPasswordHashForPin } from './auth';

const CACHE_TIMEOUT = 300000; // 5 minutes

export interface SecretCache {
  [account: string]: {
    timestamp: number | null;
    secret: string | null;
  };
}
let pinCache: SecretCache = {};

function getCachedValue(cache: SecretCache, account: string) {
  const value = cache[account];
  if (value && value.secret && value.timestamp && Date.now() - value.timestamp < CACHE_TIMEOUT) {
    return value.secret;
  } else {
    // Clear values in cache when they're expired
    cache[account] = { timestamp: null, secret: null };
    return null;
  }
}

async function setCachedValue(cache: SecretCache, account: string, secret: string | null) {
  if (!cache[account]) {
    cache[account] = { timestamp: null, secret: null };
  }
  const hashedSecret = await getPasswordHashForPin(secret!);
  cache[account].timestamp = Date.now();
  cache[account].secret = hashedSecret;
  mmkvStorage.setItem(StorageItem.pinCache, cache);
}

export function getCachedPin(account: string) {
  return getCachedValue(pinCache, account);
}

export function setCachedPin(account: string, pin: string | null) {
  setCachedValue(pinCache, account, pin);
}

export function clearSecretCaches() {
  pinCache = {};
}
