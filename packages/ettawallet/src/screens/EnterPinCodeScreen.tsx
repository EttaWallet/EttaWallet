/**
 * Request User for a PIN
 */
import { StackScreenProps } from '@react-navigation/stack';
import React, { useEffect, useState, useContext } from 'react';
import { EttaStorageContext } from '../../storage/context';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ErrorMessages } from '../utils/errors';
import { headerWithBackButton } from '../navigation/headers/Headers';
import { modalScreenOptions } from '../navigation/Navigation';
import { Screens } from '../navigation/Screens';
import { StackParamList } from '../navigation/types';
import { checkPin } from '../utils/auth';
import Pincode from '../components/Pincode/Pincode';

type Props = StackScreenProps<StackParamList, Screens.EnterPin>;

export const EnterPinCode = ({ route }: Props) => {
  const { t } = useTranslation();
  const [pin, setPin] = useState('');
  const [errorText, setErrorText] = useState(undefined);
  const [pinIsCorrect, setPinIsCorrect] = useState(false);

  useEffect(() => {
    return () => {
      const onCancel = route.params.onCancel;
      if (onCancel && !pinIsCorrect) {
        onCancel();
      }
    };
  }, []);

  const onChangePin = (pin: string) => {
    setPin(pin);
    setErrorText(undefined);
  };

  const onCorrectPin = (pin: string) => {
    setPinIsCorrect(true);
    const onSuccess = route.params.onSuccess;
    if (onSuccess) {
      onSuccess(pin);
    }
  };

  const onWrongPin = () => {
    setPin('');
    setErrorText(t(`${ErrorMessages.INCORRECT_PIN}`));
  };

  const onPressConfirm = async () => {
    const withVerification = route.params.withVerification;
    const { wallet } = useContext(EttaStorageContext) ?? route.params.wallet;
    if (withVerification && wallet) {
      if (await checkPin(pin, wallet)) {
        onCorrectPin(pin);
      } else {
        onWrongPin();
      }
    } else {
      onCorrectPin(pin);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Pincode
        title={t('confirmPin.title')}
        errorText={errorText}
        pin={pin}
        onChangePin={onChangePin}
        onCompletePin={onPressConfirm}
      />
    </SafeAreaView>
  );
};

EnterPinCode.navigationOptions = () => ({
  ...modalScreenOptions(),
  ...headerWithBackButton,
  gestureEnabled: false,
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
});

export default EnterPinCode;
