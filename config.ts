import { stringToBoolean } from './src/utils/helpers';
import Config from 'react-native-config';

export const DEFAULT_APP_LANGUAGE = 'en-US';

export const APP_NAME = 'EttaWallet';

export const DEV_RESTORE_NAV_STATE_ON_RELOAD = stringToBoolean(
  Config.DEV_RESTORE_NAV_STATE_ON_RELOAD || 'false'
);
