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

const WINDOW_WIDTH = Dimensions.get('window').width;
const QR_CODE_WIDTH = WINDOW_WIDTH - 150;

type RouteProps = NativeStackScreenProps<StackParamList, Screens.ReceiveScreen>;
type Props = RouteProps;

const ReceiveScreen = (props: Props) => {
  const [invoice, setInvoice] = useState('');
  const [amount, setAmount] = useState(0);
  const [timestamp, setTimestamp] = useState(0);
  const [description, setDescription] = useState(`Pay lightining invoice for ${amount} sats`);
  const [expiry, setExpiry] = useState(3600);
  const [isLoading, setIsLoading] = useState(true);

  const { openSheet, ModifyInvoiceBottomSheet } = usePaymentRequestBottomSheet({
    amountInSats: amount,
    timestamp: timestamp,
    valid_for: expiry,
  });

  const modifiedAmount = props.route.params?.modifiedAmount;
  const modifiedDescription = props.route.params?.modifiedDescription;

  if (modifiedAmount !== amount || modifiedDescription !== description) {
    setAmount(modifiedAmount!);
    setDescription(modifiedDescription!);
  }

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
          amountSats: amount, // amountSats is optional
          description: description,
          expiryDeltaSeconds: 3600,
        });

        if (invoiceString.isErr()) {
          console.log(invoiceString.error.message);
          return;
        }
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
          <QRCode
            value={`lightning:${invoice}`}
            size={QR_CODE_WIDTH}
            backgroundColor={Colors.common.white}
            color={Colors.common.black}
          />
        )}
      </View>
      <View style={styles.buttonContainer}>
        {isLoading ? (
          ''
        ) : (
          <InvoiceActionsBar
            paymentRequest={invoice}
            allowModifier={true}
            onPressModify={openSheet}
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
});

export default ReceiveScreen;
