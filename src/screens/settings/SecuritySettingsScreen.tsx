import React, { useLayoutEffect } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { SettingsItemSwitch, SettingsItemWithTextValue } from '../../components/InfoListItem';
import { HeaderTitleWithSubtitle, headerWithBackButton } from '../../navigation/Headers';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ensurePincode, navigate } from '../../navigation/NavigationService';
import { Screens } from '../../navigation/Screens';
import { useStoreDispatch, useStoreState } from '../../state/hooks';
import { useTranslation } from 'react-i18next';
import { PinType } from '../../utils/types';
import { removeStoredPin, setPincodeWithBiometry } from '../../utils/pin/auth';
import { cueInformativeHaptic } from '../../utils/accessibility/haptics';

const SecuritySettingsScreen = ({ navigation }) => {
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => <HeaderTitleWithSubtitle title="Security" />,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const supportedBiometryType = useStoreState((state) => state.app.supportedBiometryType);
  const pincodeType = useStoreState((state) => state.nuxt.pincodeType);

  const { t } = useTranslation();
  const dispatch = useStoreDispatch();

  const onBiometryToggle = async (switchOn: boolean) => {
    cueInformativeHaptic();
    try {
      if (switchOn) {
        await setPincodeWithBiometry();
        dispatch.nuxt.setPincodeType(PinType.Device);
      } else {
        await removeStoredPin();
        dispatch.nuxt.setPincodeType(PinType.Custom);
      }
    } catch (e) {}
  };

  const onPressChangePin = async () => {
    cueInformativeHaptic();
    const pinIsCorrect = await ensurePincode();
    if (pinIsCorrect) {
      navigate(Screens.SetPinScreen, { changePin: true });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <SettingsItemWithTextValue title="Change PIN" onPress={onPressChangePin} withChevron={true} />
      {supportedBiometryType && (
        <SettingsItemSwitch
          title={t('biometry.title', {
            biometryType: t(`biometry.type.${supportedBiometryType}`),
          })}
          value={pincodeType === PinType.Device}
          onValueChange={onBiometryToggle}
          details="Use biometrics to perform spending actions securely"
        />
      )}
    </SafeAreaView>
  );
};

SecuritySettingsScreen.navigationOptions = {
  ...headerWithBackButton,
  ...Platform.select({
    ios: { animation: 'slide_from_bottom' },
  }),
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    textAlign: 'center',
  },
});

export default SecuritySettingsScreen;
