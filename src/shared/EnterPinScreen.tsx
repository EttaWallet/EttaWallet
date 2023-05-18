import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { headerWithBackButton } from '../navigation/Headers';
import { modalScreenOptions } from '../navigation/Navigator';
import type { Screens } from '../navigation/Screens';
import type { StackParamList } from '../navigation/types';
import { DEFAULT_CACHE_ACCOUNT, checkPin } from '../utils/pin/auth';
import { Pincode } from '../components/pincode';
import { showErrorBanner } from '../utils/alerts';
import { cueErrorHaptic, cueSuccessHaptic } from '../utils/accessibility/haptics';

type Props = NativeStackScreenProps<StackParamList, Screens.EnterPinScreen>;

export const EnterPin = ({ route }: Props) => {
  const { t } = useTranslation();
  const [pinEntered, setPinEntered] = useState('');
  const [errorText, setErrorText] = useState<string | undefined>(undefined);
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
    setPinEntered(pin);
    setErrorText(undefined);
  };

  const onCorrectPin = (pin: string) => {
    cueSuccessHaptic();
    setPinIsCorrect(true);
    const onSuccess = route.params.onSuccess;
    if (onSuccess) {
      onSuccess(pin);
    }
  };

  const onWrongPin = () => {
    setPinEntered('');
    cueErrorHaptic();
    setErrorText('Incorrect PIN. Try again');
    showErrorBanner({
      title: 'Incorrect PIN.',
      message: 'Try again, carefully',
    });
  };

  const onPressConfirm = async () => {
    const account = route.params.account || DEFAULT_CACHE_ACCOUNT;
    if (await checkPin(pinEntered, account)) {
      console.log('checking..', await checkPin(pinEntered, account));
      onCorrectPin(pinEntered);
    } else {
      onWrongPin();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Pincode
        subtitle={t('pincode.confirmPin')!}
        errorText={errorText}
        pin={pinEntered}
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
