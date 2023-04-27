/* eslint-disable @typescript-eslint/no-unused-vars */
import { Action, action, Thunk, thunk } from 'easy-peasy';
import { TLightningNodeVersion, TLightningPayment, TOpenChannelIds } from '../../utils/types';
import { TChannel, TInvoice } from '@synonymdev/react-native-ldk';
import { startLightning } from '../../utils/lightning/helpers';
import logger from '../../utils/logger';

const TAG = 'LightningStore';

// @TODO: add translatable strings to error and success messages

export interface LightningNodeModelType {
  nodeId: string | null;
  nodeStarted: boolean;
  ldkVersion: TLightningNodeVersion;
  channels: { [key: string]: TChannel };
  openChannelIds: TOpenChannelIds;
  invoices: TInvoice[];
  payments: { [key: string]: TLightningPayment };
  peers: string[];
  claimableBalance: number;
  setNodeId: Action<LightningNodeModelType, string>;
  setNodeStarted: Action<LightningNodeModelType, boolean>;
  startLdk: Thunk<LightningNodeModelType>;
  setLdkVersion: Action<LightningNodeModelType, TLightningNodeVersion>;
  addInvoice: Action<LightningNodeModelType, TInvoice>;
  updateInvoices: Action<LightningNodeModelType, { index: number; invoice: TInvoice }>;
  removeExpiredInvoices: Action<LightningNodeModelType, TInvoice>;
}

export const lightningModel: LightningNodeModelType = {
  nodeStarted: false,
  nodeId: null,
  ldkVersion: {
    ldk: '',
    c_bindings: '',
  },
  channels: {},
  invoices: [],
  payments: {},
  peers: [],
  openChannelIds: [],
  claimableBalance: 0,

  setNodeId: action((state, payload) => {
    state.nodeId = payload;
  }),
  setLdkVersion: action((state, payload) => {
    state.ldkVersion = payload;
  }),
  startLdk: thunk(async (actions, _, { getState }) => {
    try {
      await startLightning({
        selectedNetwork: 'bitcoinTestnet', // defaulting to testnet for now
      });
    } catch (error) {
      logger.error(TAG, '@startLdk', error.message);
    }
  }),
  setNodeStarted: action((state, payload) => {
    state.nodeStarted = payload;
  }),
  addInvoice: action((state, payload) => {
    state.invoices.push(payload);
  }),
  updateInvoices: action((state, payload) => {
    state.invoices[payload.index] = payload.invoice;
  }),
  removeExpiredInvoices: action((state) => {
    // get number of secs since unix epoch at this time
    const nowInSecs = Math.floor(Date.now() / 1000);
    // filter out current invoices
    state.invoices = state.invoices.filter(
      (invoice) => invoice.timestamp + invoice.expiry_time > nowInSecs
    );
  }),
  // open channel with LSP and receive inbound liquidity
};
