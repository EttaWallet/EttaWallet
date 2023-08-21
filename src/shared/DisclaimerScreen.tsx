/**
 * This is a VIEW, which we use as an overlay, when we need
 * to lock the app with a PIN code.
 */
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Platform, StyleSheet, Text, ScrollView } from 'react-native';
import { SafeAreaView, SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { TypographyPresets, Button } from 'etta-ui';
import { initNavigationOptions } from '../navigation/Headers';
import { useStoreActions } from '../state/hooks';
import { FAQ_LINK } from '../../config';
import { navigateToURI } from '../utils/helpers';
import { navigate } from '../navigation/NavigationService';
import { Screens } from '../navigation/Screens';
import { cueInformativeHaptic } from '../utils/accessibility/haptics';

const MARGIN = 40;

const DisclaimerScreen = () => {
  const { t } = useTranslation();

  const acknowledgedDisclaimer = useStoreActions((action) => action.nuxt.setAcknowledgedDisclaimer);

  const onPressGoToFAQ = () => {
    cueInformativeHaptic();
    navigateToURI(FAQ_LINK);
  };

  const onPressAccept = () => {
    cueInformativeHaptic();
    acknowledgedDisclaimer(true);
    goToNextScreen();
  };

  const goToNextScreen = () => {
    navigate(Screens.SetPinScreen);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{t('disclaimer.title')}</Text>
        <Text style={styles.disclaimer}>
          <Trans i18nKey={'disclaimer.info'}>
            <Text onPress={onPressGoToFAQ} style={styles.disclaimerLink} />
          </Trans>
        </Text>
      </ScrollView>
      <SafeAreaInsetsContext.Consumer>
        {(insets) => (
          <Button
            style={[styles.button, insets && insets.bottom <= MARGIN && { marginBottom: MARGIN }]}
            appearance="filled"
            size="default"
            title={t('disclaimer.acknowledgeBtn')}
            onPress={onPressAccept}
          />
        )}
      </SafeAreaInsetsContext.Consumer>
    </SafeAreaView>
  );
};

const topMargin = Platform.OS === 'ios' ? 60 : 30;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 40,
    marginHorizontal: 24,
  },
  title: {
    ...TypographyPresets.Header3,
    marginTop: topMargin,
  },
  disclaimer: {
    ...TypographyPresets.Body4,
    marginVertical: 10,
  },
  disclaimerLink: {
    textDecorationLine: 'underline',
  },
  button: {
    marginTop: MARGIN,
    marginHorizontal: 24,
    justifyContent: 'center',
  },
});

DisclaimerScreen.navigationOptions = {
  ...initNavigationOptions,
  ...Platform.select({
    ios: { animation: 'slide_from_bottom' },
  }),
};

export default DisclaimerScreen;
