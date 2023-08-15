import { Action, action, Thunk, thunk } from 'easy-peasy';
import {
  EPaymentType,
  NodeState,
  TContact,
  TLightningNodeVersion,
  TLightningPayment,
  TModifyInvoice,
} from '../../utils/types';
import { TChannel, TInvoice } from '@synonymdev/react-native-ldk';
import { startLightning } from '../../utils/lightning/helpers';
import logger from '../../utils/logger';
import { isLdkRunning, waitForLdk } from '../../ldk';

const TAG = 'LightningStore';

/**
 * Appends any new payments while leaving known ones
 * @param {TLightningPayment[]} oldPayments
 * @param {TLightningPayment[]} newPayments
 * @returns {TLightningPayment[]}
 */
export const mergePaymentActivity = (
  oldPayments: TLightningPayment[],
  newPayments: TLightningPayment[]
): TLightningPayment[] => {
  let sortedItems;
  try {
    const newIds = new Map(newPayments.map((item) => [`${item.payment_hash}`, item]));
    const reduced = oldPayments.filter((item) => !newIds.has(`${item.payment_hash}`));
    const mergedItems = reduced.concat(newPayments);

    // Check if sorting is necessary (This is faster than performing the sort every time)
    let needsSorting = false;
    for (let i = 1; i < mergedItems.length; i++) {
      if (mergedItems[i].unix_timestamp! > mergedItems[i - 1].unix_timestamp!) {
        needsSorting = true;
        break;
      }
    }

    if (!needsSorting) {
      return mergedItems;
    }

    // 'Received' should be before 'Sent' if they have same timestamp
    const sortOrder = [EPaymentType.received, EPaymentType.sent];
    sortedItems = mergedItems.sort(
      (a, b) =>
        b.unix_timestamp! - a.unix_timestamp! ||
        sortOrder.indexOf(b.type!) - sortOrder.indexOf(a.type!)
    );
  } catch (e) {
    console.log('errorMergingPaymentActivity: ', e.message);
  }

  return sortedItems;
};

export interface LightningNodeModelType {
  ldkState: NodeState;
  nodeId: string | null;
  nodeStarted: boolean;
  ldkVersion: TLightningNodeVersion;
  channels: { [key: string]: TChannel };
  openChannelIds: string[];
  invoices: TInvoice[];
  payments: TLightningPayment[];
  peers: string[];
  contacts: TContact[];
  claimableBalance: number;
  maxReceivable: number;
  defaultPRDescription: string;
  defaultPRExpiry: number;
  setDefaultPRDescription: Action<LightningNodeModelType, string>;
  setDefaultPRExpiry: Action<LightningNodeModelType, number>;
  setNodeId: Action<LightningNodeModelType, string>;
  startLdk: Thunk<LightningNodeModelType>;
  setLdkState: Action<LightningNodeModelType, NodeState>;
  setLdkVersion: Action<LightningNodeModelType, TLightningNodeVersion>;
  addInvoice: Action<LightningNodeModelType, TInvoice>;
  updateInvoice: Action<LightningNodeModelType, TModifyInvoice>;
  removeInvoice: Action<LightningNodeModelType, string>;
  updateInvoices: Action<LightningNodeModelType, { index: number; invoice: TInvoice }>;
  updateChannels: Action<LightningNodeModelType, Partial<LightningNodeModelType>>;
  updateClaimableBalance: Action<LightningNodeModelType, number>;
  setMaxReceivable: Action<LightningNodeModelType, number>;
  removeExpiredInvoices: Action<LightningNodeModelType, TInvoice[]>;
  addPayment: Action<LightningNodeModelType, TLightningPayment>;
  addPayments: Action<LightningNodeModelType, TLightningPayment[]>;
  updatePayment: Action<
    LightningNodeModelType,
    { payment_hash: string; updates: Partial<TLightningPayment> }
  >;
  addPeer: Action<LightningNodeModelType, string>;
  addContact: Action<LightningNodeModelType, TContact>;
  updateContact: Action<LightningNodeModelType, { contactId: string; updatedContact: TContact }>;
  deleteContact: Action<LightningNodeModelType, string>;
  deleteContactAddress: Action<LightningNodeModelType, { contactId: string; addressId: string }>;
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
  payments: [],
  peers: [],
  contacts: [],
  openChannelIds: [],
  claimableBalance: 0,
  maxReceivable: 0,
  defaultPRDescription: 'Invoice from EttaWallet',
  defaultPRExpiry: 604800, // 1 week
  setDefaultPRDescription: action((state, payload) => {
    state.defaultPRDescription = payload;
  }),
  setDefaultPRExpiry: action((state, payload) => {
    state.defaultPRExpiry = payload;
  }),
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
  addInvoice: action((state, payload) => {
    state.invoices.push(payload);
  }),
  updateInvoice: action((state, payload) => {
    // updates invoice, usually tags, notes or contacts
    state.invoices = state.invoices.map((invoice) =>
      invoice.payment_hash === payload?.payment_hash
        ? { ...invoice, to_str: payload?.modified_request }
        : invoice
    );
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
  setMaxReceivable: action((state, payload) => {
    state.maxReceivable = payload;
  }),
  addPayment: action((state, payload) => {
    state.payments.push(payload);
  }),
  addPayments: action((state, payload) => {
    const mergedItems = mergePaymentActivity(state.payments, payload);
    // Loop through the new payments
    mergedItems.forEach((newPayment) => {
      // Find an existing payment with matching txId
      const existingPaymentIndex = state.payments.findIndex(
        (payment) => payment.payment_hash === newPayment.payment_hash
      );

      if (existingPaymentIndex !== -1) {
        // If an existing payment with matching txId is found, update its properties
        state.payments[existingPaymentIndex] = {
          ...state.payments[existingPaymentIndex],
          ...newPayment,
        };
      } else {
        // If no match is found, add the new payment to the array
        state.payments.push(newPayment);
      }
    });
  }),
  updatePayment: action((state, payload) => {
    const { payment_hash, updates } = payload;
    // Find the payment by txid
    const paymentToUpdate = state.payments.find((payment) => payment.payment_hash === payment_hash);

    // If the payment is found, update its properties
    if (paymentToUpdate) {
      Object.assign(paymentToUpdate, updates);
    }
  }),
  addPeer: action((state, payload) => {
    state.peers.push(payload);
  }),
  addContact: action((state, payload) => {
    state.contacts.push(payload);
  }),
  updateContact: action((state, payload) => {
    const { contactId, updatedContact } = payload;
    if (contactId && updatedContact) {
      state.contacts = state.contacts.map((contact) => {
        if (contact.id === contactId) {
          // update identifiers
          const mergedIdentifiers = updatedContact.identifiers
            ? [...(contact.identifiers || []), ...updatedContact.identifiers]
            : contact.identifiers || [];
          return {
            ...contact,
            ...updatedContact,
            identifiers: mergedIdentifiers,
          };
        }
        return contact;
      });
    }
  }),
  deleteContact: action((state, payload) => {
    const index = state.contacts.findIndex((contact) => contact.id === payload);
    if (index !== -1) {
      state.contacts.splice(index, 1);
    }
  }),
  deleteContactAddress: action((state, payload) => {
    const { contactId, addressId } = payload;
    state.contacts = state.contacts.map((contact) => {
      if (contact.id === contactId) {
        const updatedIdentifiers = contact.identifiers!.filter(
          (identity) => identity.id !== addressId
        );
        return { ...contact, identifiers: updatedIdentifiers };
      }
      return contact;
    });

    state.contacts = state.contacts.map((contact) => {
      const updatedIdentifiers = contact.identifiers!.filter(
        (identity) => identity.id !== addressId
      );
      return { ...contact, items: updatedIdentifiers };
    });
  }),
};
