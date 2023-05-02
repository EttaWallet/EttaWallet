import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Dimensions, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { headerWithBackButton } from '../navigation/Headers';
import { Button, Colors, TypographyPresets } from 'etta-ui';
import FormInput from '../components/form/Input';
import { isLdkRunning, waitForLdk } from '../ldk';
import { createLightningInvoice, startLightning } from '../utils/lightning/helpers';
import QRCode from 'react-native-qrcode-svg';
import KeyboardAwareScrollView from '../components/keyboard/KeyboardInScrollView';
import KeyboardSpacer from '../components/keyboard/KeyboardSpacer';
import { VOLTAGE_LSP_API_TESTNET, VOLTAGE_LSP_FEE_ESTIMATE_API } from '../../config';
import InvoiceActionsBar from '../components/InvoiceActionsBar';

const WINDOW_WIDTH = Dimensions.get('window').width;
const QR_CODE_WIDTH = WINDOW_WIDTH - 150;

const DEFAULT_INBOUND_LIQUIDITY_IN_SATS = '100000';

const JITLiquidityScreen = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [liquidityAmount, setLiquidityAmount] = useState(DEFAULT_INBOUND_LIQUIDITY_IN_SATS);
  const [invoice, setInvoice] = useState('');
  const [wrappedInvoice, setWrappedInvoice] = useState('');
  const [wrappedInvoiceFees, setWrappedInvoiceFees] = useState(0);

  const getLSPWrappedInvoice = async () => {
    // get wrapped invoice
    try {
      await fetch(VOLTAGE_LSP_API_TESTNET, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bolt11: invoice,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          setWrappedInvoice(data.jit_bolt11);
          console.log(wrappedInvoice);
        });
      setIsLoading(false);
    } catch (e) {
      console.error(e.message);
    }
  };

  const checkInvoiceSettled = () => {
    return 0;
  };

  const estimateFees = async () => {
    try {
      await fetch(VOLTAGE_LSP_FEE_ESTIMATE_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount_msat: parseInt(liquidityAmount, 10) * 1000, // get amount in msats
          pubkey: '025804d4431ad05b06a1a1ee41f22fefeb8ce800b0be3a92ff3b9f594a263da34e',
        }),
      })
        .then((fees) => fees.json())
        .then((data) => {
          const feeInSats = data.fee_amount_msat / 1000; // get fee in sats from msats
          setWrappedInvoiceFees(feeInSats);
          console.log('fee api', data);
        });
      setIsLoading(false);
    } catch (e) {
      console.error(e.message);
    }
  };

  useEffect(() => {
    async function fetchInvoice() {
      try {
        // check if LDK is up
        const isLdkUp = await isLdkRunning();
        // if nuh, start all lightning services
        if (!isLdkUp) {
          await startLightning({});
          // check for node ID
          await waitForLdk();
        }
        // proceed to create invoice
        const invoiceString = await createLightningInvoice({
          amountSats: parseInt(liquidityAmount, 10),
          description: 'Zero conf channel for inbound liquidity',
          expiryDeltaSeconds: 3600,
        });

        if (invoiceString.isErr()) {
          console.log(invoiceString.error.message);
          return;
        }
        setInvoice(invoiceString.value.to_str);
        setIsLoading(false);
      } catch (e) {
        setInvoice(`Error: ${e.message}`);
      }
    }
    fetchInvoice();
    // estimate fees if fee estimate is zero.
    if (wrappedInvoiceFees === 0) {
      estimateFees();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const edges: Edge[] | undefined = ['bottom'];

  const DynamicButton = () => {
    const ctaButtonTitle = wrappedInvoice === '' ? 'Get quote' : 'Check for payment';
    const ctaAction = wrappedInvoice === '' ? getLSPWrappedInvoice : checkInvoiceSettled;
    return (
      <Button
        title={ctaButtonTitle}
        onPress={ctaAction}
        style={styles.button}
        size="default"
        disabled={isLoading}
      />
    );
  };

  const totalChannelOpen = parseInt(liquidityAmount, 10) + wrappedInvoiceFees;

  return (
    <SafeAreaView style={styles.container} edges={edges}>
      <Text style={styles.intro}>{t('Purchase inbound liquidity')}</Text>
      <KeyboardAwareScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.amountContainer}>
          <FormInput
            label={t('Amount in sats')}
            onChangeText={setLiquidityAmount}
            value={liquidityAmount}
            enablesReturnKeyAutomatically={true}
            placeholder="Amount in sats" // should pass value of amount from receive Screen
            multiline={false}
            keyboardType={'decimal-pad'}
          />
          <Text style={styles.fees}>Fee Estimate: {wrappedInvoiceFees} sats</Text>
        </View>
        <View style={styles.qrContainer}>
          {isLoading || wrappedInvoice === '' ? (
            <ActivityIndicator color={Colors.orange.base} />
          ) : (
            <>
              <QRCode
                value={`lightning:${wrappedInvoice}`}
                size={QR_CODE_WIDTH}
                backgroundColor={Colors.common.white}
                color={Colors.common.black}
              />
              <InvoiceActionsBar
                paymentRequest={wrappedInvoice}
                allowModifier={false}
                smallButtons={true}
              />
              <Text style={styles.total}>Total for channel open: {totalChannelOpen} sats</Text>
            </>
          )}
        </View>
        {wrappedInvoice !== '' ? (
          <Text style={[styles.adviceWrapper, TypographyPresets.Body4, styles.adviceText]}>
            Paying this wrapped invoice will allow you to receive up to {liquidityAmount} sats.
          </Text>
        ) : (
          ''
        )}
        <DynamicButton />
        <KeyboardSpacer topSpacing={16} />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

JITLiquidityScreen.navigationOptions = {
  ...headerWithBackButton,
  ...Platform.select({
    ios: { animation: 'slide_from_bottom' },
  }),
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    flexGrow: 1,
  },
  qrContainer: {
    flex: 1,
    alignItems: 'center',
  },
  intro: {
    ...TypographyPresets.Header4,
    marginVertical: 16,
    marginHorizontal: 16,
  },
  amountContainer: {
    paddingBottom: 24,
    flex: 1,
  },
  button: {
    justifyContent: 'center',
  },
  adviceWrapper: {
    paddingBottom: 24,
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },
  adviceText: {
    color: Colors.neutrals.light.neutral6,
    textAlign: 'center',
  },
  fees: {
    ...TypographyPresets.Body4,
    color: Colors.neutrals.light.neutral6,
    paddingVertical: 10,
  },
  total: {
    ...TypographyPresets.Body4,
    color: Colors.green.base,
    paddingVertical: 10,
  },
});

export default JITLiquidityScreen;
