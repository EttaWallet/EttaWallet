import BottomSheet, {
  BottomSheetBackdrop,
  useBottomSheetDynamicSnapPoints,
} from '@gorhom/bottom-sheet';
import { Button, Colors, Icon, TypographyPresets } from 'etta-ui';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { navigate } from '../navigation/NavigationService';
import { Screens } from '../navigation/Screens';
import FormInput from './form/Input';
import CancelButton from '../navigation/components/CancelButton';
import { cueInformativeHaptic } from '../utils/accessibility/haptics';
import FormLabel from './form/Label';
import { estimateInvoiceFees } from '../utils/calculate';
import { getLightningStore } from '../utils/lightning/helpers';

interface Props {
  amountInSats?: string;
  feesPayable?: number;
  expiresOn?: string;
}
const usePaymentRequestBottomSheet = (receiveProps: Props) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const paddingBottom = Math.max(insets.bottom, 24);

  const [invoiceAmount, setInvoiceAmount] = useState(receiveProps.amountInSats);
  const [senderName, setSenderName] = useState('');

  const [invoiceFees, setInvoiceFees] = useState(receiveProps.feesPayable);
  const totalReceivable = getLightningStore().maxReceivable;

  const amountRequested = parseInt(invoiceAmount!, 10);

  const paymentRequestBottomSheetRef = useRef<BottomSheet>(null);

  const initialSnapPoints = useMemo(() => ['CONTENT_HEIGHT'], []);
  const { animatedHandleHeight, animatedSnapPoints, animatedContentHeight, handleContentLayout } =
    useBottomSheetDynamicSnapPoints(initialSnapPoints);

  const openPaymentRequestSheet = () => {
    paymentRequestBottomSheetRef.current?.snapToIndex(0);
  };

  const renderBackdrop = useCallback(
    (props) => (
      // added opacity here, default is 0.5
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.2} />
    ),
    []
  );

  const newPaymentRequestBottomSheet = useMemo(() => {
    let feeRequired: number = 0;
    const getFeesPayable = async () => {
      if (totalReceivable < amountRequested) {
        feeRequired = await estimateInvoiceFees(amountRequested);
        setInvoiceFees(feeRequired);
      } else {
        setInvoiceFees(feeRequired);
      }
    };

    const onPressCancel = () => {
      cueInformativeHaptic();
      paymentRequestBottomSheetRef.current?.close();
      // clear values in state first?
    };

    const onPressContinue = () => {
      cueInformativeHaptic();
      paymentRequestBottomSheetRef.current?.close();
      // update invoice fees if necessary
      getFeesPayable().then();
      requestAnimationFrame(() => {
        navigate(Screens.ReceiveScreen, {
          amount: invoiceAmount,
          feesPayable: invoiceFees,
        });
      });
    };

    return (
      <BottomSheet
        ref={paymentRequestBottomSheetRef}
        index={-1}
        snapPoints={animatedSnapPoints}
        handleHeight={animatedHandleHeight}
        contentHeight={animatedContentHeight}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.handle}
      >
        <View style={[styles.container, { paddingBottom }]} onLayout={handleContentLayout}>
          <View style={styles.cancelBtn}>
            <CancelButton onCancel={onPressCancel} />
          </View>
          <View style={styles.iconContainer}>
            <Icon name="icon-arrow-down" style={styles.actionIcon} />
          </View>
          <Text style={styles.title}>{t('New payment request')}</Text>
          <FormInput
            label={t('Amount')}
            style={styles.amount}
            onChangeText={setInvoiceAmount}
            value={invoiceAmount}
            enablesReturnKeyAutomatically={true}
            placeholder="Amount in sats" // should pass value of amount from receive Screen
            multiline={false}
            keyboardType={'decimal-pad'}
          />
          <Button
            title="Continue"
            onPress={onPressContinue}
            size="default"
            appearance="filled"
            style={styles.button}
            disabled={!invoiceAmount}
          />
        </View>
      </BottomSheet>
    );
  }, [
    animatedSnapPoints,
    animatedHandleHeight,
    animatedContentHeight,
    renderBackdrop,
    paddingBottom,
    handleContentLayout,
    t,
    invoiceAmount,
    totalReceivable,
    amountRequested,
    invoiceFees,
  ]);

  // const feeInfoDisplay = useMemo(() => {
  //   const zeroAmountFees = `Your receive limit is ${totalReceivable} sats. Receiving more than this will incure a fee.`;
  //   const noFeesText = `No fees will be charged to receive this payment as it is under your receive limit of ${totalReceivable} sats.`;
  //   const withFeesText = `The amount exceeds your receive limit of ${totalReceivable} sats. A fee of ${invoiceFees} sats will be charged to increase this limit.`;
  //   if (invoiceFees === 0) {
  //     return <Text style={styles.maxReceive}>{noFeesText}</Text>;
  //   } else if (amountRequested === 0 && invoiceFees === 0) {
  //     return <Text style={styles.maxReceive}>{zeroAmountFees}</Text>;
  //   } else {
  //     return <Text style={styles.maxReceive}>{withFeesText}</Text>;
  //   }
  // }, [totalReceivable, invoiceFees, amountRequested]);

  const feeInfoDisplay = useMemo(() => {
    let feesText: string;
    if (invoiceFees === 0) {
      feesText = `No fees will be charged to receive this payment as it is under your receive limit of ${totalReceivable} sats.`;
    } else {
      feesText = `The amount exceeds your receive limit of ${totalReceivable} sats. A fee of ${invoiceFees} sats will be charged to increase this limit.`;
    }

    return <Text style={styles.maxReceive}>{feesText}</Text>;
  }, [totalReceivable, invoiceFees]);

  const expiration = receiveProps.expiresOn!;

  const DetailedInvoiceBottomSheet = useMemo(() => {
    const onPressCancel = () => {
      cueInformativeHaptic();
      paymentRequestBottomSheetRef.current?.close();
      // clear values in state first?
    };

    return (
      <BottomSheet
        ref={paymentRequestBottomSheetRef}
        index={-1}
        snapPoints={animatedSnapPoints}
        handleHeight={animatedHandleHeight}
        contentHeight={animatedContentHeight}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.handle}
      >
        <View style={[styles.container, { paddingBottom }]} onLayout={handleContentLayout}>
          <View style={styles.cancelBtn}>
            <CancelButton onCancel={onPressCancel} />
          </View>
          <FormInput
            label={t('Amount')}
            style={styles.amount}
            onChangeText={setInvoiceAmount}
            value={invoiceAmount}
            enablesReturnKeyAutomatically={true}
            placeholder="Amount in sats" // should pass value of amount from receive Screen
            multiline={false}
            keyboardType={'decimal-pad'}
            editable={false}
          />
          <View style={styles.field}>
            <FormLabel style={{ marginBottom: 10 }}>Fees</FormLabel>
            {feeInfoDisplay}
          </View>
          {/* @TODO: Add a section to select sender from the contact list */}
          <FormInput
            label={t('Sender')}
            style={styles.field}
            onChangeText={setSenderName}
            value={senderName}
            enablesReturnKeyAutomatically={true}
            placeholder={t('Who will make this payment?')!}
            multiline={false}
          />
          <View style={styles.field}>
            <Text style={styles.maxReceive}>{`This request will expire on ${expiration}`}</Text>
          </View>
        </View>
      </BottomSheet>
    );
  }, [
    animatedSnapPoints,
    animatedHandleHeight,
    animatedContentHeight,
    renderBackdrop,
    paddingBottom,
    handleContentLayout,
    t,
    invoiceAmount,
    feeInfoDisplay,
    senderName,
    expiration,
  ]);

  return {
    openPaymentRequestSheet,
    newPaymentRequestBottomSheet,
    DetailedInvoiceBottomSheet,
  };
};

const styles = StyleSheet.create({
  handle: {
    backgroundColor: Colors.orange.base,
  },
  container: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  title: {
    ...TypographyPresets.Header5,
    marginBottom: 16,
    textAlign: 'center',
  },
  amount: {
    marginVertical: 5,
  },
  timeCreated: {
    ...TypographyPresets.Body5,
    textAlign: 'center',
    marginBottom: 32,
  },
  maxReceive: {
    ...TypographyPresets.Body5,
    color: Colors.neutrals.light.neutral7,
  },
  button: {
    justifyContent: 'center',
    marginVertical: 16,
  },
  field: {
    marginVertical: 10,
  },
  expiry: {
    ...TypographyPresets.Body5,
    marginVertical: 20,
  },
  cancelBtn: {
    marginBottom: 5,
    alignItems: 'flex-end',
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
    marginBottom: 10,
  },
});

export default usePaymentRequestBottomSheet;
