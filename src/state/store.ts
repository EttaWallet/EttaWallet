import { createStore, persist } from 'easy-peasy';
import rootModel, { RootModelType } from './models';
import AsyncStorage from '@react-native-async-storage/async-storage';
import mmkvStorage from '../storage/disk';

let storeEnhancers = [];

if (__DEV__) {
  const reactotron = require('../../reactotron-config').default;
  reactotron.initiate();
  storeEnhancers.push(reactotron.createEnhancer());
}

const store = createStore<RootModelType>(
  persist(rootModel, {
    storage: mmkvStorage,
  }),
  {
    enhancers: [...storeEnhancers],
  }
);

export default store;
