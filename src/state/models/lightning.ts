/* eslint-disable @typescript-eslint/no-unused-vars */
import { Action, action, Thunk, thunk } from 'easy-peasy';
import {
  EPaymentType,
  NodeState,
  TLdkInvoice,
  TLightningNodeVersion,
  TLightningPayment,
} from '../../utils/types';
import { TChannel } from '@synonymdev/react-native-ldk';
import { startLightning } from '../../utils/lightning/helpers';
import logger from '../../utils/logger';
import { isLdkRunning, waitForLdk } from '../../ldk';

const TAG = 'LightningStore';

// @TODO: add translatable strings to error and success messages

export interface LightningNodeModelType {
  ldkState: NodeState;
  nodeId: string | null;
  nodeStarted: boolean;
  ldkVersion: TLightningNodeVersion;
  channels: { [key: string]: TChannel };
  openChannelIds: string[];
  invoices: TLdkInvoice[];
  payments: { [key: string]: TLightningPayment };
  peers: string[];
  claimableBalance: number;
  setNodeId: Action<LightningNodeModelType, string>;
  setNodeStarted: Action<LightningNodeModelType, boolean>;
  startLdk: Thunk<LightningNodeModelType>;
  setLdkState: Action<LightningNodeModelType, NodeState>;
  setLdkVersion: Action<LightningNodeModelType, TLightningNodeVersion>;
  addInvoice: Action<LightningNodeModelType, TLdkInvoice>;
  updateInvoice: Action<LightningNodeModelType, Partial<TLdkInvoice>>;
  removeInvoice: Action<LightningNodeModelType, string>;
  updateInvoices: Action<LightningNodeModelType, { index: number; invoice: TLdkInvoice }>;
  updateChannels: Action<LightningNodeModelType, Partial<LightningNodeModelType>>;
  updateClaimableBalance: Action<LightningNodeModelType, number>;
  removeExpiredInvoices: Action<LightningNodeModelType, TLdkInvoice[]>;
  addPayment: Action<LightningNodeModelType, TLightningPayment>;
  addPeer: Action<LightningNodeModelType, string>;
}

export const lightningModel: LightningNodeModelType = {
  ldkState: NodeState.OFFLINE,
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
        await startLightning({});
        // check for node ID
        await waitForLdk();
      }
    } catch (error) {
      logger.error(TAG, '@startLdk', error.message);
    }
  }),
  setLdkState: action((state, payload) => {
    state.ldkState = payload;
    if (payload === NodeState.COMPLETE) {
      state.nodeStarted = true;
    }
  }),
  setNodeStarted: action((state, payload) => {
    state.nodeStarted = payload;
  }),
  addInvoice: action((state, payload) => {
    state.invoices.push(payload);
  }),
  updateInvoice: action((state, payload) => {
    // updates invoice, usually tags, notes or contacts
    // state.invoices = state.invoices.map((invoice) =>
    //   invoice.payment_hash === payload.payment_hash ? { ...invoice, ...payload.data } : invoice
    // );
  }),
  removeInvoice: action((state, payload) => {
    const index = state.invoices.findIndex((invoice) => invoice.payment_hash === payload);
    if (index !== -1) {
      state.invoices.splice(index, 1);
    }
  }),
  updateInvoices: action((state, payload) => {
    state.invoices[payload.index] = payload.invoice;
  }),
  removeExpiredInvoices: action((state) => {
    // get number of secs since unix epoch at this time
    const nowInSecs = Math.floor(Date.now() / 1000);
    // keep only those invoices whose timestamp + expiry exceeds now in unix epoch
    state.invoices = state.invoices.filter(
      (invoice) => invoice.timestamp + invoice.expiry_time > nowInSecs
    );
  }),
  updateChannels: action((state, payload) => {
    state.channels = {
      ...state.channels,
      ...(payload?.channels ?? {}),
    };
    // check if channel already exists in openChannelIDs array
    const newChannelIds = payload?.openChannelIds ?? [];
    const uniqueIds = newChannelIds.filter((id) => !state.openChannelIds.includes(id));
    state.openChannelIds = [...state.openChannelIds, ...uniqueIds];
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
  addPeer: action((state, payload) => {
    state.peers.push(payload);
  }),
};
