import { TAvailableNetworks } from '../../utils/networks';
import { ICustomElectrumPeer, IWalletItem } from '../../utils/types';

// const TAG = 'SettingsStore';

export const publicElectrumPeers: Record<TAvailableNetworks, ICustomElectrumPeer[]> = {
  bitcoin: [
    {
      host: '',
      ssl: 0,
      tcp: 0,
      protocol: 'ssl',
    },
  ],
  bitcoinTestnet: [
    {
      host: 'tn.not.fyi',
      ssl: 55002,
      tcp: 55002,
      protocol: 'ssl',
    },
    {
      host: 'testnet.aranguren.org',
      ssl: 51002,
      tcp: 51001,
      protocol: 'ssl',
    },
  ],
  bitcoinRegtest: [
    {
      host: '',
      ssl: 0,
      tcp: 0,
      protocol: 'ssl',
    },
  ],
};

export type TCustomElectrumPeers = IWalletItem<ICustomElectrumPeer[]>;

export interface SettingsModelType {
  customElectrumPeers: TCustomElectrumPeers;
}

export const settingsModel: SettingsModelType = {
  customElectrumPeers: publicElectrumPeers,
};
