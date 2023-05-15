import React, { useState, useEffect } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Platform,
  ActivityIndicator,
  Dimensions,
  Text,
} from 'react-native';
import { headerWithBackButton } from '../navigation/Headers';
import { createLightningInvoice, startLightning } from '../utils/lightning/helpers';
import { isLdkRunning, waitForLdk } from '../ldk';
import QRCode from 'react-native-qrcode-svg';
import { Colors, TypographyPresets } from 'etta-ui';
import { moderateScale } from '../utils/sizing';
import InvoiceActionsBar from '../components/InvoiceActionsBar';
import usePaymentRequestBottomSheet from '../components/usePaymentRequestBottomSheet';
import { StackParamList } from '../navigation/types';
import { Screens } from '../navigation/Screens';
import i18n from '../i18n';
import { humanizeTimestamp } from '../utils/time';

const WINDOW_WIDTH = Dimensions.get('window').width;
const QR_CODE_WIDTH = WINDOW_WIDTH - 150;

type RouteProps = NativeStackScreenProps<StackParamList, Screens.ReceiveScreen>;
type Props = RouteProps;

const ReceiveScreen = (props: Props) => {
  const [invoice, setInvoice] = useState('');
  const [timestamp, setTimestamp] = useState(0);
  const [expiry, setExpiry] = useState(3600);
  const [isLoading, setIsLoading] = useState(true);

  const amount = props.route.params?.amount || '0';
  const description =
    props.route.params?.description || `Pay lightining invoice for ${amount} sats`;

  // get expiry in epoch time as sum of timestamp/duration_since_epoch and expiry
  const invoiceExpires = humanizeTimestamp(timestamp + expiry, i18n);

  const { openPaymentRequestSheet, ModifyInvoiceBottomSheet } = usePaymentRequestBottomSheet({
    amountInSats: amount,
    description: description,
  });

  useEffect(() => {
    async function fetchInvoice() {
      try {
        // ensure Ldk is up
        const isLdkUp = await isLdkRunning();
        if (!isLdkUp) {
          await startLightning({});
        }
        await waitForLdk();
        // proceed to create invoice
        const invoiceString = await createLightningInvoice({
          amountSats: parseInt(amount, 10), // amountSats is optional
          description: description,
          expiryDeltaSeconds: 3600,
        });

        if (invoiceString.isErr()) {
          console.log(invoiceString.error.message);
          return;
        }
        console.log(invoiceString.value.to_str);
        setIsLoading(false);
        setInvoice(invoiceString.value.to_str);
        setTimestamp(invoiceString.value.timestamp);
        setExpiry(invoiceString.value.expiry_time);
      } catch (e) {
        setInvoice(`Error: ${e.message}`);
      }
    }

    fetchInvoice();
  }, [amount, description]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.heading}>Share payment request</Text>
        <Text style={styles.text}>Keep the app open until the payment is received</Text>
      </View>
      <View style={styles.qrContainer}>
        {isLoading ? (
          <ActivityIndicator color={Colors.orange.base} />
        ) : (
          <>
            <QRCode
              value={`lightning:${invoice}`}
              size={QR_CODE_WIDTH}
              backgroundColor={Colors.common.white}
              color={Colors.common.black}
            />
            <Text style={styles.advice}>{`This request will expire on ${invoiceExpires}`}</Text>
          </>
        )}
      </View>
      <View style={styles.buttonContainer}>
        {isLoading ? (
          ''
        ) : (
          <InvoiceActionsBar
            paymentRequest={invoice}
            allowModifier={true}
            onPressModify={openPaymentRequestSheet}
            smallButtons={true}
          />
        )}
      </View>
      {ModifyInvoiceBottomSheet}
    </SafeAreaView>
  );
};

ReceiveScreen.navigationOptions = {
  ...headerWithBackButton,
  ...Platform.select({
    ios: { animation: 'slide_from_bottom' },
  }),
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  headerContainer: {
    marginTop: 32,
    flex: 1,
    alignItems: 'center',
  },
  buttonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    ...TypographyPresets.Header3,
  },
  text: {
    color: Colors.neutrals.light.neutral6,
    marginHorizontal: moderateScale(16),
    textAlign: 'center',
  },
  advice: {
    ...TypographyPresets.Body5,
    marginVertical: 20,
  },
});

export default ReceiveScreen;
