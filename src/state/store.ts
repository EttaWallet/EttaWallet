import { createStore, persist } from 'easy-peasy';
import rootModel, { RootModelType } from './models';
import mmkvStorage from '../storage/disk';

// There might be an issue causing `setItem` not being called correctly
// for iOS devices using React Native. The solution for this is currently
// to remove the implemenation of `requestIdleCallback`.
// Read this issue for more information: https://github.com/ctrlplusb/easy-peasy/issues/599
window.requestIdleCallback = null!;

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
