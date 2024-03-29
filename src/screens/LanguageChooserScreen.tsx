import React from 'react';
import type { StackScreenProps } from '@react-navigation/stack';
import { localesList } from '../i18n/locales';
import { useTranslation } from 'react-i18next';
import { FlatList, ListRenderItemInfo, StyleSheet, Text } from 'react-native';
import useChangeLanguage from '../i18n/useChangeLanguage';
import { headerWithBackButton } from '../navigation/Headers';
import { navigate } from '../navigation/NavigationService';
import { Screens } from '../navigation/Screens';
import type { StackParamList } from '../navigation/types';
import { Colors, TypographyPresets } from 'etta-ui';
import SelectionOption from '../components/SelectionOption';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cueInformativeHaptic } from '../utils/accessibility/haptics';
import { showInfoBanner } from '../utils/alerts';
import { modalScreenOptions } from '../navigation/Navigator';

type ScreenProps = StackScreenProps<
  StackParamList,
  Screens.LangugageChooserScreen | Screens.LanguageModal
>;
type Props = ScreenProps;

interface Language {
  code: string;
  name: string;
}

function keyExtractor(item: Language) {
  return item.code;
}

const LanguageChooser = ({ route }: Props) => {
  const changeLanguage = useChangeLanguage();
  const { t, i18n } = useTranslation();
  const nextScreen = route.params?.nextScreen;

  const onSelect = (language: string, code: string) => {
    cueInformativeHaptic();
    if (code !== 'en-US') {
      showInfoBanner({
        title: 'Heads up!',
        message: `Translations for ${language} might be outdated`,
      });
    }
    // eslint-disable-next-line no-void
    void changeLanguage(code);
    requestAnimationFrame(() => {
      navigate(nextScreen || Screens.WelcomeScreen);
    });
  };

  const renderItem = ({ item: language }: ListRenderItemInfo<Language>) => {
    return (
      <SelectionOption
        hideCheckboxes={!nextScreen}
        text={language.name}
        key={language.code}
        onSelect={onSelect}
        isSelected={language.code === i18n.language}
        data={language.code}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Text style={styles.title}>{t('selectLanguage')}</Text>
      <FlatList
        initialNumToRender={localesList.length}
        data={localesList}
        extraData={i18n.language}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

LanguageChooser.navigationOptions = () => ({
  ...modalScreenOptions(),
  ...headerWithBackButton,
  gestureEnabled: false,
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    marginHorizontal: 16,
    marginBottom: 16,
    ...TypographyPresets.Header5,
    color: Colors.common.black,
  },
});

export default LanguageChooser;
