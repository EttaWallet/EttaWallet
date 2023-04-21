// reactotron-config.js

import Reactotron from 'reactotron-react-native';
import { reactotronRedux } from 'reactotron-redux';
import ReactotronFlipper from 'reactotron-react-native/dist/flipper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const reactotronConfig = {
  initiate: () => {
    Reactotron.configure({
      createSocket: (path) => new ReactotronFlipper(path),
    })
      .useReactNative()
      .use(reactotronRedux())
      .setAsyncStorageHandler(AsyncStorage)
      .connect();
  },
  createEnhancer: () => Reactotron.createEnhancer(),
};

export default reactotronConfig;
