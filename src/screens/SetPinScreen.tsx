import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { useTranslation, WithTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PinType } from '../utils/types';
import i18n from '../i18n';
import {
  HeaderTitleWithSubtitle,
  initNavigationOptions,
  initOnboardingNavigationOptions,
} from '../navigation/Headers';
import { navigate, navigateClearingStack, popToScreen } from '../navigation/NavigationService';
import { Screens } from '../navigation/Screens';
import type { StackParamList } from '../navigation/types';
import { DEFAULT_CACHE_ACCOUNT, isPinValid, updatePin } from '../utils/pin/auth';
import { getCachedPin, setCachedPin } from '../utils/pin/PasswordCache';
import Logger from '../utils/logger';
import { useStoreState, useStoreActions } from '../state/hooks';
import { Colors } from 'etta-ui';
import type { RouteProp } from '@react-navigation/core';
import { Pincode } from '../components/pincode'; // revert to etta component after merging changes
import { setPinInKeyChain } from '../utils/keychain';

type ScreenProps = NativeStackScreenProps<StackParamList, Screens.SetPinScreen>;

type Props = ScreenProps & WithTranslation;

const SetPinScreen = ({ route }: Props) => {
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
  // dispatch action from rootState
  const setPinType = useStoreActions((action) => action.nuxt.savePinType);
  const nodeIsUp = useStoreState((state) => state.lightning.nodeStarted);

  useEffect(() => {
    if (isChangingPin()) {
      setOldPin(getCachedPin(DEFAULT_CACHE_ACCOUNT) ?? '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isChangingPin = () => {
    return route.params?.changePin;
  };

  const navigateToNextScreen = () => {
    if (isChangingPin()) {
      navigate(Screens.SettingsScreen);
    } else if (
      supportedBiometryType !== null &&
      skippedBiometrics === false &&
      enabledBiometrics !== false
    ) {
      navigate(Screens.EnableBiometryScreen);
    } else if (restoreWallet) {
      popToScreen(Screens.WelcomeScreen);
      navigate(Screens.RestoreWalletScreen);
    } else if (nodeIsUp === false) {
      // proceed to launch LDK node
      navigate(Screens.StartLN);
    } else {
      navigateClearingStack(Screens.DrawerNavigator);
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
          Logger.showMessage(t('pinChanged'));
        } else {
          Logger.showMessage(t('pinChangeFailed'));
        }
      } else {
        setCachedPin(DEFAULT_CACHE_ACCOUNT, pin1);
        await setPinInKeyChain(pin1);
        setPinType(PinType.Custom);
      }
      navigateToNextScreen();
    } else {
      if (isChangingPin()) {
      }
      setIsVerifying(false);
      setPin1('');
      setPin2('');
      setErrorText(t('pincode.pinsDontMatch')!);
    }
  };

  const changingPin = isChangingPin();

  return (
    <SafeAreaView style={changingPin ? styles.changePinContainer : styles.container}>
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
  return {
    ...(changePin ? initNavigationOptions : initOnboardingNavigationOptions),
    headerTitle: () => {
      let title = i18n.t('pincode.create');
      if (changePin) {
        title = i18n.t('pincode.changePIN');
      }
      return <HeaderTitleWithSubtitle title={title} />;
    },
  };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.common.white,
    justifyContent: 'space-between',
  },
  changePinContainer: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'space-between',
  },
});

export default SetPinScreen;
