import React, { useLayoutEffect } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { SettingsItemSwitch, SettingsItemWithTextValue } from '../../components/InfoListItem';
import { HeaderTitleWithSubtitle, headerWithBackButton } from '../../navigation/Headers';
import { SafeAreaView } from 'react-native-safe-area-context';
import { navigate } from '../../navigation/NavigationService';
import { Screens } from '../../navigation/Screens';
import locales from '../../i18n/locales';
import { useStoreDispatch, useStoreState } from '../../state/hooks';
import { useTranslation } from 'react-i18next';
import { cueInformativeHaptic } from '../../utils/accessibility/haptics';
import SectionTitle from '../../components/SectionTitle';

const GeneralSettingsScreen = ({ navigation, route }) => {
  const currentLanguage = useStoreState((state) => state.nuxt.language);
  const preferedCurrency = useStoreState((state) => state.nuxt.localCurrency);
  const hapticsEnabled = useStoreState((state) => state.accessibility.hapticsEnabled);
  const dispatch = useStoreDispatch();
  const { t } = useTranslation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => <HeaderTitleWithSubtitle title="General" />,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPressLanguage = () => {
    cueInformativeHaptic();
    navigate(Screens.LanguageModal, { nextScreen: route.name });
  };

  const onPressCurrency = () => {
    cueInformativeHaptic();
    navigate(Screens.CurrencyChooserScreen);
  };

  const onToggleHaptics = () => {
    cueInformativeHaptic();
    dispatch.accessibility.setHapticsStatus(!hapticsEnabled);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <SectionTitle title="Localisation" style={styles.sectionHeading} />
      <SettingsItemWithTextValue
        title="Language"
        value={locales[currentLanguage ?? '']?.name ?? t('unknown')!}
        withChevron={true}
        onPress={onPressLanguage}
      />
      <SettingsItemWithTextValue
        title="Local currency"
        value={preferedCurrency ? preferedCurrency : 'Not set'}
        withChevron={true}
        onPress={onPressCurrency}
      />
      <SectionTitle title="Units" style={styles.sectionHeading} />
      <SettingsItemWithTextValue
        title="Show bitcoin as"
        value="sats"
        withChevron={true}
        onPress={() => 0}
      />
      <SectionTitle title="Accessibility" style={styles.sectionHeading} />
      <SettingsItemSwitch
        title="Haptic feedback"
        value={hapticsEnabled}
        onValueChange={onToggleHaptics}
      />
    </SafeAreaView>
  );
};

GeneralSettingsScreen.navigationOptions = {
  ...headerWithBackButton,
  ...Platform.select({
    ios: { animation: 'slide_from_bottom' },
  }),
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  text: {
    textAlign: 'center',
  },
  sectionHeading: {
    marginTop: 20,
  },
});

export default GeneralSettingsScreen;
