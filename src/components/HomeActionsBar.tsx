import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { navigate } from '../navigation/NavigationService';
import { Screens } from '../navigation/Screens';
import { HomeButton, Colors } from 'etta-ui';
import { moderateScale, verticalScale } from '../utils/sizing';
import { cueInformativeHaptic } from '../utils/accessibility/haptics';

interface Props {
  onPressRequest?: () => void;
  onPressSend?: () => void;
  onPressScan?: () => void;
}

export default function HomeActionsBar(props: Props) {
  const onPressSend = () => {
    cueInformativeHaptic();
    if (props.onPressSend) {
      props.onPressSend?.();
    } else {
      navigate(Screens.LightningChannelsIntroScreen);
    }
  };

  const onPressRequest = () => {
    cueInformativeHaptic();
    if (props.onPressRequest) {
      props.onPressRequest?.();
    } else {
      navigate(Screens.ReceiveScreen, {});
    }
  };

  const onPressQrCode = () => {
    cueInformativeHaptic();
    if (props.onPressScan) {
      props.onPressScan?.();
    } else {
      navigate(Screens.ScanQRCodeScreen, {});
    }
  };

  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <HomeButton style={styles.button} icon="icon-arrow-up" onPress={onPressSend}>
        {t('homeActions.send')}
      </HomeButton>
      <HomeButton style={styles.button} icon="icon-qr-code" onPress={onPressQrCode}>
        {t('homeActions.scanQR')}
      </HomeButton>
      <HomeButton style={styles.button} icon="icon-arrow-down" onPress={onPressRequest}>
        {t('homeActions.request')}
      </HomeButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(10),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(30),
    borderTopColor: Colors.neutrals.light.neutral4,
    borderTopWidth: 1,
  },
  button: {
    flex: 1,
    flexDirection: 'column',
    marginHorizontal: moderateScale(8),
  },
});
