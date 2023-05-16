import React, { useLayoutEffect } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { SettingsItemWithTextValue } from '../../components/InfoListItem';
import { HeaderTitleWithSubtitle, headerWithBackButton } from '../../navigation/Headers';
import { SafeAreaView } from 'react-native-safe-area-context';
import { navigate } from '../../navigation/NavigationService';
import { Screens } from '../../navigation/Screens';
import locales from '../../i18n/locales';
import { useStoreState } from '../../state/hooks';
import { useTranslation } from 'react-i18next';
import { cueInformativeHaptic } from '../../utils/accessibility/haptics';

const GeneralSettingsScreen = ({ navigation, route }) => {
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

  const currentLanguage = useStoreState((state) => state.nuxt.language);
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <SettingsItemWithTextValue
        title="Language"
        value={locales[currentLanguage ?? '']?.name ?? t('unknown')!}
        withChevron={true}
        onPress={onPressLanguage}
      />
      <SettingsItemWithTextValue
        title="Local currency"
        value="UGX"
        withChevron={true}
        onPress={() => 0}
      />
      <SettingsItemWithTextValue
        title="Bitcoin unit"
        value="sats"
        withChevron={true}
        onPress={() => 0}
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
  },
  text: {
    textAlign: 'center',
  },
});

export default GeneralSettingsScreen;
