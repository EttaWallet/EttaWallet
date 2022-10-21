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
import { ScrollView, View, StyleSheet, Dimensions } from 'react-native';
import PageHeader from '../navigation/headers/Header';

const WriteRecoveryPhrase = ({ navigation }) => {
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
    // navigation.navigate('');
    console.log('Clicked continue');
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
              Write it down some place safe. You might be tempted to but do not
              save this on your phone!
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
            Yes, I have written down my Recovery Phrase
          </Text>
        </View>
        <Button
          disabled={!checked}
          text="Continue"
          size={BtnSizes.FULL}
          type={BtnTypes.PRIMARY}
          onPress={onPressContinue}
        />
      </>
    </View>
  );
};

function HeaderRight() {
  const onMoreInfoPressed = ({ navigation }) => {
    navigation.push('RecoveryPhraseSlides');
  };
  return <TopBarTextButton onPress={onMoreInfoPressed} title="Learn more" />;
}

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
  },
});

export default WriteRecoveryPhrase;
