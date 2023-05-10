import { TInvoice, TPaymentReq } from '@synonymdev/react-native-ldk';
import { TAvailableNetworks } from '../networks';
import { Result, err, ok } from '../result';
import { ELightningDataType, IDecodedData, TDecodedInput } from '../types';
import { getSelectedNetwork } from '../wallet';
import ldk from '@synonymdev/react-native-ldk/dist/ldk';
import { addPeer, getLightningStore, getTotalBalance, savePeer } from './helpers';
import { navigate } from '../../navigation/NavigationService';
import { Screens } from '../../navigation/Screens';

export const decodeLightningInvoice = ({
  paymentRequest,
}: TPaymentReq): Promise<Result<TInvoice>> => {
  paymentRequest = paymentRequest.replace('lightning:', '').trim();
  return ldk.decode({ paymentRequest });
};

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

    const lightningBalance = await getTotalBalance({ subtractReserveBalance: false });
    // const lightningBalance = 1000000;
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
            title: 'Lightning Invoice Expired',
            message: 'Unfortunately, this lightning invoice has expired.',
          };
        }
      }
    }

    if (
      decodedLightningInvoice &&
      !decodedLightningInvoice.is_expired &&
      openLightningChannels.length &&
      lightningBalance
    ) {
      // Check if invoice is payable
      if (lightningBalance >= requestedAmount) {
        response = filteredLightningInvoice;
      } else {
        const diff = requestedAmount - lightningBalance;
        error = {
          title: 'Unable to afford the lightning invoice',
          message: `(${diff} more sats needed.)`,
        };
      }
    }

    if (response) {
      return ok(response);
    }

    if (error) {
      // Show public toast
      console.error('@processTransactionData1: ', error);
    } else {
      if (requestedAmount) {
        error = {
          title: `${requestedAmount} more sats needed`,
          message: 'Unable to pay the provided invoice',
        };
      } else {
        error = {
          title: 'Unable to pay the provided invoice',
          message: 'Please add more sats to process payments.',
        };
      }
      // Show public toast
      console.error('@processTransactionData2: ', error);
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
    data.toLowerCase().startsWith('lntb') ||
    data.toLowerCase().startsWith('lnbc')
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
  skip?: Array<string>;
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
      if (showErrors) {
        // show public toast error
        console.error('unable to decode ');
      }
      return err('Decoding Error');
    }

    // Unable to interpret any of the provided data.
    if (!decodeRes.value.length) {
      const message = 'Unable to interpret the provided data.';
      if (showErrors) {
        // show public toast error
        console.error('unable to intepret this data ');
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
    // should be a public toast
    console.log('@handleProcessedData/noData: Unable to read or interpret the provided data.');
    return err('Unable to read or interpret the provided data.');
  }

  if (!selectedNetwork) {
    selectedNetwork = getSelectedNetwork();
  }
  if (data.network && data.network !== selectedNetwork) {
    // should be a public toast
    console.log('@handleProcessedData/wrongChain: Unable to read or interpret the provided data.');
    return err(`Etta is currently set to ${selectedNetwork} but data is for ${data.network}.`);
  }

  const dataType = data.dataType;
  const paymentRequest = data.paymentRequest ?? '';

  //TODO(slashtags): Register Bitkit to handle all slash?x:// protocols
  switch (dataType) {
    case ELightningDataType.paymentRequest: {
      const decodedInvoice = await decodeLightningInvoice({
        paymentRequest: paymentRequest,
      });
      if (decodedInvoice.isErr()) {
        // showErrorNotification({
        //   title: i18n.t('lightning:error_decode'),
        //   message: decodedInvoice.error.message,
        // });
        // should be a public toast
        console.log('@decodedInvoice: ', decodedInvoice.error.message);
        return err(decodedInvoice.error.message);
      }

      const invoiceAmount = decodedInvoice.value.amount_satoshis ?? 0;
      const invoiceString = decodedInvoice.value.to_str || '';

      if (invoiceAmount) {
        // navigate to sending review page
        navigate(Screens.SendScreen, {
          amount: invoiceAmount,
          paymentRequest: invoiceString,
        });
        console.info('navigate to sending review page since amount present');
      } else {
        // cue amount-entry bottom sheet
        console.info('open bottom sheet to enter amount if invoice amount is null');
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
        // should be a public toast
        console.log('NodeURL includes onion', 'Unable to add tor nodes at this time.');
        return err('Unable to add tor nodes at this time.');
      }
      const addPeerRes = await addPeer({
        peer,
        timeout: 5000,
      });
      if (addPeerRes.isErr()) {
        // should be a public toast
        console.log('processedNodeURI: ', 'Unable to add lightning peer.');
        return err('Unable to add lightning peer.');
      }
      const savePeerRes = savePeer({ selectedNetwork, peer });
      if (savePeerRes.isErr()) {
        //should show public toast
        console.log('savePeerRes: ', savePeerRes.error.message);
        return err(savePeerRes.error.message);
      }

      // should be a public toast
      console.log('lightning peer saved successfully');
      return ok({ type: ELightningDataType.nodeId });
    }

    default:
      return err('Unable to read or interpret the provided data.');
  }
};
