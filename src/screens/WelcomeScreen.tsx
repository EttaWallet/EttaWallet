import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, TypographyPresets, Colors, Icon } from 'etta-ui';
import { SafeAreaView, View, StyleSheet, Text } from 'react-native';
import { navigate } from '../navigation/NavigationService';
import { Screens } from '../navigation/Screens';
import { initNavigationOptions } from '../navigation/Headers';
import LanguageChip from '../components/LanguageChip';
import { useStoreState, useStoreActions } from '../state/hooks';
import { APP_NAME } from '../../config';
import { PinType } from '../utils/types';
import { sleep } from '../utils/helpers';
import { createDefaultWallet } from '../utils/wallet';
import Logger from '../utils/logger';

const TAG = 'WelcomeScreen';

const WelcomeScreen = () => {
  const [creatingWallet, setCreatingWallet] = useState(false);
  const acknowledgedDisclaimer = useStoreState((state) => state.nuxt.acknowledgedDisclaimer);
  const pincodeType = useStoreState((state) => state.nuxt.pincodeType);
  const supportedBiometryType = useStoreState((state) => state.app.supportedBiometryType);
  const enabledBiometrics = useStoreState((state) => state.app.biometricsEnabled);
  const skippedBiometrics = useStoreState((state) => state.app.skippedBiometrics);
  const setChoseRestore = useStoreActions((action) => action.nuxt.setChoseRestoreWallet);

  const nodeIsUp = useStoreState((state) => state.lightning.nodeStarted);
  const nodeId = useStoreState((state) => state.lightning.nodeId);

  const navigateNext = () => {
    if (!acknowledgedDisclaimer) {
      navigate(Screens.Disclaimer);
    } else if (pincodeType === PinType.Unset) {
      navigate(Screens.SetPinScreen);
    } else if (
      supportedBiometryType !== null &&
      enabledBiometrics === false &&
      skippedBiometrics === false
    ) {
      navigate(Screens.EnableBiometryScreen);
      // check if node is available on device
    } else if (nodeIsUp === false || nodeId === '') {
      navigate(Screens.StartLN);
    } else {
      navigate(Screens.DrawerNavigator);
    }
  };

  const createWalletHandler = useCallback(async (): Promise<void> => {
    setCreatingWallet(true);
    await sleep(500); // wait
    const res = await createDefaultWallet({});
    if (res.isErr()) {
      setCreatingWallet(false);
      Logger.error(`${TAG}/createWalletHandler`, res.error.message);
    } else {
      // show success notification
      setCreatingWallet(false);
      // redirect when ready
      requestAnimationFrame(() => {
        navigateNext();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const restoreWalletHandler = () => {
    setChoseRestore(true);
    navigateNext();
  };

  const { t } = useTranslation();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headers}>
        <View style={styles.iconContainer}>
          <Icon name="icon-lightning" style={styles.appIcon} />
        </View>
        <Text style={styles.appName}>{APP_NAME}</Text>
        <Text style={styles.subtitle}>{t('welcome.subtitle')}</Text>
      </View>
      <View style={styles.buttonContainer}>
        <Button
          style={styles.button}
          title={!creatingWallet ? t('welcome.createNewWallet') : 'Creating wallet ...'}
          appearance="filled"
          onPress={createWalletHandler}
          disabled={creatingWallet}
        />
        <Button
          style={styles.button}
          title={t('welcome.restoreWallet')}
          appearance="transparent"
          onPress={restoreWalletHandler}
        />
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>{t('welcome.footer')}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    marginHorizontal: 32,
  },
  headers: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  iconContainer: {
    alignSelf: 'center',
    justifyContent: 'center',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#401D18',
    marginVertical: 20,
  },
  appIcon: {
    alignSelf: 'center',
    justifyContent: 'center',
    fontSize: 52,
    color: '#FF682C',
  },
  appName: {
    ...TypographyPresets.Header1,
    textAlign: 'center',
    color: '#401D18',
  },
  subtitle: {
    ...TypographyPresets.Body3,
    marginBottom: 50,
    textAlign: 'center',
    color: Colors.neutrals.light.neutral7,
  },
  buttonContainer: {
    marginTop: 100,
  },
  button: {
    marginBottom: 10,
    justifyContent: 'center',
  },
  footer: {
    flex: 1,
    position: 'relative',
    marginBottom: 32,
  },
  footerText: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 'auto',
  },
});

export default WelcomeScreen;

WelcomeScreen.navigationOptions = {
  ...initNavigationOptions,
  headerRight: () => <LanguageChip />,
};
