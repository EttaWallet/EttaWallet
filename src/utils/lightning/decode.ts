import { TInvoice } from '@synonymdev/react-native-ldk';
import { TAvailableNetworks } from '../networks';
import { Result, err, ok } from '../result';
import { EIdentifierType, ELightningDataType, IDecodedData, TDecodedInput } from '../types';
import { getSelectedNetwork } from '../wallet';
import {
  decodeLightningInvoice,
  getLightningStore,
  getTotalBalance,
  hasOpenLightningChannels,
} from './helpers';
import { navigate } from '../../navigation/NavigationService';
import { Screens } from '../../navigation/Screens';
import { showErrorBanner, showWarningBanner } from '../alerts';
import { cueErrorHaptic } from '../accessibility/haptics';
import { LNURLPayParams, LNURLWithdrawParams } from 'js-lnurl';
import { getLNURLParams } from '../lnurl/decode';
import { sleep } from '../helpers';

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

    if (!hasOpenLightningChannels()) {
      navigate(Screens.TransactionErrorScreen, {
        errorMessage: 'You have no receving or sending capacity',
        canRetry: false,
        showSuggestions: true,
      });
      return err('You have no receving or sending capacity');
    }

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
            message: 'This invoice expired and is no longer valid for payment',
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
          message: `You can't afford this invoice. You have ${spendableBalance} sats only`,
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
 * Read clipboard data, make sense of scanned QRcodes or images or any input that might
 * contain a lightning network instrument: LNURL, Lightning addresses, Node URI, BOLT11
 * invoices & BOLT12 offers, etc.
 * @param data
 * @param {TAvailableNetworks} [selectedNetwork]
 * @returns {string}
 */
export const decodeLNData = async (
  data: string,
  selectedNetwork?: TAvailableNetworks
): Promise<Result<IDecodedData[]>> => {
  if (!selectedNetwork) {
    selectedNetwork = getSelectedNetwork();
  }

  let foundNetworksInQR: IDecodedData[] = [];
  let lightningInvoice = '';
  let lightningAddress = '';
  let error = '';

  //Lightning URI or plain lightning payment request
  if (isValidLightningId(data)) {
    //If it's a lightning URI, remove "lightning:", everything to the left of it.
    let invoice = data
      .replace(/^.*?(lightning:)/i, '')
      .trim()
      .toLowerCase();
    //Attempt to handle any lnurl request.
    if (invoice.startsWith(LNURL_SCHEME)) {
      const res = await getLNURLParams(invoice);
      if (res.isOk()) {
        const params = res.value;
        let tag = '';
        if ('tag' in params) {
          tag = params.tag;
        }

        let dataType: ELightningDataType | undefined;

        switch (tag) {
          case 'login': {
            dataType = ELightningDataType.lnurlAuth;
            break;
          }
          case 'withdrawRequest': {
            dataType = ELightningDataType.lnurlWithdraw;
            break;
          }
          case 'payRequest': {
            dataType = ELightningDataType.lnurlPay;
            break;
          }
        }

        if (dataType) {
          foundNetworksInQR.push({
            dataType,
            network: selectedNetwork,
            lnUrlParams: params,
          });
        }
      } else {
        error += `${res.error.message} `;
      }
    } else if (validateInternetIdentifier(invoice)) {
      lightningAddress = invoice;
    } else {
      //Assume invoice
      //Ignore params if there are any, all details can be derived from invoice
      if (invoice.indexOf('?') > -1) {
        invoice = invoice.split('?')[0];
      }
      lightningInvoice = invoice;
    }
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

  if (lightningAddress) {
    await sleep(1000);
    const [username, domain] = lightningAddress.split('@');
    const url = `https://${domain}/.well-known/lnurlp/${username.toLowerCase()}`;
    const paramsRes = await getLNURLParams(url);
    if (paramsRes.isOk()) {
      foundNetworksInQR.push({
        dataType: ELightningDataType.lnurlPay,
        network: selectedNetwork,
        lnUrlParams: paramsRes.value,
      });
    } else {
      error += `${paramsRes.error.message} `;
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
    const decodeRes = await decodeLNData(data, selectedNetwork);
    console.log('decodeRes: ', JSON.stringify(decodeRes));
    if (decodeRes.isErr()) {
      const message = 'Etta could not decode that. Copy the invoice and try again';
      if (showErrors) {
        showWarningBanner({
          message: message,
          title: 'Try again',
          dismissAfter: 5000,
        });
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
      // } else if (decodeRes.value.length > 1 || decodeRes.value[0].dataType === 'lnurlPay') {
      //   const meh = await handleLnurlPay({
      //     params: decodeRes.value[0].lnUrlParams,
      //     amountSats: 2000,
      //     selectedNetwork: 'bitcoinTestnet',
      //   });
      //   console.log('meh: ', meh);
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
    case ELightningDataType.lnurlPay: {
      const params = data.lnUrlParams! as LNURLPayParams;

      navigate(Screens.LNURLPayScreen, {
        data: params,
      });
      return ok({ type: ELightningDataType.lnurlPay });
    }

    case ELightningDataType.lnurlWithdraw: {
      const params = data.lnUrlParams! as LNURLWithdrawParams;

      navigate(Screens.LNURLWithdrawScreen, {
        data: params,
      });
      return ok({ type: ELightningDataType.lnurlWithdraw });
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
