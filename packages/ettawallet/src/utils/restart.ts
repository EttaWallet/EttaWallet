import { Platform } from 'react-native';
import RNRestart from 'react-native-restart';
import Logger from '../utils/logger';

export const RESTART_APP_I18N_KEY =
  Platform.OS === 'android' ? 'restartApp' : 'quitApp';

export const restartApp = () => {
  Logger.info('utils/AppRestart/restartApp', 'Restarting app');
  // Immediately reload the React Native Bundle
  RNRestart.Restart();
};
