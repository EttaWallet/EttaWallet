import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { navigate } from '../navigation/NavigationService';
import { Screens } from '../navigation/Screens';
import { HomeButton, Colors } from 'etta-ui';
import { moderateScale, verticalScale } from '../utils/sizing';

export default function HomeActionsBar() {
  const onPressSend = () => {
    navigate(Screens.TestScreen);
  };

  const onPressReceive = () => {
    navigate(Screens.ReceiveScreen);
  };

  const onPressQrCode = () => {
    navigate(Screens.TestScreen);
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
      <HomeButton style={styles.button} icon="icon-arrow-down" onPress={onPressReceive}>
        {t('homeActions.receive')}
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
