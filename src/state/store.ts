import { createStore } from 'easy-peasy';
import rootModel, { RootModelType } from './models';

let storeEnhancers = [];

if (__DEV__) {
  const reactotron = require('../../reactotron-config').default;
  reactotron.initiate();
  storeEnhancers.push(reactotron.createEnhancer());
}

const store = createStore<RootModelType>(rootModel, {
  enhancers: [...storeEnhancers],
});

export default store;
