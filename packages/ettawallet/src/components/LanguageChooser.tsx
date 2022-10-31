import { StackScreenProps, TransitionPresets } from '@react-navigation/stack';
import { localesList } from '../../i18n/locales';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  ListRenderItemInfo,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SelectionOption from './SelectOption';
import useChangeLanguage from '../../i18n/useChangeLanguage';
import {
  emptyHeader,
  headerWithBackButton,
} from '../navigation/headers/Headers';
import { navigate } from '../navigation/NavigationService';
import fontStyles from '../styles/fonts';

interface Language {
  code: string;
  name: string;
}

function keyExtractor(item: Language) {
  return item.code;
}

const LanguageChooser = ({ route }) => {
  const changeLanguage = useChangeLanguage();
  const { t, i18n } = useTranslation();
  const nextScreen = route.params?.nextScreen;

  const onSelect = (language: string, code: string) => {
    void changeLanguage(code);
    // Wait for next frame before navigating
    // so the user can see the changed selection briefly
    requestAnimationFrame(() => {
      navigate(nextScreen || 'OnboardingSlides');
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
    <FlatList
      data={localesList}
      extraData={i18n.language}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
    />
  );
};

LanguageChooser.navigationOptions =
  (withAnimation: boolean) =>
  ({ navigation }) => {
    return navigation.canGoBack()
      ? {
          ...headerWithBackButton,
          ...(withAnimation ? TransitionPresets.ModalTransition : {}),
        }
      : emptyHeader;
  };

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    ...fontStyles.h2,
    margin: 16,
  },
});

export default LanguageChooser;
