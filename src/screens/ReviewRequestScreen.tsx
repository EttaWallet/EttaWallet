import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { StyleSheet, View, Platform, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HeaderTitleWithSubtitle, headerWithBackButton } from '../navigation/Headers';
import { Button, Colors, TypographyPresets } from 'etta-ui';
import { moderateScale } from '../utils/sizing';
import { cueInformativeHaptic } from '../utils/accessibility/haptics';
import { Screens } from '../navigation/Screens';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StackParamList } from '../navigation/types';
import FormLabel from '../components/form/Label';
import { getLightningStore } from '../utils/lightning/helpers';
import { estimateInvoiceFees } from '../utils/calculate';
import AmountDisplay from '../components/amount/AmountDisplay';
import { navigate } from '../navigation/NavigationService';
import TotalAmountDisplay from '../components/amount/TotalAmountDisplay';
import { useStoreState } from '../state/hooks';

type RouteProps = NativeStackScreenProps<StackParamList, Screens.ReviewRequestScreen>;
type Props = RouteProps;

const ReviewRequestScreen = ({ navigation, route }: Props) => {
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <HeaderTitleWithSubtitle title="Review request" subTitle="Confirm and update" />
      ),
    });
  }, [navigation]);
  const amountProp = route.params?.amount || '0';
  const amountRequested = parseInt(amountProp, 10);

  const [invoiceFees, setInvoiceFees] = useState(0);
  const preferredCurrencyCode = useStoreState((state) => state.nuxt.localCurrency);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isUsingLocalCurrency, setIsUsingLocalCurrency] = useState(!!preferredCurrencyCode);
  const totalReceivable = getLightningStore().maxReceivable;
  const totalInvoiceAmount = amountRequested + invoiceFees;

  const onPressCreate = () => {
    cueInformativeHaptic();
    requestAnimationFrame(() => {
      navigate(Screens.ReceiveScreen, {
        amount: amountProp,
        feesPayable: invoiceFees,
      });
    });
  };

  useEffect(() => {
    const getFeesPayable = async () => {
      let feeRequired: number = 0;
      if (totalReceivable < amountRequested) {
        feeRequired = await estimateInvoiceFees(amountRequested);
        setInvoiceFees(feeRequired);
      } else {
        setInvoiceFees(feeRequired);
      }
    };

    getFeesPayable();
  }, [amountRequested, totalReceivable]);

  const feeInfoDisplay = useMemo(() => {
    let feesText: string;
    if (invoiceFees === 0) {
      feesText = `No fees will be charged to receive this payment as it is under your receive limit of ${totalReceivable} sats.`;
    } else {
      feesText = `The amount exceeds your receive limit of ${totalReceivable} sats. A fee of ${invoiceFees} sats will be charged to increase this limit.`;
    }

    return <Text style={styles.maxReceive}>{feesText}</Text>;
  }, [totalReceivable, invoiceFees]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        <AmountDisplay inputAmount={amountProp} usingLocalCurrency={false} />
        {invoiceFees !== 0 ? (
          <>
            <View style={styles.field}>
              <FormLabel style={styles.label}>Estimated fee</FormLabel>
              {feeInfoDisplay}
            </View>
            <View style={styles.field}>
              <FormLabel style={styles.label}>Total incl. fees</FormLabel>
              <TotalAmountDisplay
                totalAmount={totalInvoiceAmount}
                usingLocalCurrency={isUsingLocalCurrency}
              />
            </View>
          </>
        ) : null}
      </View>
      <Button
        title="Create payment request"
        style={styles.button}
        appearance="filled"
        onPress={onPressCreate}
      />
    </SafeAreaView>
  );
};

ReviewRequestScreen.navigationOptions = {
  ...headerWithBackButton,
  ...Platform.select({
    ios: { animation: 'slide_from_bottom' },
  }),
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: moderateScale(24),
  },
  contentContainer: {
    flex: 1,
  },
  button: {
    justifyContent: 'center',
    marginVertical: 32,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    ...TypographyPresets.Body4,
    marginBottom: 10,
    color: Colors.common.black,
  },
  amount: {
    ...TypographyPresets.Header4,
    color: Colors.common.black,
  },
  maxReceive: {
    ...TypographyPresets.Body4,
    color: Colors.neutrals.light.neutral7,
  },
});

export default ReviewRequestScreen;
