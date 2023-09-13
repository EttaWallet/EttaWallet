// declare module 'rn-electrum-client/helpers';

import { TAvailableNetworks } from './src/utils/networks';

declare module 'net' {
  import TcpSockets from 'react-native-tcp-socket';
  export = TcpSockets;
}

declare module 'tls' {
  import TcpSockets from 'react-native-tcp-socket';
  export const Server = TcpSockets.TLSServer;
  export const TLSSocket = TcpSockets.TLSSocket;
  export const connect = TcpSockets.connectTLS;
  export const createServer = TcpSockets.createTLSServer;
}

declare module 'react-native-config' {
  export interface NativeConfig {
    DEV_RESTORE_NAV_STATE_ON_RELOAD?: string;
    DEFAULT_NETWORK: TAvailableNetworks;
    LSP_TESTNET_PUBKEY?: string;
    LSP_TESTNET_NODE_URI?: string;
    LSP_API_TESTNET?: string;
    LSP_FEE_API_TESTNET?: string;
    TESTNET_FAUCET_API?: string;
    TESTNET_FAUCET_MACAROON?: string;
    LSP_MAINNET_PUBKEY?: string;
    LSP_MAINNET_NODE_URI?: string;
    LSP_API_MAINNET?: string;
    LSP_FEE_API_MAINNET?: string;
    MAINNET_FAUCET_API?: string;
    MAINNET_FAUCET_MACAROON?: string;
  }

  export const Config: NativeConfig;
  export default Config;
}
