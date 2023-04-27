import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Retrieves data from local storage.
 * @param {string} key
 * @returns {Promise<string>}
 */
export const getItem = async (key = ''): Promise<any> => {
  try {
    return await AsyncStorage.getItem(key);
  } catch (e) {
    console.log(e);
    return '';
  }
};

/**
 * Saves data to local storage.
 * @param {string} key
 * @param {string} value
 * @returns {Promise<void>}
 */
export const setItem = async (key = '', value = ''): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (e) {
    console.log(e);
  }
};
