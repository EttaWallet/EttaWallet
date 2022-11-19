import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { SettingsItemTextValue } from '../../components/SettingsItem';
import colors from '../../styles/colors';
import { navigate } from '../../navigation/NavigationService';
import { emptyHeader } from '../../navigation/headers/Headers';
import fontStyles from '../../styles/fonts';
import i18n from '../../../i18n';

const Settings = () => {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.containerList}>
          <SettingsItemTextValue
            title={t('settings.titles.generalSettings')}
            onPress={() => navigate('GeneralSettings')}
            showChevron
          />
          <SettingsItemTextValue
            title={t('settings.titles.security')}
            onPress={() => navigate('WalletHome')}
            showChevron
          />
          <SettingsItemTextValue
            title={t('settings.titles.walletBackup')}
            onPress={() => navigate('WalletHome')}
            showChevron
          />
          <SettingsItemTextValue
            title={t('settings.titles.support')}
            onPress={() => navigate('WalletHome')}
            showChevron
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

Settings.navigationOptions = () => ({
  ...emptyHeader,
  headerTitle: i18n.t('settings.headerTitle'),
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
    marginTop: 44,
    marginLeft: 16,
    paddingLeft: 0,
    borderBottomColor: colors.gray2,
    borderBottomWidth: 1,
  },
});

export default Settings;
