/* eslint-disable react-native/no-inline-styles */
import React, { useLayoutEffect } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { SettingsItemSwitch, SettingsItemWithTextValue } from '../../components/InfoListItem';
import { HeaderTitleWithSubtitle, headerWithBackButton } from '../../navigation/Headers';
import { SafeAreaView } from 'react-native-safe-area-context';
import SectionTitle from '../../components/SectionTitle';
import { cueInformativeHaptic } from '../../utils/accessibility/haptics';
import useWalletBackupBottomSheet from './useWalletBackupBottomSheet';

const WalletBackupScreen = ({ navigation }) => {
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => <HeaderTitleWithSubtitle title="Wallet backup" />,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    openRecoveryPhraseSheet,
    cloudOptionsBottomSheet,
    openCloudOptionsSheet,
    recoveryPhraseBottomSheet,
  } = useWalletBackupBottomSheet();

  // const onToggleCloudBackupProvider = () => {
  //   cueInformativeHaptic();
  //   return;
  // };

  // const onPressRecoveryPhrase = async () => {
  //   const pinIsCorrect = await ensurePincode();
  //   if (pinIsCorrect) {
  //     openRecoveryPhraseSheet;
  //   }
  // };

  const onToggleEncryptBackup = () => {
    cueInformativeHaptic();
    return;
  };

  return (
    <SafeAreaView style={styles.container}>
      <SectionTitle
        title="Automatic cloud backups"
        details="Last backup: "
        style={styles.sectionHeading}
      />
      <SettingsItemWithTextValue
        title="Store cloud backup in"
        value="Apple iCloud"
        withChevron={true}
        onPress={openCloudOptionsSheet}
      />
      <SettingsItemSwitch
        title="Encrypt cloud backup"
        value={true}
        onValueChange={onToggleEncryptBackup}
      />
      <SettingsItemSwitch
        title="Backup channels"
        value={true}
        onValueChange={onToggleEncryptBackup}
      />
      <SettingsItemSwitch
        title="Backup transactions"
        value={true}
        onValueChange={onToggleEncryptBackup}
      />
      <SectionTitle
        title="Manual backup"
        details="Highly recommended"
        style={styles.sectionHeading}
      />
      <SettingsItemWithTextValue
        title="View recovery phrase"
        withChevron={true}
        onPress={openRecoveryPhraseSheet}
      />
      {cloudOptionsBottomSheet}
      {recoveryPhraseBottomSheet}
    </SafeAreaView>
  );
};

WalletBackupScreen.navigationOptions = {
  ...headerWithBackButton,
  ...Platform.select({
    ios: { animation: 'slide_from_bottom' },
  }),
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    textAlign: 'center',
  },
  sectionHeading: {
    marginVertical: 16,
  },
});

export default WalletBackupScreen;
