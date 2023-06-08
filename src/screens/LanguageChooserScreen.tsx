import React from 'react';
import type { StackScreenProps } from '@react-navigation/stack';
import { localesList } from '../i18n/locales';
import { useTranslation } from 'react-i18next';
import { FlatList, ListRenderItemInfo, StyleSheet, Text } from 'react-native';
import useChangeLanguage from '../i18n/useChangeLanguage';
import { emptyHeader, headerWithBackButton } from '../navigation/Headers';
import { navigate } from '../navigation/NavigationService';
import { Screens } from '../navigation/Screens';
import type { StackParamList } from '../navigation/types';
import { Colors, TypographyPresets } from 'etta-ui';
import SelectionOption from '../components/SelectionOption';
import { SafeAreaView } from 'react-native-safe-area-context';

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
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{t('selectLanguage')}</Text>
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
    marginHorizontal: 16,
    marginBottom: 16,
    ...TypographyPresets.Header5,
    color: Colors.common.black,
  },
});

export default LanguageChooser;
