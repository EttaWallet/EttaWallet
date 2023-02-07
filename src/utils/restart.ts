import RNRestart from 'react-native-restart';
import Logger from './logger';

export const restartApp = () => {
  Logger.info('utils/restartApp', 'Restarting app');
  // Immediately reload the React Native Bundle
  RNRestart.Restart();
};
