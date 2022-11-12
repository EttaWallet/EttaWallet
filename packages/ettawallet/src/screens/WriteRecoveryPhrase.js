/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import React, { useContext, useState } from 'react';
import { EttaStorageContext } from '../../storage/context';
import { Text } from '@ettawallet/react-native-kit';
import Switch from '../components/Switch';
import Button, { BtnSizes, BtnTypes } from '../components/Button';
import CancelButton from '../components/CancelButton';
import Pill from '../components/Pill';
import RecoveryPhraseContainer, {
  RecoveryPhraseContainerMode,
  RecoveryPhraseType,
} from '../components/RecoveryPhraseContainer';
import fontStyles from '../styles/fonts';
import {
  ScrollView,
  View,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { navigate } from '../navigation/NavigationService';
import colors from '../styles/colors';

const WriteRecoveryPhrase = () => {
  const { t } = useTranslation();
  const { mnemonic } = useContext(EttaStorageContext);
  const [checked, setChecked] = useState(false);

  const showLoadingIndicator = !mnemonic;

  const onPressConfirmSwitch = value => {
    setChecked(value);
    console.log(checked);
  };

  const onPressConfirmArea = () => {
    onPressConfirmSwitch(!checked);
  };

  const onPressCloudBackup = () => {
    // what happens when backup to cloud clicked
  };

  const onPressManualBackup = () => {
    navigate('ManualBackupQuiz');
  };

  return (
    <View style={styles.container}>
      <View style={styles.pageHeaderContainer}>
        <CancelButton buttonType="icon" style={styles.cancelButton} />
        <HeaderRight />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {mnemonic ? (
          <>
            {showLoadingIndicator ? (
              <ActivityIndicator size="small" color={colors.orangeUI} />
            ) : (
              <RecoveryPhraseContainer
                value={mnemonic}
                mode={RecoveryPhraseContainerMode.READONLY}
                type={RecoveryPhraseType.BACKUP_KEY}
              />
            )}

            <Text
              style={styles.body}
              fontWeight="normal"
              fontColor="dark"
              typography="h5"
            >
              {t('manualBackup.warning')}
            </Text>
          </>
        ) : null}
      </ScrollView>
      <>
        <View style={styles.confirmationSwitchContainer}>
          <Switch value={checked} onValueChange={onPressConfirmSwitch} />
          <Text
            onPress={onPressConfirmArea}
            style={styles.confirmationSwitchLabel}
          >
            {t('manualBackup.writtenConfirmation')}
          </Text>
        </View>
        <Button
          disabled={!checked}
          text={
            Platform.OS === 'ios'
              ? t('manualBackup.icloudBackupBtn')
              : t('manualBackup.gdriveBackupBtn')
          }
          size={BtnSizes.FULL}
          type={BtnTypes.PRIMARY}
          onPress={onPressCloudBackup}
          style={{ marginBottom: 10 }}
        />
        <Button
          disabled={!checked}
          text={t('manualBackup.manualBackupBtn')}
          size={BtnSizes.FULL}
          type={BtnTypes.ONBOARDING_SECONDARY}
          onPress={onPressManualBackup}
          style={{ marginBottom: 10 }}
        />
      </>
    </View>
  );
};

const HeaderRight = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const onMoreInfoPressed = () => {
    navigation.push('RecoveryPhraseIntro');
  };
  return (
    <Pill
      text={t('manualBackup.topLearnMoreBtn')}
      onPress={onMoreInfoPressed}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignContent: 'space-between',
    justifyContent: 'center',
    padding: 20,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  body: {
    ...fontStyles.regular,
    marginTop: 16,
  },
  confirmationSwitchContainer: {
    marginVertical: 30,
    flexDirection: 'row',
    alignItems: 'center',
  },
  confirmationSwitchLabel: {
    flex: 1,
    ...fontStyles.regular,
    paddingLeft: 8,
  },
  pageHeaderContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
});

export default WriteRecoveryPhrase;
