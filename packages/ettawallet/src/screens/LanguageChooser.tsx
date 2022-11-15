/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { TransitionPresets } from '@react-navigation/stack';
import { localesList } from '../../i18n/locales';
import React, { useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, ListRenderItemInfo, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SelectOption from '../components/SelectOption';
import useChangeLanguage from '../../i18n/useChangeLanguage';
import {
  emptyHeader,
  headerWithBackButton,
} from '../navigation/headers/Headers';
import { navigate } from '../navigation/NavigationService';
import fontStyles from '../styles/fonts';
import { EttaStorageContext } from '../../storage/context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DEFAULT_LANGUAGE_IS_SET,
  LANG_STORAGE_KEY,
} from '../../storage/consts';

interface Language {
  code: string;
  name: string;
}

function keyExtractor(item: Language) {
  return item.code;
}

const LanguageChooser = ({ route }) => {
  const { areOnboardingSlidesCompleted, isUserLanguageSet } =
    useContext(EttaStorageContext); // get async method from context
  const [onboardingSlidesComplete, setOnboardingSlidesComplete] =
    useState(false); // setup state to handle modifications
  const [languageSet, setLanguageSet] = useState(false);
  useState(false); // setup state to handle modifications
  const changeLanguage = useChangeLanguage();
  const { t, i18n } = useTranslation();
  const nextScreen = route.params?.nextScreen;

  const setDefaultLanguage = async code => {
    try {
      await AsyncStorage.setItem(LANG_STORAGE_KEY, code); // save selected language to storage
    } catch (e) {
      console.log('something went wrong here: ', e);
    } finally {
      await AsyncStorage.setItem(DEFAULT_LANGUAGE_IS_SET, 'true');
    }
  };

  const onSelect = (language: string, code: string) => {
    void changeLanguage(code);
    // Wait for next frame before navigating
    // so the user can see the changed selection briefly
    setDefaultLanguage(code); // mark this point complete with storage
    requestAnimationFrame(() => {
      !onboardingSlidesComplete // check if all slides seen
        ? navigate(nextScreen || 'OnboardingSlides')
        : navigate(nextScreen || 'WelcomeScreen');
    });
  };

  const renderItem = ({ item: language }: ListRenderItemInfo<Language>) => {
    return (
      <SelectOption
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

  useEffect(() => {
    (async () => {
      try {
        setOnboardingSlidesComplete(await areOnboardingSlidesCompleted());
        setLanguageSet(await isUserLanguageSet());
      } catch (e) {
        console.log(e);
      }
    })();
  }, [onboardingSlidesComplete, languageSet]);

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <Text style={styles.title}>{t('selectLanguage')}</Text>
      <FlatList
        data={localesList}
        extraData={i18n.language}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
      />
    </SafeAreaView>
  );
};

LanguageChooser.navigationOptions =
  (withAnimation: boolean) =>
  ({ navigation }) => {
    return navigation.canGoBack()
      ? {
          ...headerWithBackButton,
          ...(withAnimation ? TransitionPresets.ModalTransition : {}),
          headerShadowVisible: false,
        }
      : emptyHeader;
  };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  title: {
    ...fontStyles.h2,
    margin: 16,
  },
});

export default LanguageChooser;
