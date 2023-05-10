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

interface Props {
  amountInSats?: string;
  description?: string;
}
const usePaymentRequestBottomSheet = (receiveProps: Props) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const paddingBottom = Math.max(insets.bottom, 24);

  const [newAmount, setNewAmount] = useState('0');
  const [newDescription, setNewDescription] = useState(`Request for ${newAmount} sats`);
  const [modifiedAmount, setModifiedAmount] = useState(receiveProps.amountInSats);
  const [senderName, setSenderName] = useState('');
  const [modifiedDescription, setModifiedDescription] = useState(
    receiveProps.description
      ? receiveProps.description
      : `Payment request for ${modifiedAmount} sats`
  );

  // @TODO: get remote balance programatically
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [maxReceivable, setMaxReceivable] = useState(20000);

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

  const maxReceiveColor =
    parseInt(modifiedAmount!, 10)! < maxReceivable
      ? Colors.neutrals.light.neutral5
      : Colors.red.base;

  const newPaymentRequestBottomSheet = useMemo(() => {
    const onPressCancel = () => {
      cueInformativeHaptic();
      paymentRequestBottomSheetRef.current?.close();
      // clear values in state first?
    };

    const onPressContinue = () => {
      cueInformativeHaptic();
      paymentRequestBottomSheetRef.current?.close();
      navigate(Screens.ReceiveScreen, {
        amount: newAmount,
        description: newDescription,
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
            onChangeText={setNewAmount}
            value={newAmount}
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
            label={t('Description')}
            style={styles.field}
            onChangeText={setNewDescription}
            value={newDescription}
            enablesReturnKeyAutomatically={true}
            placeholder={t('What is this transaction for?')!}
            maxLength={25}
            multiline={false}
          />
          <Button
            title="Continue"
            onPress={onPressContinue}
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
    newAmount,
    maxReceiveColor,
    maxReceivable,
    newDescription,
  ]);

  const ModifyInvoiceBottomSheet = useMemo(() => {
    const onPressCancel = () => {
      cueInformativeHaptic();
      paymentRequestBottomSheetRef.current?.close();
      // clear values in state first?
    };

    const onPressUpdate = () => {
      cueInformativeHaptic();
      //@todo: validate amount. Should not exceed remote balance
      // update the invoice in state and return to receive screen
      paymentRequestBottomSheetRef.current?.close();
      navigate(Screens.ReceiveScreen, {
        amount: modifiedAmount ? modifiedAmount : newAmount,
        description: modifiedDescription ? modifiedDescription : newDescription,
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
          <Text style={styles.title}>{t('Update payment request')}</Text>
          <FormInput
            label={t('Amount')}
            style={styles.amount}
            onChangeText={setModifiedAmount}
            value={modifiedAmount}
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
          <FormInput
            label={t('Description')}
            style={styles.field}
            onChangeText={setModifiedDescription}
            value={modifiedDescription}
            enablesReturnKeyAutomatically={true}
            placeholder={t('What is this transaction for?')!}
            maxLength={25}
            multiline={false}
          />
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
          {/* Add tags to invoice */}
          <FormInput
            label={t('Tags')}
            style={styles.field}
            onChangeText={setSenderName}
            value={senderName}
            enablesReturnKeyAutomatically={true}
            placeholder={t('Attach tags to this request')!}
            multiline={false}
          />
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
    modifiedAmount,
    maxReceiveColor,
    maxReceivable,
    modifiedDescription,
    senderName,
    newAmount,
    newDescription,
  ]);

  return {
    openPaymentRequestSheet,
    newPaymentRequestBottomSheet,
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
    marginBottom: 16,
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
