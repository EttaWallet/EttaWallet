import { stringToBoolean } from './src/utils/helpers';
import Config from 'react-native-config';

export const DEFAULT_APP_LANGUAGE = 'en-US';

export const APP_NAME = 'EttaWallet';

export const APP_STORE_ID = Config.APP_STORE_ID;

export const DEV_RESTORE_NAV_STATE_ON_RELOAD = stringToBoolean(
  Config.DEV_RESTORE_NAV_STATE_ON_RELOAD || 'false'
);

export const FAQ_LINK = 'https://ettawallet.app/faq';

export const LSP_PUBKEY = Config.LSP_TESTNET_PUBKEY;
export const LSP_API = Config.LSP_API_TESTNET;
export const LSP_FEE_ESTIMATE_API = Config.LSP_FEE_API_TESTNET;

export const ALERTS_DURATION = 2000;

export const EXCHANGE_RATE_UPDATE_INTERVAL = 12 * 3600 * 1000; // 12 hours

export const DEFAULT_NUMBER_OF_DECIMALS = 2;

export const CLIPBOARD_CHECK_INTERVAL = 1000; // 1sec

export const MEMPOOL_GET_BLOCK_TIP_HEIGHT = 'https://mempool.space/testnet/api/blocks/tip/height';

export const CHANNEL_OPEN_DEPOSIT_SATS = 5000;

export const FAUCET_MACAROON = Config.TESTNET_FAUCET_MACAROON;
export const FAUCET_API = Config.TESTNET_FAUCET_API;
