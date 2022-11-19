/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { localesList } from '../../../i18n/locales';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, ListRenderItemInfo, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SelectOption from '../../components/SelectOption';
import useChangeLanguage from '../../../i18n/useChangeLanguage';
import { emptyHeader } from '../../navigation/headers/Headers';
import { navigate } from '../../navigation/NavigationService';
import fontStyles from '../../styles/fonts';
import { EttaStorageContext } from '../../../storage/context';
import { TopBarTextIconButton } from '../../navigation/headers/TopBarButton';
import colors from '../../styles/colors';
import BackChevron from '../../icons/BackChevron';
import i18n from '../../../i18n';

interface Language {
  code: string;
  name: string;
}

function keyExtractor(item: Language) {
  return item.code;
}

const LanguageSettings = ({ route }) => {
  const [slidesStatus, setSlidesStatus] = useState(false);
  const { areOnboardingSlidesCompleted } = useContext(EttaStorageContext);

  const checkSlidesStatus = async () => {
    const status = await areOnboardingSlidesCompleted();
    if (status === true) {
      setSlidesStatus(true);
    }
  };

  const changeLanguage = useChangeLanguage();
  const { i18n } = useTranslation();
  const nextScreen = route.params?.nextScreen;

  const onSelect = (language: string, code: string) => {
    void changeLanguage(code);
    // Wait for next frame before navigating
    // so the user can see the changed selection briefly
    requestAnimationFrame(() => {
      !slidesStatus // check if all slides seen
        ? navigate(nextScreen || 'OnboardingSlides')
        : navigate(nextScreen || 'WelcomeScreen');
    });
  };

  useEffect(() => {
    checkSlidesStatus();
  });

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

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FlatList
        data={localesList}
        extraData={i18n.language}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
      />
    </SafeAreaView>
  );
};

LanguageSettings.navigationOptions = () => ({
  ...emptyHeader,
  headerLeft: () => (
    <TopBarTextIconButton
      title="Back"
      titleStyle={{ color: colors.dark }}
      icon={<BackChevron color={colors.dark} />}
      onPress={() => navigate('GeneralSettings')}
    />
  ),
  headerTitle: i18n.t('selectLanguage'),
  headerTitleStyle: {
    ...fontStyles.regular600,
  },
});

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

export default LanguageSettings;
