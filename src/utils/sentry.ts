import * as Sentry from '@sentry/react-native';
import DeviceInfo from 'react-native-device-info';
import { SENTRY_DSN, SENTRY_ENABLED } from '../../config';
import Logger from './logger';

const TAG = 'sentry/Sentry';

// Set this to true, if you want to test Sentry on dev builds
// Set tracesSampleRate: 1 to capture all events for testing performance metrics in Sentry
export const sentryRoutingInstrumentation = new Sentry.ReactNavigationInstrumentation();

export function* initializeSentry() {
  if (!SENTRY_ENABLED) {
    Logger.info(TAG, 'Sentry not enabled');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: DeviceInfo.getBundleId(),
    enableAutoSessionTracking: true,
    integrations: [
      new Sentry.ReactNativeTracing({
        routingInstrumentation: sentryRoutingInstrumentation,
      }),
    ],
  });

  Logger.info(TAG, 'installSentry', 'Sentry installation complete');
}
