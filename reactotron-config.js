// reactotron-config.js

import Reactotron from 'reactotron-react-native';
import { reactotronRedux } from 'reactotron-redux';
import ReactotronFlipper from 'reactotron-react-native/dist/flipper';

const reactotronConfig = {
  initiate: () => {
    Reactotron.configure({
      createSocket: (path) => new ReactotronFlipper(path),
    })
      .useReactNative()
      .use(reactotronRedux())
      .connect();
  },
  createEnhancer: () => Reactotron.createEnhancer(),
};

export default reactotronConfig;
