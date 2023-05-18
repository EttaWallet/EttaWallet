import { MMKV } from 'react-native-mmkv';
import { initializeMMKVFlipper } from 'react-native-mmkv-flipper-plugin';

export const storage = new MMKV();

if (__DEV__) {
  initializeMMKVFlipper({ default: storage });
}

export enum StorageItem {
  navState = 'navState',
  buildNumber = 'buildNumber',
  versionNumber = 'versionNumber',
  pinCache = 'pinCache',
  ldkNodeId = 'ldkNodeId',
}

const mmkvStorage = {
  getItem<T>(key: StorageItem): T {
    const value = storage.getString(key);
    return value ? JSON.parse(value) || null : null;
  },
  setItem<T>(key: StorageItem, value: T) {
    storage.set(key, JSON.stringify(value));
  },
  removeItem(key: StorageItem) {
    storage.delete(key);
  },
  getAllItems() {
    const keys = storage.getAllKeys();
    return keys;
  },
  clearStorage() {
    storage.clearAll();
  },
};

export default mmkvStorage;
