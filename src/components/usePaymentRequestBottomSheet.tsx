import BottomSheet, {
  BottomSheetBackdrop,
  useBottomSheetDynamicSnapPoints,
} from '@gorhom/bottom-sheet';
import { Button, Colors, TypographyPresets } from 'etta-ui';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { navigate } from '../navigation/NavigationService';
import { Screens } from '../navigation/Screens';
import FormInput from './form/Input';
import i18n from '../i18n';
import { humanizeTimestamp } from '../utils/time';

interface Props {
  amountInSats?: number;
  timestamp?: number; // since unix epoch
  valid_for?: number;
}
const usePaymentRequestBottomSheet = (invoiceProps: Props) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const paddingBottom = Math.max(insets.bottom, 24);

  const [invoiceAmount, setInvoiceAmount] = useState(invoiceProps.amountInSats?.toString());
  const [senderName, setSenderName] = useState('');
  const [invoiceNote, setInvoiceNote] = useState(
    senderName
      ? `Pay invoice for ${invoiceAmount} sats from ${senderName}`
      : `Pay invoice for ${invoiceAmount} sats`
  );

  // @TODO: get remote balance programatically
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [maxReceivable, setMaxReceivable] = useState(20000);

  // handling updates via bottomSheet
  const [modifiedAmount, setModifiedAmount] = useState(0);
  const [modifiedDescription, setModifiedDescription] = useState('');

  // get human readable date/time strings for invoice timestamp and expiry
  const invoiceCreated = humanizeTimestamp(invoiceProps.timestamp!, i18n);
  // get expiry in epoch time as sum of timestamp/duration_since_epoch and expiry
  const invoiceExpires = humanizeTimestamp(invoiceProps.timestamp! + invoiceProps.valid_for!, i18n);

  const bottomSheetRef = useRef<BottomSheet>(null);

  const initialSnapPoints = useMemo(() => ['CONTENT_HEIGHT'], []);
  const { animatedHandleHeight, animatedSnapPoints, animatedContentHeight, handleContentLayout } =
    useBottomSheetDynamicSnapPoints(initialSnapPoints);

  const openSheet = () => {
    bottomSheetRef.current?.snapToIndex(0);
  };

  const renderBackdrop = useCallback(
    (props) => (
      // added opacity here, default is 0.5
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.2} />
    ),
    []
  );

  const maxReceiveColor =
    parseInt(invoiceAmount!, 10)! < maxReceivable
      ? Colors.neutrals.light.neutral5
      : Colors.red.base;

  const ModifyInvoiceBottomSheet = useMemo(() => {
    const onPressUpdate = () => {
      //@todo: validate amount. Should not exceed remote balance
      // update the invoice in state and return to receive screen
      setModifiedAmount(parseInt(invoiceAmount!, 10));
      setModifiedDescription(invoiceNote);
      bottomSheetRef.current?.close();
      navigate(Screens.ReceiveScreen, {
        modifiedAmount: modifiedAmount ? modifiedAmount : parseInt(invoiceAmount!, 10),
        modifiedDescription: modifiedDescription ? modifiedDescription : invoiceNote,
      });
    };

    return (
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={animatedSnapPoints}
        handleHeight={animatedHandleHeight}
        contentHeight={animatedContentHeight}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.handle}
      >
        <View style={[styles.container, { paddingBottom }]} onLayout={handleContentLayout}>
          <Text style={styles.title}>{t('Update payment request')}</Text>
          <Text style={styles.timeCreated}>{`Created on ${invoiceCreated}`}</Text>
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
          {/* Calculate total amount receivable and validate on input
           * This text should be clickable for more information bottom sheet about remote balance
           */}
          <Text
            style={[styles.maxReceive, { color: maxReceiveColor }]}
          >{`The maximum amount you can receive is ${maxReceivable} sats`}</Text>
          {/* @TODO: Add a section to select sender from the contact list */}
          <FormInput
            label={t('Your name')}
            style={styles.field}
            onChangeText={setSenderName}
            value={senderName}
            enablesReturnKeyAutomatically={true}
            placeholder={t('Your name/nym for the sender')!}
            multiline={false}
          />
          <FormInput
            label={t('Note')}
            style={styles.field}
            onChangeText={setInvoiceNote}
            value={invoiceNote}
            enablesReturnKeyAutomatically={true}
            placeholder={t('Short note for the sender (max 25chars)')!}
            maxLength={25}
            multiline={false}
          />
          {/* Add tags to invoice */}
          <Text style={styles.expiry}>{`This request will expire on ${invoiceExpires}`}</Text>
          <Button
            title="Update"
            onPress={onPressUpdate}
            size="default"
            appearance="filled"
            style={styles.button}
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
    invoiceCreated,
    invoiceAmount,
    maxReceiveColor,
    maxReceivable,
    senderName,
    invoiceNote,
    invoiceExpires,
    modifiedAmount,
    modifiedDescription,
  ]);

  return {
    openSheet,
    ModifyInvoiceBottomSheet,
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
    ...TypographyPresets.Header4,
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
    marginBottom: 16,
  },
  button: {
    justifyContent: 'center',
    marginBottom: 16,
  },
  field: {
    marginVertical: 10,
  },
  expiry: {
    ...TypographyPresets.Body5,
    marginVertical: 20,
  },
});

export default usePaymentRequestBottomSheet;
