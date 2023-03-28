import React from 'react';
import { StyleSheet, SafeAreaView, View, Text } from 'react-native';
import { Button, Colors, TypographyPresets } from 'etta-ui';
import { noHeader } from '../navigation/Headers';
import { useTranslation } from 'react-i18next';
import locales from '../i18n/locales';
import { navigate, pushToStack } from '../navigation/NavigationService';
import { Screens } from '../navigation/Screens';
import { RouteProp, useRoute } from '@react-navigation/native';
import type { StackParamList } from '../navigation/types';
import { useStoreActions } from '../state/hooks';

const InitScreen = () => {
  const { t, i18n } = useTranslation();
  const currentLanguage = locales[i18n.language];
  const route = useRoute<RouteProp<StackParamList, keyof StackParamList>>();

  const setUserStarted = useStoreActions((action) => action.nuxt.saveUserStarted);

  const onPressLanguage = () => pushToStack(Screens.LanguageModal, { nextScreen: route.name });

  const onPressGetStarted = () => {
    // mark user got started
    setUserStarted(true);
    // navigate to next point
    requestAnimationFrame(() => {
      navigate(Screens.WelcomeScreen);
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.carousel} />
      <View style={{ paddingVertical: 50 }}>
        <Text style={styles.title}>{t('onboardingTitle')}</Text>
        <Button
          title={currentLanguage?.name ?? t('unknown')}
          appearance="transparent"
          icon="icon-globe"
          iconPosition="left"
          onPress={onPressLanguage}
        />
        <Button
          title="Accessibility"
          appearance="transparent"
          icon="icon-edit"
          iconPosition="left"
        />
        <Button
          style={styles.continueBtn}
          title={t('onboardingCTA')}
          appearance="filled"
          onPress={onPressGetStarted}
        />
      </View>
    </SafeAreaView>
  );
};

InitScreen.navigationOptions = noHeader;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    paddingHorizontal: 16,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f2f2f2',
  },
  carousel: {
    backgroundColor: Colors.neutrals.light.neutral4,
    paddingVertical: 50,
  },
  title: {
    ...TypographyPresets.Header1,
    margin: 16,
    color: '#401D18',
  },
  continueBtn: {
    marginVertical: 30,
    justifyContent: 'center',
  },
});

export default InitScreen;
