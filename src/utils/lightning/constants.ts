import { TAvailableNetworks } from '@synonymdev/react-native-ldk';

export const selectedNetwork: TAvailableNetworks = 'bitcoinTestnet';

//Lightning Peer Info
export const peers = {
  // //lnd
  // alice: {
  // 	pubKey:
  // 		'037b7977cb2db3bd27a2b1c8811e86f43e2ad8918fa942169cb5196c05034d4206',
  // 	address: '127.0.0.1',
  // 	port: 9735,
  // },
  // // lnd
  // bob: {
  // 	pubKey:
  // 		'03c3550c98eed2e435dea0b64457c628ecb087c9e5d819b85054beff5146c0bddc',
  // 	address: '127.0.0.1',
  // 	port: 9736,
  // },
  // voltage lsp for zero-conf channel
  lsp: {
    pubKey: '025804d4431ad05b06a1a1ee41f22fefeb8ce800b0be3a92ff3b9f594a263da34e',
    address: '44.228.24.253',
    port: 9735,
  },
};

export const customPeers = {
  bitcoin: [],
  bitcoinTestnet: [
    {
      host: 'testnet.aranguren.org',
      ssl: 51002,
      tcp: 51001,
      protocol: 'tcp',
    },
  ],
  bitcoinRegtest: [
    {
      host: '35.233.47.252',
      ssl: 18484,
      tcp: 18483,
      protocol: 'tcp',
    },
  ],
};
