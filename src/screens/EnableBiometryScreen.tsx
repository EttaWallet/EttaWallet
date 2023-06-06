import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { HeaderTitleWithSubtitle, initOnboardingNavigationOptions } from '../navigation/Headers';
import { navigate } from '../navigation/NavigationService';
import { Screens } from '../navigation/Screens';
import type { StackParamList } from '../navigation/types';
import { setPincodeWithBiometry } from '../utils/pin/auth';
import { isUserCancelledError } from '../utils/keychain';
import Logger from '../utils/logger';
import { Button, Colors, TypographyPresets } from 'etta-ui';
import { useStoreDispatch, useStoreState } from '../state/hooks';
import SkipButton from '../navigation/components/SkipButton';
import { PinType } from '../utils/types';
import { BIOMETRY_TYPE } from 'react-native-keychain';
import { Face, FaceID, Fingerprint } from '../icons';

const TAG = 'EnableBiometry';

type Props = NativeStackScreenProps<StackParamList, Screens.EnableBiometryScreen>;

const biometryIconMap: { [key in BIOMETRY_TYPE]: JSX.Element } = {
  [BIOMETRY_TYPE.FACE_ID]: <FaceID />,
  [BIOMETRY_TYPE.TOUCH_ID]: <Fingerprint />, // use fingerprint icon
  [BIOMETRY_TYPE.FINGERPRINT]: <Fingerprint />,
  [BIOMETRY_TYPE.FACE]: <Face />,
  [BIOMETRY_TYPE.IRIS]: <FaceID />, // use faceID icon
};

export const EnableBiometry = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const dispatch = useStoreDispatch();

  const supportedBiometryType = useStoreState((state) => state.app.supportedBiometryType)!;
  const choseRestoreWallet = useStoreState((state) => state.nuxt.choseRestoreWallet);
  const nodeIsUp = useStoreState((state) => state.lightning.nodeStarted);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => <HeaderTitleWithSubtitle title={t('biometry.header')!} />,
      headerRight: () => <SkipButton onSkip={onPressSkip} />,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNavigateToNextScreen = () => {
    if (choseRestoreWallet) {
      navigate(Screens.RestoreWalletScreen);
    } else if (nodeIsUp === false) {
      // proceed to launch LDK node
      navigate(Screens.StartLdkScreen);
    } else {
      navigate(Screens.DrawerNavigator);
    }
    return;
  };

  const onPressUseBiometry = async () => {
    try {
      const response = await setPincodeWithBiometry();
      if (response.isOk()) {
        dispatch.nuxt.setPincodeType(PinType.Device);
        // @issue: state keeps reverting to false on reload
        dispatch.app.setEnabledBiometrics(true);
      }
      handleNavigateToNextScreen();
    } catch (error: any) {
      if (!isUserCancelledError(error)) {
        Logger.error(TAG, 'Error enabling biometry', error);
      }
    }
  };

  const onPressSkip = async () => {
    // @issue: state keeps reverting to false on reload
    dispatch.app.setSkippedBiometrics(true);
    handleNavigateToNextScreen();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {
          <>
            <View style={styles.biometryIcon}>{biometryIconMap[supportedBiometryType]}</View>
            <Text style={styles.guideTitle}>
              {t('biometry.title', {
                biometryType: t(`biometry.type.${supportedBiometryType}`),
              })}
            </Text>
            <Text style={styles.guideText}>{t('biometry.subtitle')}</Text>
          </>
        }
      </ScrollView>
      <SafeAreaInsetsContext.Consumer>
        {(insets) => (
          <>
            <Button
              onPress={onPressUseBiometry}
              title={t('biometry.cta', {
                biometryType: t(`biometry.type.${supportedBiometryType}`),
              })}
              appearance="filled"
              // eslint-disable-next-line react-native/no-inline-styles
              style={[styles.biometryButton, insets && insets.bottom <= 40 && { marginBottom: 10 }]}
            />
            <Button
              onPress={onPressSkip}
              title="Maybe later"
              appearance="outline"
              // eslint-disable-next-line react-native/no-inline-styles
              style={[styles.biometryButton, insets && insets.bottom <= 40 && { marginBottom: 40 }]}
            />
          </>
        )}
      </SafeAreaInsetsContext.Consumer>
    </SafeAreaView>
  );
};

export default EnableBiometry;

EnableBiometry.navigationOptions = initOnboardingNavigationOptions;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  biometryButton: {
    marginHorizontal: 40,
    justifyContent: 'center',
  },
  guideTitle: {
    ...TypographyPresets.Header2,
    marginBottom: 10,
    textAlign: 'center',
  },
  guideText: {
    ...TypographyPresets.Body4,
    textAlign: 'center',
    color: Colors.neutrals.light.neutral7,
  },
  biometryIcon: {
    alignItems: 'center',
    marginBottom: 24,
  },
  laterButton: {
    marginHorizontal: 40,
    justifyContent: 'center',
  },
});
