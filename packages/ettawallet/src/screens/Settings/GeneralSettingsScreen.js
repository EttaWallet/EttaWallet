import React, { useContext, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import {
  SettingsItemSwitch,
  SettingsItemTextValue,
} from '../../components/SettingsItem';
import locales from '../../../i18n/locales';
import i18n from '../../../i18n';
import colors from '../../styles/colors';
import { navigate } from '../../navigation/NavigationService';
import { EttaStorageContext } from '../../../storage/context';
import { emptyHeader } from '../../navigation/headers/Headers';
import { TopBarTextIconButton } from '../../navigation/headers/TopBarButton';
import BackChevron from '../../icons/BackChevron';
import fontStyles from '../../styles/fonts';
import SectionHeader from '../../components/SectionHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LOCAL_CURRENCY_KEY } from '../../../storage/consts';

const GeneralSettings = () => {
  const { t } = useTranslation();

  const {
    useSatoshiUnits,
    setUseSatoshiUnits,
    getLocalCurrency,
    prefferedCurrency,
  } = useContext(EttaStorageContext);

  const handleSatoshiToggle = value => {
    setUseSatoshiUnits(value);
  };

  useEffect(() => {
    getLocalCurrency();
  }, []);

  const currentLanguage = locales[i18n.language];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.containerList}>
          <SettingsItemTextValue
            title={t('settings.generalSettingsTitles.language')}
            value={currentLanguage?.name ?? t('settings.unknown')}
            onPress={() =>
              navigate('LanguageSettings', { nextScreen: 'Settings' })
            }
          />
          <SettingsItemTextValue
            title={t('settings.generalSettingsTitles.currency')}
            value={<Text>{prefferedCurrency}</Text> ?? t('settings.unknown')}
            onPress={() => navigate('CurrencySettings')}
          />
          <SettingsItemSwitch
            title={t('settings.generalSettingsTitles.bitcoinUnit')}
            details={t('settings.generalSettingsTitles.bitcoinUnitExplainer')}
            value={useSatoshiUnits}
            onValueChange={handleSatoshiToggle}
          />
          <SectionHeader
            text={t('settings.generalSettingsTitles.notificationsHeader')}
            style={styles.sectionTitle}
          />
          <SettingsItemSwitch
            title={t('settings.generalSettingsTitles.incomingTransactions')}
            value={false}
            onValueChange={() => 0}
          />
          <SettingsItemSwitch
            title={t('settings.generalSettingsTitles.securityReview')}
            details={t('settings.generalSettingsTitles.reviewPeriod')}
            value={false}
            onValueChange={() => 0}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

GeneralSettings.navigationOptions = () => ({
  ...emptyHeader,
  headerLeft: () => (
    <TopBarTextIconButton
      title="Back"
      titleStyle={{ color: colors.dark }}
      icon={<BackChevron color={colors.dark} />}
      onPress={() => navigate('BaseSettings')}
    />
  ),
  headerTitle: i18n.t('settings.generalSettingsTitles.headerTitle'),
  headerTitleStyle: {
    ...fontStyles.regular600,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  containerList: {
    flex: 1,
  },
  sectionTitle: {
    ...fontStyles.sectionHeader,
    marginTop: 44,
    marginLeft: 16,
    paddingLeft: 0,
    borderBottomColor: colors.gray2,
    borderBottomWidth: 1,
  },
});

export default GeneralSettings;
