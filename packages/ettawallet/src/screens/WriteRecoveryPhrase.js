/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import React, { useContext, useState } from 'react';
import { EttaStorageContext } from '../../storage/context';
import { Text } from '@ettawallet/react-native-kit';
import Switch from '../components/Switch';
import Button, { BtnSizes, BtnTypes } from '../components/Button';
import CancelButton from '../components/CancelButton';
import { TopBarTextButton } from '../navigation/headers/TopBarButton';
import RecoveryPhraseContainer, {
  RecoveryPhraseContainerMode,
  RecoveryPhraseType,
} from '../components/RecoveryPhraseContainer';
import fontStyles from '../styles/fonts';
import { ScrollView, View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { navigate } from '../navigation/NavigationService';

const WriteRecoveryPhrase = () => {
  const { t } = useTranslation();
  const { mnemonic } = useContext(EttaStorageContext);
  const [checked, setChecked] = useState(false);

  const onPressConfirmSwitch = value => {
    setChecked(value);
    console.log(checked);
  };

  const onPressConfirmArea = () => {
    onPressConfirmSwitch(!checked);
  };

  const onPressContinue = () => {
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
            <RecoveryPhraseContainer
              value={mnemonic}
              mode={RecoveryPhraseContainerMode.READONLY}
              type={RecoveryPhraseType.BACKUP_KEY}
            />
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
          text={t('manualBackup.continueBtn')}
          size={BtnSizes.FULL}
          type={BtnTypes.PRIMARY}
          onPress={onPressContinue}
        />
      </>
    </View>
  );
};

const HeaderRight = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const onMoreInfoPressed = () => {
    navigation.push('RecoveryPhraseSlides');
  };
  return (
    <TopBarTextButton
      onPress={onMoreInfoPressed}
      title={t('manualBackup.topLearnMoreBtn')}
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
    marginVertical: 16,
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
