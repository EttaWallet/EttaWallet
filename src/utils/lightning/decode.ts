import { TInvoice } from '@synonymdev/react-native-ldk';
import { TAvailableNetworks } from '../networks';
import { Result, err, ok } from '../result';
import { EIdentifierType, ELightningDataType, IDecodedData, TDecodedInput } from '../types';
import { getSelectedNetwork } from '../wallet';
import {
  addPeer,
  decodeLightningInvoice,
  getLightningStore,
  getTotalBalance,
  savePeer,
} from './helpers';
import { navigate } from '../../navigation/NavigationService';
import { Screens } from '../../navigation/Screens';
import { showErrorBanner, showSuccessBanner, showToast, showWarningBanner } from '../alerts';
import { cueErrorHaptic } from '../accessibility/haptics';

export const validateInternetIdentifier = (internetIdentifier) => {
  var re = /\S+@\S+\.\S+/;
  return re.test(internetIdentifier);
};

const LIGHTNING_SCHEME = 'lightning';
const BOLT11_SCHEME_MAINNET = 'lnbc';
const BOLT11_SCHEME_TESTNET = 'lntb';
const LNURL_SCHEME = 'lnurl';

/**
 * @param {QRData[]} data
 * @param {TAvailableNetworks} [selectedNetwork]
 */
export const processTransactionData = async ({
  data = [],
  selectedNetwork,
}: {
  data: IDecodedData[];
  selectedNetwork?: TAvailableNetworks;
}): Promise<Result<IDecodedData>> => {
  try {
    if (!selectedNetwork) {
      selectedNetwork = getSelectedNetwork();
    }

    let response;
    let error: { title: string; message: string } | undefined;
    let requestedAmount = 0;

    let { spendableBalance } = getTotalBalance({});

    const openLightningChannels = getLightningStore().openChannelIds;

    // Filter for the lightning invoice.
    const filteredLightningInvoice = data.find(
      (d) => d.dataType === ELightningDataType.paymentRequest
    );
    let decodedLightningInvoice: TInvoice | undefined;
    if (filteredLightningInvoice) {
      const decodeInvoiceRes = await decodeLightningInvoice({
        paymentRequest: filteredLightningInvoice.paymentRequest ?? '',
      });
      if (decodeInvoiceRes.isOk()) {
        decodedLightningInvoice = decodeInvoiceRes.value;
        requestedAmount = decodedLightningInvoice?.amount_satoshis ?? 0;
        if (decodedLightningInvoice?.is_expired) {
          error = {
            title: 'Expired',
            message: 'Unfortunately, this lightning invoice expired',
          };
        }
      }
    }

    if (
      decodedLightningInvoice &&
      !decodedLightningInvoice.is_expired &&
      openLightningChannels.length &&
      spendableBalance
    ) {
      // Check if invoice is payable
      if (spendableBalance >= requestedAmount) {
        response = filteredLightningInvoice;
      } else {
        const diff = requestedAmount - spendableBalance;
        error = {
          title: 'You cannot afford this invoice',
          message: `You would need ${diff.toLocaleString()} more sats`,
        };
      }
    }

    if (response) {
      return ok(response);
    }

    if (error) {
      showErrorBanner({
        message: error.message,
        title: error.title,
        dismissAfter: 3000,
      });
    } else {
      if (requestedAmount) {
        error = {
          title: `${requestedAmount} more sats needed`,
          message: `You can't afford this invoice. You have ${spendableBalance} only`,
        };
      } else {
        error = {
          title: 'You cannot afford this invoice',
          message: 'Please add more sats to process payments',
        };
      }
      showErrorBanner({
        message: error.message,
        title: error.title,
        dismissAfter: 3000,
      });
    }
    return err(error.title);
  } catch (e) {
    console.log(e);
    return err(e);
  }
};

/**
 * Return all networks and their payment request details if found in QR data.
 * Can also be used to read clipboard data for any addresses or payment requests.
 * @param data
 * @param {TAvailableNetworks} [selectedNetwork]
 * @returns {string}
 */
export const decodeQRData = async (
  data: string,
  selectedNetwork?: TAvailableNetworks
): Promise<Result<IDecodedData[]>> => {
  if (!selectedNetwork) {
    selectedNetwork = getSelectedNetwork();
  }

  let foundNetworksInQR: IDecodedData[] = [];
  let lightningInvoice = '';
  let error = '';

  //Lightning URI or plain lightning payment request
  if (
    data.toLowerCase().indexOf('lightning:') > -1 ||
    data.toLowerCase().startsWith(BOLT11_SCHEME_TESTNET) ||
    data.toLowerCase().startsWith(BOLT11_SCHEME_MAINNET)
  ) {
    //If it's a lightning URI, remove "lightning:", everything to the left of it.
    let invoice = data
      .replace(/^.*?(lightning:)/i, '')
      .trim()
      .toLowerCase();
    //Assume invoice
    //Ignore params if there are any, all details can be derived from invoice
    if (invoice.indexOf('?') > -1) {
      invoice = invoice.split('?')[0];
    }
    lightningInvoice = invoice;
  }

  if (lightningInvoice) {
    const decodedInvoice = await decodeLightningInvoice({
      paymentRequest: lightningInvoice,
    });
    if (decodedInvoice.isOk()) {
      foundNetworksInQR.push({
        dataType: ELightningDataType.paymentRequest,
        paymentRequest: data,
        network: selectedNetwork,
        sats: decodedInvoice.value?.amount_satoshis ?? 0,
        message: decodedInvoice.value?.description ?? '',
      });
    } else {
      error += `${decodedInvoice.error.message} `;
    }
  }

  if (!foundNetworksInQR.length) {
    // Attempt to determine if it's a node id to connect with and add.
    const dataSplit = data.split(':');
    if (dataSplit.length === 2 && dataSplit[0].includes('@')) {
      foundNetworksInQR.push({
        dataType: ELightningDataType.nodeId,
        url: data,
        network: selectedNetwork,
      });
    }
  }

  if (foundNetworksInQR.length) {
    return ok(foundNetworksInQR);
  }
  if (error) {
    return err(error);
  }
  return err('Unable to read the provided data.');
};

/**
 * This method processes, decodes and handles all scanned/pasted information provided by the user.
 * @param {string} data
 * @param {TAvailableNetworks} [selectedNetwork]
 */
export const processInputData = async ({
  data,
  selectedNetwork,
  showErrors = true,
}: {
  data: string;
  selectedNetwork?: TAvailableNetworks;
  showErrors?: boolean;
}): Promise<Result<TDecodedInput>> => {
  data = data.trim();
  try {
    if (!selectedNetwork) {
      selectedNetwork = getSelectedNetwork();
    }
    const decodeRes = await decodeQRData(data, selectedNetwork);
    console.log('decodeRes: ', decodeRes);
    if (decodeRes.isErr()) {
      const message = 'Etta could not decode that. Copy the invoice and try again';
      if (showErrors) {
        showWarningBanner({
          message: message,
          title: 'Try again',
          dismissAfter: 5000,
        });
        // console.error('Etta could not decode that. Copy the invoice and retry');
      }
      return err('Decoding Error');
    }

    // Unable to interpret any of the provided data.
    if (!decodeRes.value.length) {
      const message = 'Unable to interpret the provided data.';
      if (showErrors) {
        showErrorBanner({
          message: message,
          title: 'Error',
          dismissAfter: 3000,
        });
      }
      return err(message);
    }

    let dataToHandle;

    // Check if we're dealing with a  payment request.
    if (decodeRes.value.length > 1 || decodeRes.value[0].dataType === 'paymentRequest') {
      const processTxResponse = await processTransactionData({
        data: decodeRes.value,
        selectedNetwork,
      });
      console.log('processTxResponse: ', processTxResponse);
      if (processTxResponse.isErr()) {
        return err(processTxResponse.error.message);
      }
      dataToHandle = processTxResponse.value;
    } else {
      dataToHandle = decodeRes.value[0];
    }

    return await handleProcessedData({
      data: dataToHandle,
      selectedNetwork,
    });
  } catch (e) {
    console.log(e);
    return err(e);
  }
};

/**
 * This method will handle all actions required for each valid EQRDataType passed as data.
 * @param {QRData} data
 * @param {TAvailableNetworks} [selectedNetwork]
 */
export const handleProcessedData = async ({
  data,
  selectedNetwork,
}: {
  data: IDecodedData;
  selectedNetwork?: TAvailableNetworks;
}): Promise<Result<TDecodedInput>> => {
  if (!data) {
    const message = 'Unable to read or interpret the provided data.';
    showErrorBanner({
      message: message,
      title: 'Failed to intepret',
      dismissAfter: 5000,
    });
    console.log('@handleProcessedData/noData: Unable to read or interpret the provided data.');
    return err('Unable to read or interpret the provided data.');
  }

  if (!selectedNetwork) {
    selectedNetwork = getSelectedNetwork();
  }
  if (data.network && data.network !== selectedNetwork) {
    const message = `Etta is currently set to ${selectedNetwork} but data is for ${data.network}.`;
    showErrorBanner({
      message: message,
      title: 'Failed to intepret',
      dismissAfter: 3000,
    });
    return err(`Etta is currently set to ${selectedNetwork} but data is for ${data.network}.`);
  }

  const dataType = data.dataType;
  const paymentRequest = data.paymentRequest ?? '';

  switch (dataType) {
    case ELightningDataType.paymentRequest: {
      const decodedInvoice = await decodeLightningInvoice({
        paymentRequest: paymentRequest,
      });
      if (decodedInvoice.isErr()) {
        if (decodedInvoice.error.message === 'decode_invoice_fail') {
          showWarningBanner({
            title: "Can't decode this invoice",
            message: 'Invoice is either malformed or unsupported.',
            dismissAfter: 3000,
          });
        }
        showErrorBanner({
          message: "Can't decode this invoice",
          title: decodedInvoice.error.message,
          dismissAfter: 5000,
        });
        console.log('@decodedInvoice: ', decodedInvoice.error.message);
        return err(decodedInvoice.error.message);
      }

      const invoiceAmount = decodedInvoice.value.amount_satoshis ?? 0;
      const invoiceString = decodedInvoice.value.to_str || '';

      if (invoiceAmount) {
        navigate(Screens.SendScreen, {
          amount: invoiceAmount,
          paymentRequest: invoiceString,
        });
      } else {
        cueErrorHaptic();
        showErrorBanner({
          message: 'Specify an amount on this invoice and try again',
          title: 'No amount specified',
          dismissAfter: 5000,
        });
      }

      return ok({
        type: ELightningDataType.paymentRequest,
        amount: invoiceAmount,
      });
    }
    case ELightningDataType.nodeId: {
      const peer = data?.url;
      if (!peer) {
        return err('Unable to interpret peer information.');
      }
      if (peer.includes('onion')) {
        showToast({
          message: 'Unable to add tor nodes at this time.',
        });
        return err('Unable to add tor nodes at this time.');
      }
      const addPeerRes = await addPeer({
        peer,
        timeout: 5000,
      });
      if (addPeerRes.isErr()) {
        showToast({
          message: 'Unable to add lightning peer.',
        });
        console.log('processedNodeURI: ', 'Unable to add lightning peer.');
        return err('Unable to add lightning peer.');
      }
      const savePeerRes = savePeer({ selectedNetwork, peer });
      if (savePeerRes.isErr()) {
        showToast({
          message: savePeerRes.error.message,
        });
        console.log('savePeerRes: ', savePeerRes.error.message);
        return err(savePeerRes.error.message);
      }

      // should be a public toast
      showSuccessBanner({
        message: 'Lightning peer saved successfully',
        title: 'Saved successfully',
      });
      console.log('lightning peer saved successfully');
      return ok({ type: ELightningDataType.nodeId });
    }

    default:
      showErrorBanner({
        message: 'Unable to read or interpret the provided data',
        title: 'Decoding error',
        dismissAfter: 5000,
      });
      return err('Unable to read or interpret the provided data.');
  }
};

/**
 * This method will attempt to decode the input address/data set under a contact
 * to determine whether it's valid and acceptable as a persistent identity.
 * @param identifier
 * @returns {string}
 */
export const parseInputAddress = async (identifier: string) => {
  if (!identifier || identifier === '') {
    return null;
  }

  const inputString = identifier.trim().toLowerCase();
  let requestCode = inputString;

  // Check if this is a Lightning Address
  if (validateInternetIdentifier(requestCode)) {
    return {
      isLNURL: true,
      data: EIdentifierType.LNURL,
    };
  }

  // Check if Invoice has `lightning` or `lnurl` prefixes
  // (9 chars + the `:` or `=` chars) --> 10 characters total
  const hasLightningPrefix = inputString.indexOf(`${LIGHTNING_SCHEME}:`) !== -1;
  if (hasLightningPrefix) {
    // Remove the `lightning` prefix
    requestCode = inputString.slice(10, inputString.length);
  }

  // (5 chars + the `:` or `=` chars) --> 6 characters total
  const hasLNURLPrefix = inputString.indexOf(`${LNURL_SCHEME}:`) !== -1;
  if (hasLNURLPrefix) {
    // Remove the `lightning` prefix
    requestCode = inputString.slice(6, inputString.length);
  }

  // Parse LNURL or BOLT11
  const isLNURL = requestCode.startsWith(LNURL_SCHEME);
  if (isLNURL) {
    return {
      isLNURL: true,
      data: EIdentifierType.LNURL,
    };
  } else {
    return {
      isLNURL: false,
      data: EIdentifierType.BOLT11_INVOICE,
    };
  }
};

export const formatLightningId = (identifier: string) => {
  return identifier.replace(/\s+/gm, ' ');
};

export const isValidLightningId = (identifier: string) => {
  let isValid = false;
  const formattedId = formatLightningId(identifier);
  if (
    formattedId.toLowerCase().indexOf('lightning:') > -1 ||
    formattedId.toLowerCase().startsWith(BOLT11_SCHEME_TESTNET) ||
    formattedId.toLowerCase().startsWith(BOLT11_SCHEME_MAINNET) ||
    formattedId.toLowerCase().startsWith(LNURL_SCHEME) ||
    validateInternetIdentifier(formattedId)
  ) {
    isValid = true;
  }

  return isValid;
};
