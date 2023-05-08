/* eslint-disable @typescript-eslint/no-unused-vars */
import { Action, action, Thunk, thunk } from 'easy-peasy';
import {
  EPaymentType,
  TLightningNodeVersion,
  TLightningPayment,
  TOpenChannelIds,
} from '../../utils/types';
import { TChannel, TInvoice } from '@synonymdev/react-native-ldk';
import { startLightning } from '../../utils/lightning/helpers';
import logger from '../../utils/logger';
import { isLdkRunning, waitForLdk } from '../../ldk';

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
  removeInvoice: Action<LightningNodeModelType, TInvoice>;
  updateInvoices: Action<LightningNodeModelType, { index: number; invoice: TInvoice }>;
  updateChannels: Action<LightningNodeModelType, { [key: string]: TChannel }>;
  updateOpenChannels: Action<LightningNodeModelType, string[]>;
  updateClaimableBalance: Action<LightningNodeModelType, number>;
  removeExpiredInvoices: Action<LightningNodeModelType, TInvoice[]>;
  addPayment: Action<LightningNodeModelType, TLightningPayment>;
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
  startLdk: thunk(async () => {
    try {
      // check if LDK is up
      const isLdkUp = await isLdkRunning();
      // if nuh, start all lightning services (testnet)
      if (!isLdkUp) {
        await startLightning({ selectedNetwork: 'bitcoinTestnet' });
        // check for node ID
        await waitForLdk();
      }
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
  removeInvoice: action((state, payload) => {
    const invoices = state.invoices;
    // create new invoice array with the invoice in payload removed
    const newInvoices = invoices.filter((i) => i.payment_hash !== payload.payment_hash);
    state.invoices = newInvoices;
  }),
  updateInvoices: action((state, payload) => {
    state.invoices[payload.index] = payload.invoice;
  }),
  removeExpiredInvoices: action((state, payload) => {
    state.invoices = payload;
  }),
  updateChannels: action((state, payload) => {
    state.channels = {
      ...state.channels,
      ...payload,
    };
  }),
  updateOpenChannels: action((state, payload) => {
    state.openChannelIds = {
      ...state.openChannelIds,
      ...payload,
    };
  }),
  updateClaimableBalance: action((state, payload) => {
    state.claimableBalance = payload;
  }),
  addPayment: action((state, payload) => {
    state.payments = {
      ...state.payments,
      [payload?.invoice.payment_hash]: {
        invoice: payload?.invoice,
        type:
          // if payee_pubkey matches the nodeId, save as received payment
          payload?.invoice.payee_pub_key === state.nodeId
            ? EPaymentType.received
            : EPaymentType.sent,
      },
    };
  }),
};
