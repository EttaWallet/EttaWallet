import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { navigate } from '../navigation/NavigationService';
import { Screens } from '../navigation/Screens';
import { HomeButton, Colors } from 'etta-ui';

export default function HomeActionsBar() {
  const onPressSend = () => {
    navigate(Screens.TestScreen);
  };

  const onPressRequest = () => {
    navigate(Screens.TestScreen);
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
      <HomeButton style={styles.button} icon="icon-arrow-down" onPress={onPressRequest}>
        {t('homeActions.receive')}
      </HomeButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
    borderTopColor: Colors.neutrals.light.neutral4,
    borderTopWidth: 1,
  },
  button: {
    flex: 1,
    flexDirection: 'column',
    marginHorizontal: 8,
  },
});
