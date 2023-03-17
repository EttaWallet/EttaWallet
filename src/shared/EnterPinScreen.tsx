/**
 * This is a react navigation SCREEN to which we navigate,
 * when we need to fetch a PIN from a user.
 */
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ErrorMessages } from '../utils/errors';
import { headerWithBackButton } from '../navigation/Headers';
import { modalScreenOptions } from '../navigation/Navigator';
import type { Screens } from '../navigation/Screens';
import type { StackParamList } from '../navigation/types';
import { checkPin, DEFAULT_CACHE_ACCOUNT } from '../utils/pin/auth';
import { Pincode } from '../components/pincode'; // revert to etta component after merging changes

type Props = NativeStackScreenProps<StackParamList, Screens.EnterPinScreen>;

export const EnterPin = ({ route }: Props) => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const account = route.params.account;
    if (withVerification && account) {
      if (await checkPin(pin, account)) {
        console.log('checking..', await checkPin(pin, account));
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
        subtitle={t('pincode.confirmPin')!}
        errorText={errorText}
        pin={pin}
        onChangePin={onChangePin}
        onCompletePin={onPressConfirm}
      />
    </SafeAreaView>
  );
};

EnterPin.navigationOptions = () => ({
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

export default EnterPin;
