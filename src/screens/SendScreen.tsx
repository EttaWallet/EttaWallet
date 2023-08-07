import React, { useCallback, useEffect, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, View, Platform, Text, ActivityIndicator } from 'react-native';
import { headerWithBackButton } from '../navigation/Headers';
import { Button, Colors, Icon, TypographyPresets } from 'etta-ui';
import { StackParamList } from '../navigation/types';
import { Screens } from '../navigation/Screens';
import { useTranslation } from 'react-i18next';
import { cueInformativeHaptic } from '../utils/accessibility/haptics';
import { InfoListItem } from '../components/InfoListItem';
import { TInvoice } from '@synonymdev/react-native-ldk';
import {
  decodeLightningInvoice,
  payInvoice,
  startLightning,
  syncPaymentsWithStore,
} from '../utils/lightning/helpers';
import { refreshWallet } from '../utils/wallet';
import { navigate, navigateHome } from '../navigation/NavigationService';
import { showWarningBanner } from '../utils/alerts';
import LottieView from 'lottie-react-native';
import { humanizeTimestamp } from '../utils/time';
import i18n from '../i18n';
import { isLdkRunning, waitForLdk } from '../ldk';
import { SafeAreaView } from 'react-native-safe-area-context';

type RouteProps = NativeStackScreenProps<StackParamList, Screens.SendScreen>;
type Props = RouteProps;

const getReadableSendingError = (errorFound) => {
  const SendingErrorEnum = {
    invoice_payment_fail_resend_safe:
      'Sorry, the payment failed but it is not permanent. We will keep trying to settle it.',
    invoice_payment_fail_parameter_error:
      'Sorry, the payment failed but it is not permanent. We will keep trying to settle it.',
    invoice_payment_fail_partial: 'Sorry, the payment failed but we will keep trying to settle it.',
    invoice_payment_fail_path_parameter_error:
      'Sorry, the payment failed but it is not permanent. We will keep trying to settle it.',
    invoice_payment_fail_sending:
      'Your funds remain securely in your wallet. Is your balance sufficient to pay this invoice?',
    invoice_payment_fail_unknown:
      'Sorry, the problem could not be identified. Your funds remain securely in your wallet.',
    invoice_payment_fail_must_specify_amount: 'The payment request does not have an amount',
    invoice_payment_fail_routing: 'No route hints were found in the payment request',
  };

  if (Object.prototype.hasOwnProperty.call(SendingErrorEnum, errorFound)) {
    return SendingErrorEnum[errorFound];
  }

  return 'Sorry, the receiving party could not be reached. Your funds remain securely in your wallet.';
};

const SendScreen = ({ route }: Props) => {
  const amount = route.params?.amount || '0';
  const paymentRequest = route.params?.paymentRequest || '';
  const [decodedInvoice, setDecodedInvoice] = useState<TInvoice>();

  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(false);
  const [paymentSuccessful, setPaymentSuccessful] = useState(false);

  const decodePaymentRequest = async (): Promise<void> => {
    try {
      if (!paymentRequest) {
        return;
      }
      const decodeResponse = await decodeLightningInvoice({ paymentRequest: paymentRequest });
      if (decodeResponse.isErr()) {
        return;
      }
      setDecodedInvoice(decodeResponse.value);
    } catch (e) {
      console.log('Error@decodePaymentRequest: ', e);
    }
  };

  useEffect(() => {
    decodePaymentRequest().then();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentRequest]);

  // attemps to pay the decoded invoice and adds the record to payments object in state
  const handleTransaction = useCallback(async () => {
    if (!paymentRequest) {
      const message = 'No payment request found';
      showWarningBanner({
        message: message,
        title: 'Try again',
        dismissAfter: 5000,
      });
      setIsLoading(false);
      return;
    }

    try {
      // ensure Ldk is up
      const isLdkUp = await isLdkRunning();
      if (!isLdkUp) {
        await startLightning({});
      }
      await waitForLdk();

      // // check that peers exist before we create invoice;
      // addPeers().then();

      // attempt to pay this bolt11 invoice
      const payInvoiceResponse = await payInvoice(paymentRequest);

      if (payInvoiceResponse.isErr()) {
        console.log('Error@payInvoiceResponse: ', payInvoiceResponse.error.message);
        setIsLoading(false);
        if (payInvoiceResponse.error.message === 'invoice_payment_fail_sending') {
          navigate(Screens.TransactionErrorScreen, {
            errorMessage: getReadableSendingError(payInvoiceResponse.error.message),
            canRetry: false,
            showSuggestions: true,
          });
        } else {
          navigate(Screens.TransactionErrorScreen, {
            errorMessage: getReadableSendingError(payInvoiceResponse.error.message),
            canRetry: true,
          });
        }
        return;
      }

      refreshWallet({}).then();
      await syncPaymentsWithStore().then();
      setIsLoading(false);
      setPaymentSuccessful(true);
    } catch (e) {
      console.log('handleTransactionError', '@Payinvoice: ', e.message);
    }
  }, [paymentRequest]);

  const onPressSend = useCallback(() => {
    cueInformativeHaptic();
    setIsLoading(true);
    handleTransaction().then();
  }, [handleTransaction]);

  // const onPressDetails = () => {
  //   cueInformativeHaptic();
  //   navigate(Screens.ActivityDetailsScreen, {
  //     transaction: sentPayment!,
  //   });
  // };

  const onPressOkay = () => {
    cueInformativeHaptic();
    navigateHome();
  };

  return (
    <SafeAreaView style={styles.container}>
      {!paymentSuccessful ? (
        <>
          <View style={styles.iconContainer}>
            <Icon name="icon-arrow-up" style={styles.actionIcon} />
          </View>
          <Text style={styles.title}>{t('Send bitcoin')}</Text>
        </>
      ) : (
        <View style={styles.centerContainer}>
          <LottieView
            style={styles.lottieIcon}
            source={require('../../assets/lottie/success-check.json')}
            autoPlay={true}
            loop={false}
          />
          <Text style={styles.title}>{t('Payment sent!')}</Text>
        </View>
      )}
      <View style={styles.infoContainer}>
        <InfoListItem title="Amount" value={amount} valueIsNumeric={true} canCopy />
        {decodedInvoice && (
          <>
            <InfoListItem title="Description" value={decodedInvoice?.description} canCopy />
            <InfoListItem
              title="Expires"
              value={humanizeTimestamp(decodedInvoice?.timestamp, i18n)}
            />
          </>
        )}
        <InfoListItem
          title="Payment request"
          value={paymentRequest}
          maskValue={true}
          canCopy={true}
        />
      </View>

      {isLoading && (
        <View style={styles.centerContainer}>
          <ActivityIndicator style={styles.loadingIcon} size="large" color={Colors.orange.base} />
        </View>
      )}

      {/* {paymentSuccessful ? (
        <Button
          title="Details"
          onPress={onPressDetails}
          appearance="outline"
          style={styles.detailsButton}
        />
      ) : null} */}
      <Button
        title={isLoading ? 'Sending payment...' : paymentSuccessful ? 'Done' : 'Send payment'}
        onPress={paymentSuccessful ? onPressOkay : onPressSend}
        appearance="filled"
        style={styles.button}
        disabled={isLoading}
      />
    </SafeAreaView>
  );
};

SendScreen.navigationOptions = {
  ...headerWithBackButton,
  ...Platform.select({
    ios: { animation: 'slide_from_bottom' },
  }),
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 24,
  },
  infoContainer: {
    flex: 1,
  },
  centerContainer: {
    alignItems: 'center',
  },
  title: {
    ...TypographyPresets.Header5,
    marginBottom: 16,
    textAlign: 'center',
  },
  amount: {
    marginVertical: 5,
  },
  detailsButton: {
    justifyContent: 'center',
    marginBottom: 10,
  },
  button: {
    justifyContent: 'center',
    marginBottom: 40,
  },
  field: {
    marginVertical: 16,
  },
  loadingIcon: {
    height: 108,
    width: 108,
  },
  actionIcon: {
    alignSelf: 'center',
    justifyContent: 'center',
    fontSize: 32,
    color: Colors.orange.base,
  },
  iconContainer: {
    alignSelf: 'center',
    justifyContent: 'center',
    width: 64,
    height: 64,
    borderRadius: 50,
    backgroundColor: Colors.common.black,
    marginVertical: 16,
  },
  lottieIcon: {
    width: '30%',
    aspectRatio: 1,
  },
  inputContainer: {
    height: 80,
    textAlignVertical: 'top',
    alignSelf: 'stretch',
    ...TypographyPresets.Body4,
    color: Colors.common.black,
    padding: 12,
    backgroundColor: Colors.neutrals.light.neutral3,
    marginBottom: 20,
    borderRadius: 5,
  },
});

export default SendScreen;
