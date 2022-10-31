import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Button, { BtnSizes } from './Button';
import { navigate } from '../navigation/NavigationService';
import colors from '../styles/colors';
import variables from '../styles/variables';

const StartTransactionButtons = () => {
  const sendButtonsDisabled = true; // or false
  const requestButtonDisabled = true; // or false

  const onPressSend = () => {
    navigate('SendBitcoin');
  };

  const onPressRequest = () => {
    navigate('SendBitcoin', { isOutgoingPaymentRequest: true });
  };

  const onPressQrCode = () => {
    navigate('QRNavigator');
  };

  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Button
        style={styles.button}
        size={BtnSizes.MEDIUM}
        text={t('send')}
        onPress={onPressSend}
        disabled={sendButtonsDisabled}
      />
      <Button
        style={[styles.button, styles.requestButton]}
        size={BtnSizes.MEDIUM}
        text={t('request')}
        onPress={onPressRequest}
        disabled={requestButtonDisabled}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: variables.contentPadding,
    paddingVertical: 12,
    borderTopColor: colors.gray2,
    borderTopWidth: 1,
  },
  button: {
    flex: 1,
    flexDirection: 'column',
  },
  requestButton: {
    marginHorizontal: 12,
  },
});

export default StartTransactionButtons;
