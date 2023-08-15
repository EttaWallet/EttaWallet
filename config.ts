import { stringToBoolean } from './src/utils/helpers';
import Config from 'react-native-config';

export const DEFAULT_APP_LANGUAGE = 'en-US';

export const APP_NAME = 'EttaWallet';

export const APP_STORE_ID = Config.APP_STORE_ID;

export const DEV_RESTORE_NAV_STATE_ON_RELOAD = stringToBoolean(
  Config.DEV_RESTORE_NAV_STATE_ON_RELOAD || 'false'
);

export const FAQ_LINK = 'https://ettawallet.app/faq';

export const VOLTAGE_LSP_PUBKEY =
  '025804d4431ad05b06a1a1ee41f22fefeb8ce800b0be3a92ff3b9f594a263da34e';
export const VOLTAGE_LSP_API_TESTNET = 'https://testnet-lsp.voltageapi.com/api/v1/proposal';
export const VOLTAGE_LSP_FEE_ESTIMATE_API = 'https://testnet-lsp.voltageapi.com/api/v1/fee';

export const ALERTS_DURATION = 2000;

export const EXCHANGE_RATE_UPDATE_INTERVAL = 12 * 3600 * 1000; // 12 hours

export const DEFAULT_NUMBER_OF_DECIMALS = 2;

export const CLIPBOARD_CHECK_INTERVAL = 1000; // 1sec

export const MEMPOOL_GET_BLOCK_TIP_HEIGHT = 'https://mempool.space/testnet/api/blocks/tip/height';
