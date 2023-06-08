import BottomSheet, {
  BottomSheetBackdrop,
  useBottomSheetDynamicSnapPoints,
} from '@gorhom/bottom-sheet';
import { Colors, TypographyPresets } from 'etta-ui';
import React, { useCallback, useMemo, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CancelButton from '../navigation/components/CancelButton';
import { cueInformativeHaptic } from '../utils/accessibility/haptics';
import FormLabel from './form/Label';
import TotalAmountDisplay from './amount/TotalAmountDisplay';

interface Props {
  amountInSats?: string;
  feesPayable?: number;
  expiresOn?: string;
}
const usePaymentRequestBottomSheet = (receiveProps: Props) => {
  const insets = useSafeAreaInsets();
  const paddingBottom = Math.max(insets.bottom, 24);

  const invoiceAmount = receiveProps.amountInSats!;

  const feeEstimate = receiveProps.feesPayable!;

  const totalAmount = parseInt(invoiceAmount, 10) + feeEstimate;

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
          <View style={styles.field}>
            <FormLabel style={styles.label}>Invoice Amount</FormLabel>
            <Text style={styles.amount}>{invoiceAmount} sats</Text>
          </View>
          {feeEstimate !== 0 ? (
            <>
              <View style={styles.field}>
                <FormLabel style={styles.label}>Estimated fee</FormLabel>
                <Text style={styles.amount}>{feeEstimate} sats</Text>
              </View>
              <View style={styles.field}>
                <FormLabel style={styles.label}>Total incl. fees</FormLabel>
                <TotalAmountDisplay totalAmount={totalAmount} usingLocalCurrency={false} />
              </View>
            </>
          ) : null}
          {/* @TODO: Add a section to select sender from the contact list
          <FormInput
            label={t('Sender')}
            style={styles.field}
            onChangeText={setSenderName}
            value={senderName}
            enablesReturnKeyAutomatically={true}
            placeholder={t('Who will make this payment?')!}
            multiline={false}
          /> */}
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
    invoiceAmount,
    feeEstimate,
    totalAmount,
    expiration,
  ]);

  return {
    openPaymentRequestSheet,
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
    ...TypographyPresets.Header4,
    color: Colors.common.black,
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
  label: {
    ...TypographyPresets.Body4,
    marginBottom: 10,
    color: Colors.common.black,
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
