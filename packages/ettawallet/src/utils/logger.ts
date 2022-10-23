/* eslint-disable no-console */
import * as Sentry from '@sentry/react-native';
import { SeverityLevel } from '@sentry/types';
import Toast from 'react-native-simple-toast';

export enum LoggerLevel {
  Debug = 3,
  Info = 2,
  Warn = 1,
  Error = 0,
}

const DEFAULT_SENTRY_NETWORK_ERRORS = [
  'network request failed',
  'The network connection was lost',
];

const configLoggerLevels: { [key: string]: LoggerLevel } = {
  debug: LoggerLevel.Debug,
  info: LoggerLevel.Info,
  warn: LoggerLevel.Warn,
  error: LoggerLevel.Error,
};

const LOGGER_LEVEL = LoggerLevel.Debug;
//   configLoggerLevels[Config.LOGGER_LEVEL] || LoggerLevel.Debug;

class Logger {
  isNetworkConnected: boolean;
  networkErrors: string[];
  level: LoggerLevel;

  constructor(
    { level }: { level: LoggerLevel } = { level: LoggerLevel.Debug }
  ) {
    this.level = level;
    this.isNetworkConnected = true;
    this.networkErrors = DEFAULT_SENTRY_NETWORK_ERRORS || [];
  }

  /**
   * Note: A good `tag` will consist of filename followed by the method name.
   * For example, `CeloAnalytics/track`
   * In case the file name is ambigous, add the parent directory name to it.
   * For example, `send/actions/refreshGasPrice` since there are many actions.ts files.
   */
  debug = (tag: string, ...messages: any[]) => {
    if (this.level < LoggerLevel.Debug) {
      return;
    }
    console.debug(`${tag}/${messages.join(', ')}`);
  };

  info = (tag: string, ...messages: any[]) => {
    if (this.level < LoggerLevel.Info) {
      return;
    }
    console.info(`${tag}/${messages.join(', ')}`);
  };

  warn = (tag: string, ...messages: any[]) => {
    if (this.level < LoggerLevel.Warn) {
      return;
    }
    // console.warn would display yellow box, therefore, we will log to console.info instead.
    console.info(`${tag}/${messages.join(', ')}`);
  };

  error = (
    tag: string,
    message: string,
    error?: Error,
    shouldSanitizeError = false,
    valueToPurge?: string
  ) => {
    // console.error would display red box, therefore, we will log to console.info instead.
    const sanitizedError =
      error && shouldSanitizeError
        ? this.sanitizeError(error, valueToPurge)
        : error;
    const errorMsg = this.getErrorMessage(sanitizedError);
    const isNetworkError = this.networkErrors.some(
      networkError =>
        message.toString().toLowerCase().includes(networkError) ||
        errorMsg.toLowerCase().includes(networkError)
    );

    // prevent genuine network errors from being sent to Sentry
    if (!isNetworkError || (this.isNetworkConnected && isNetworkError)) {
      const captureContext = {
        level: 'error' as SeverityLevel,
        extra: {
          tag,
          // TODO: the toString() can be removed after upgrading TS to v4. It is
          // needed for now because the try/catch errors are typed as any, and we
          // don't get warnings from calling this function like
          // `Logger.error(TAG, error)`
          message: message?.toString(),
          errorMsg,
          source: 'Logger.error',
          networkConnected: this.isNetworkConnected,
        },
      };

      // If we don't have an error object call Sentry.captureMessage. That will
      // group events without an error by message (accounting for some parameters
      // in the message). Sentry.captureException sentry will group all events
      // without an error object together.
      if (error) {
        Sentry.captureException(error, captureContext);
      } else {
        Sentry.captureMessage(message, captureContext);
      }
    }
    console.info(
      `${tag} :: ${message} :: ${errorMsg} :: network connected ${this.isNetworkConnected}`
    );
    if (__DEV__) {
      console.info(console.trace());
    }
  };

  setIsNetworkConnected = (isConnected: boolean) => {
    this.isNetworkConnected = isConnected;
  };

  setNetworkErrors = (errors: string[]) => {
    this.networkErrors = errors;
  };

  // TODO: see what to do with this on iOS since there's not native toast
  showMessage = (message: string) => {
    Toast.showWithGravity(message, Toast.SHORT, Toast.BOTTOM);
    this.debug('Toast', message);
  };

  showError = (error: string | Error) => {
    const errorMsg = this.getErrorMessage(error);
    Toast.showWithGravity(errorMsg, Toast.SHORT, Toast.BOTTOM);
    this.error('Toast', errorMsg);
  };

  getErrorMessage = (error?: string | Error) => {
    if (!error) {
      return '';
    }
    if (typeof error === 'string') {
      return error;
    }
    let errorMsg = error.message || error.name || 'unknown';
    if (error.stack) {
      errorMsg += ' in ' + error.stack.substring(0, 100);
    }
    return errorMsg;
  };

  sanitizeError = (error: Error, valueToPurge?: string) => {
    const message = this.getErrorMessage(error).toLowerCase();

    if (
      message.includes('password') ||
      message.includes('key') ||
      message.includes('pin')
    ) {
      return new Error('Error message hidden for privacy');
    }

    if (valueToPurge) {
      return new Error(
        message.replace(new RegExp(valueToPurge, 'g'), '<purged>')
      );
    }

    return error;
  };
}

export default new Logger({ level: LOGGER_LEVEL });
