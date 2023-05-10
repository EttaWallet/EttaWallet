import BottomSheet, {
  BottomSheetBackdrop,
  useBottomSheetDynamicSnapPoints,
} from '@gorhom/bottom-sheet';
import { Button, Colors, Icon, TypographyPresets } from 'etta-ui';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FormInput from './form/Input';
import CancelButton from '../navigation/components/CancelButton';
import { cueInformativeHaptic } from '../utils/accessibility/haptics';
import { ListItemWithIcon } from './InfoListItem';
import Clipboard from '@react-native-clipboard/clipboard';
import { processInputData } from '../utils/lightning/decode';
import { navigate } from '../navigation/NavigationService';
import { Screens } from '../navigation/Screens';

interface Props {
  amountInSats?: string;
  paymentRequest?: string;
}

const useSendBottomSheet = (sendProps: Props) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const paddingBottom = Math.max(insets.bottom, 24);

  const [sendInvoice, setSendInvoice] = useState(sendProps.paymentRequest);
  const [sendAmount, setSendAmount] = useState(sendProps.amountInSats);

  const sendBottomSheetRef = useRef<BottomSheet>(null);
  const sendOptionsBottomSheetRef = useRef<BottomSheet>(null);

  const initialSnapPoints = useMemo(() => ['CONTENT_HEIGHT'], []);
  const { animatedHandleHeight, animatedSnapPoints, animatedContentHeight, handleContentLayout } =
    useBottomSheetDynamicSnapPoints(initialSnapPoints);

  const openOptionsSheet = () => {
    sendOptionsBottomSheetRef.current?.snapToIndex(0);
  };

  const openSendSheet = () => {
    sendBottomSheetRef.current?.snapToIndex(0);
  };

  const renderBackdrop = useCallback(
    (props) => (
      // added opacity here, default is 0.5
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.2} />
    ),
    []
  );

  const handlePaste = useCallback(async (txt: string) => {
    let clipboardData = txt;
    if (!clipboardData) {
      clipboardData = await Clipboard.getString();
    }
    if (!clipboardData) {
      // should be a public toast error
      console.log('There is nothing on your clipboard!');
      sendOptionsBottomSheetRef.current?.expand();
      //   sendBottomSheetRef.current?.expand();
      return;
    }
    // close bottom sheet
    // sendOptionsBottomSheetRef.current?.close();
    const result = await processInputData({
      data: clipboardData,
    });

    if (result.isErr()) {
      // should be a public toast errorr
      console.log("we couldn't process your clipboard");
    }
  }, []);

  const sendOptionsBottomSheet = useMemo(() => {
    const onPressPaste = () => {
      cueInformativeHaptic();
      // get pasted string from clipboard
      // process that input
      // if valid lighting address, proceed to detail screen
      handlePaste('').then();
      console.info('@SendOptions: chose paste');
      //   sendOptionsBottomSheetRef.current?.close();
    };

    const onPressManual = () => {
      cueInformativeHaptic();
      // get pasted string from clipboard
      console.info('@Sendoptions: chose manual');
      //   sendOptionsBottomSheetRef.current?.close();
    };

    const onPressImage = () => {
      cueInformativeHaptic();
      // get image from device media
      console.info('@SendOptions: chose image');
      //   sendOptionsBottomSheetRef.current?.close();
    };

    const onPressScan = () => {
      cueInformativeHaptic();
      sendOptionsBottomSheetRef.current?.close();
      navigate(Screens.ScanQRCodeScreen);
    };

    const onPressContact = () => {
      cueInformativeHaptic();
      // open scanner
      console.info('@SendOptions: chose contacts');
      //   sendOptionsBottomSheetRef.current?.close();
    };

    return (
      <BottomSheet
        ref={sendOptionsBottomSheetRef}
        index={-1}
        snapPoints={animatedSnapPoints}
        handleHeight={animatedHandleHeight}
        contentHeight={animatedContentHeight}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.handle}
      >
        <View style={[styles.container, { paddingBottom }]} onLayout={handleContentLayout}>
          {/* options list */}
          <ListItemWithIcon
            title="Paste from clipboard"
            withIcon={true}
            icon="icon-copy-2"
            onPress={onPressPaste}
          />
          <ListItemWithIcon
            title="Scan QR Code"
            withIcon={true}
            icon="icon-scan"
            onPress={onPressScan}
          />
          <ListItemWithIcon
            title="Choose image"
            subtitle="From device's media library"
            withIcon={true}
            icon="icon-qr-code"
            onPress={onPressImage}
          />
          <ListItemWithIcon
            title="Select contact"
            subtitle="Pick recipient from your contact list"
            withIcon={true}
            icon="icon-contacts-2"
            onPress={onPressContact}
          />
          <ListItemWithIcon
            title="Manual input"
            subtitle="Enter lightning address or invoice"
            withIcon={true}
            icon="icon-password-2"
            onPress={onPressManual}
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
    handlePaste,
  ]);

  const sendBitcoinBottomSheet = useMemo(() => {
    const onPressContinue = () => {
      cueInformativeHaptic();
      sendBottomSheetRef.current?.close();
      // pay invoice and navigate to success screen
    };

    const onPressCancel = () => {
      cueInformativeHaptic();
      sendBottomSheetRef.current?.close();
      // clear values in state first?
    };

    return (
      <BottomSheet
        ref={sendBottomSheetRef}
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
            <Icon name="icon-arrow-up" style={styles.actionIcon} />
          </View>
          <Text style={styles.title}>{t('Send bitcoin')}</Text>
          <FormInput
            label={t('Amount')}
            style={styles.amount}
            onChangeText={setSendAmount}
            value={sendAmount}
            enablesReturnKeyAutomatically={true}
            placeholder="Amount in sats" // should pass value of amount from receive Screen
            multiline={false}
            keyboardType={'decimal-pad'}
          />
          {/* @TODO: Add a section to select sender from the contact list */}
          <FormInput
            label={t('To')}
            style={styles.field}
            onChangeText={setSendInvoice}
            value={sendInvoice}
            enablesReturnKeyAutomatically={true}
            placeholder={t('Pick contact or paste invoice')!}
            multiline={true}
            numberOfLines={5}
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
    sendAmount,
    sendInvoice,
  ]);

  return {
    openSendSheet,
    sendBitcoinBottomSheet,
    openOptionsSheet,
    sendOptionsBottomSheet,
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

export default useSendBottomSheet;
