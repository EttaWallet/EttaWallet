import { stringToBoolean } from './src/utils/helpers';
import Config from 'react-native-config';

export const DEFAULT_APP_LANGUAGE = 'en-US';

export const APP_NAME = 'EttaWallet';

export const DEV_RESTORE_NAV_STATE_ON_RELOAD = stringToBoolean(
  Config.DEV_RESTORE_NAV_STATE_ON_RELOAD || 'false'
);

export const SENTRY_ENABLED = stringToBoolean(Config.SENTRY_ENABLED || 'false');

export const SENTRY_DSN =
  'https://18b58638f56746e2971e78a145cff90d@o631664.ingest.sentry.io/4504051403849728';
