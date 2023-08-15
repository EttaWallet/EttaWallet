import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import i18n from '../i18n';
import {
  HeaderTitleWithSubtitle,
  initNavigationOptions,
  initOnboardingNavigationOptions,
} from '../navigation/Headers';
import { navigate, popToScreen } from '../navigation/NavigationService';
import { Screens } from '../navigation/Screens';
import type { StackParamList } from '../navigation/types';
import { DEFAULT_CACHE_ACCOUNT, isPinValid, updatePin } from '../utils/pin/auth';
import { getCachedPin, setCachedPin } from '../utils/pin/PasswordCache';
import { useStoreDispatch, useStoreState } from '../state/hooks';
import { Colors } from 'etta-ui';
import type { RouteProp } from '@react-navigation/core';
import { Pincode } from '../components/pincode';
import { showErrorBanner, showSuccessBanner } from '../utils/alerts';
import { cueErrorHaptic, cueSuccessHaptic } from '../utils/accessibility/haptics';
import { PinType } from '../utils/types';

type ScreenProps = NativeStackScreenProps<StackParamList, Screens.SetPinScreen>;

const SetPinScreen = ({ route, navigation }: ScreenProps) => {
  const { t } = useTranslation();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [oldPin, setOldPin] = useState<string>('');
  const [pin1, setPin1] = useState<string>('');
  const [pin2, setPin2] = useState<string>('');
  const [errorText, setErrorText] = useState<string | undefined>(undefined);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // grab from rootState
  const restoreWallet = useStoreState((state) => state.nuxt.choseRestoreWallet);
  const supportedBiometryType = useStoreState((state) => state.app.supportedBiometryType);
  const skippedBiometrics = useStoreState((state) => state.app.skippedBiometrics);
  const enabledBiometrics = useStoreState((state) => state.app.biometricsEnabled);
  const nodeIsUp = useStoreState((state) => state.lightning.nodeStarted);
  const pincodeType = useStoreState((state) => state.nuxt.pincodeType);

  const changePin = route.params?.changePin;

  const dispatch = useStoreDispatch();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => {
        let title = i18n.t('pincode.create');
        if (changePin) {
          title = i18n.t('pincode.changePIN');
        }
        return <HeaderTitleWithSubtitle title={title} />;
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isChangingPin = () => {
    return changePin;
  };

  useEffect(() => {
    if (isChangingPin()) {
      setOldPin(getCachedPin(DEFAULT_CACHE_ACCOUNT) ?? '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigateToNextScreen = () => {
    if (isChangingPin()) {
      navigate(Screens.SecuritySettingsScreen);
    } else if (
      supportedBiometryType !== null &&
      skippedBiometrics === false &&
      enabledBiometrics === false
    ) {
      navigate(Screens.EnableBiometryScreen);
    } else if (restoreWallet) {
      popToScreen(Screens.WelcomeScreen);
      navigate(Screens.RestoreWalletScreen);
    } else if (nodeIsUp === false) {
      // proceed to launch LDK node
      navigate(Screens.StartLdkScreen);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-shadow
  const onChangePin1 = (pin1: string) => {
    setPin1(pin1);
  };

  // eslint-disable-next-line @typescript-eslint/no-shadow
  const onChangePin2 = (pin2: string) => {
    setPin2(pin2);
  };

  const isPin1Valid = (pin: string) => {
    return isPinValid(pin);
  };

  const isPin2Valid = (pin: string) => {
    return pin1 === pin;
  };

  const onCompletePin1 = () => {
    if (isPin1Valid(pin1)) {
      setErrorText('');
      setIsVerifying(true);
    } else {
      setPin1('');
      setPin2('');
      setErrorText(t('pincode.invalidPin')!);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-shadow
  const onCompletePin2 = async (pin2: string) => {
    if (isPin1Valid(pin1) && isPin2Valid(pin2)) {
      // usually via settings
      if (isChangingPin()) {
        const updated = await updatePin(pin2);
        if (updated) {
          cueSuccessHaptic();
          showSuccessBanner({
            message: 'PIN changed successfully',
          });
        } else {
          cueErrorHaptic();
          showErrorBanner({
            message: 'Could not change your PIN',
          });
        }
      } else {
        setCachedPin(DEFAULT_CACHE_ACCOUNT, pin1);
        // temporary fix for weird bug that keeps returning to change state to custom
        if (pincodeType === PinType.Unset) {
          dispatch.nuxt.setPincodeType(PinType.Custom);
          console.log('@setpinscreen: set pintype to custom');
        }
      }
      navigateToNextScreen();
    } else {
      setIsVerifying(false);
      setPin1('');
      setPin2('');
      setErrorText(t('pincode.pinsDontMatch')!);
    }
  };

  const changingPin = isChangingPin();

  return (
    <SafeAreaView style={styles.container}>
      {isVerifying ? (
        <Pincode
          title={changingPin ? undefined : t('pincode.guideConfirm')!}
          subtitle={changingPin ? t('pincode.verify')! : t('pincode.guideSubtitle')!}
          errorText={errorText}
          pin={pin2}
          onChangePin={onChangePin2}
          onCompletePin={onCompletePin2}
        />
      ) : (
        <Pincode
          title={changingPin ? undefined : t('pincode.guideTitle')!}
          subtitle={changingPin ? t('pincode.createNew')! : t('pincode.guideSubtitle')!}
          errorText={errorText}
          pin={pin1}
          onChangePin={onChangePin1}
          onCompletePin={onCompletePin1}
        />
      )}
    </SafeAreaView>
  );
};

SetPinScreen.navigationOptions = ({
  route,
}: {
  route: RouteProp<StackParamList, Screens.SetPinScreen>;
}) => {
  const changePin = route.params?.changePin;
  changePin ? initNavigationOptions : initOnboardingNavigationOptions;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.common.white,
    justifyContent: 'center',
    marginBottom: 40,
  },
});

export default SetPinScreen;
