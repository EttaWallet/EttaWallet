import React from 'react';
import type { StackScreenProps } from '@react-navigation/stack';
import { localesList } from '../i18n/locales';
import { useTranslation } from 'react-i18next';
import { FlatList, ListRenderItemInfo, SafeAreaView, StyleSheet, Text } from 'react-native';
import useChangeLanguage from '../i18n/useChangeLanguage';
import { emptyHeader, headerWithBackButton } from '../navigation/Headers';
import { navigate } from '../navigation/NavigationService';
import { Screens } from '../navigation/Screens';
import type { StackParamList } from '../navigation/types';
import { TypographyPresets } from 'etta-ui';
import SelectionOption from '../components/SelectionOption';

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

  const onSelect = (code: string) => {
    // eslint-disable-next-line no-void
    void changeLanguage(code);
    // Wait for next frame before navigating
    // so the user can see the changed selection briefly
    requestAnimationFrame(() => {
      navigate(nextScreen || Screens.OnboardingSlidesScreen);
    });
  };

  const renderItem = ({ item: language }: ListRenderItemInfo<Language>) => {
    return (
      <SelectionOption
        // nextScreen is not set when the language screen is the first seen in the app
        // for when the best language couldn't be determined
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
    <SafeAreaView style={styles.container}>
      <Text style={styles.title} testID={'ChooseLanguageTitle'}>
        {t('selectLanguage')}
      </Text>
      <FlatList
        initialNumToRender={localesList.length}
        data={localesList}
        extraData={i18n.language}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
      />
    </SafeAreaView>
  );
};

LanguageChooser.navigationOptions =
  () =>
  ({ navigation }: ScreenProps) => {
    return navigation.canGoBack()
      ? {
          ...headerWithBackButton,
        }
      : emptyHeader;
  };

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    ...TypographyPresets.Body3,
    margin: 16,
  },
});

export default LanguageChooser;
