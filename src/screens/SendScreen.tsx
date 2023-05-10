import React, { useCallback, useEffect, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView, StyleSheet, View, Platform, Text, ActivityIndicator } from 'react-native';
import { headerWithBackButton } from '../navigation/Headers';
import { Button, Colors, Icon, TypographyPresets } from 'etta-ui';
import { StackParamList } from '../navigation/types';
import { Screens } from '../navigation/Screens';
import { useTranslation } from 'react-i18next';
import { cueInformativeHaptic } from '../utils/accessibility/haptics';
import { InfoListItem } from '../components/InfoListItem';
import { decodeLightningInvoice } from '../utils/lightning/decode';
import { TInvoice } from '@synonymdev/react-native-ldk';
import { payInvoice } from '../utils/lightning/helpers';
import { refreshWallet } from '../utils/wallet';

type RouteProps = NativeStackScreenProps<StackParamList, Screens.SendScreen>;
type Props = RouteProps;

const SendScreen = ({ route }: Props) => {
  const amount = route.params?.amount || '0';
  const paymentRequest = route.params?.paymentRequest || '';
  const [decodedInvoice, setDecodedInvoice] = useState<TInvoice>();

  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(false);

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
      console.log('no payment request found');
      setIsLoading(false);
      return;
    }

    // attempt to pay this bolt11 invoice
    const payInvoiceResponse = await payInvoice(paymentRequest);

    if (payInvoiceResponse.isErr()) {
      console.log('Error@payInvoiceResponse: ', payInvoiceResponse.error.message);
      setIsLoading(false);
      return;
    }

    refreshWallet({}).then();
    setIsLoading(false);

    // navigate to success page
    console.log('show success page here');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decodedInvoice?.amount_satoshis, t]);

  const onPressSend = useCallback(() => {
    cueInformativeHaptic();
    setIsLoading(true);
    handleTransaction().then();
  }, [handleTransaction]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.iconContainer}>
        <Icon name="icon-arrow-up" style={styles.actionIcon} />
      </View>
      <Text style={styles.title}>{t('Send bitcoin')}</Text>
      <View style={styles.infoContainer}>
        <InfoListItem title="Amount" value={amount} valueIsNumeric={true} canCopy />
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

      <Button
        title={isLoading ? 'Sending payment...' : 'Send payment'}
        onPress={onPressSend}
        size="default"
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
    flex: 1,
  },
  title: {
    ...TypographyPresets.Header5,
    marginBottom: 16,
    textAlign: 'center',
  },
  amount: {
    marginVertical: 5,
  },
  button: {
    justifyContent: 'center',
    marginVertical: 16,
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
});

export default SendScreen;
