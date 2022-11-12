import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button, { BtnSizes } from '../components/Button';
import Pill from '../components/Pill';
import Touchable from '../components/Touchable';
import CancelButton from '../components/CancelButton';
import { infoImage } from '../images/Images';
import { noHeader } from '../navigation/headers/Headers';
import { navigate, navigateBack } from '../navigation/NavigationService';
import colors from '../styles/colors';
import fontStyles from '../styles/fonts';
import { iconHitslop } from '../styles/variables';
import { EttaStorageContext } from '../../storage/context';

const onLearnMore = () => {
  navigate('WebViewScreen', { uri: 'www.google.com' }); // update this to go to a screen with more info
};

function Header() {
  const { t } = useTranslation();

  return (
    <View style={styles.headerContainer}>
      <Touchable onPress={navigateBack} borderless={true} hitSlop={iconHitslop}>
        <CancelButton buttonType="icon" style={styles.cancelButton} />
      </Touchable>
      <Pill text={t('manualBackup.topLearnMoreBtn')} onPress={onLearnMore} />
    </View>
  );
}

const RecoveryPhraseIntro = () => {
  const { t } = useTranslation();
  const { getMnemonic } = useContext(EttaStorageContext);

  const generateRecoveryPhrase = () => {
    // generate mnemonic and redirect. Added 1s delay
    setTimeout(() => {
      getMnemonic();
    }, 1000);
    navigate('WriteRecoveryPhrase');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Header />
        <Text style={styles.title}>{t('recoveryPhraseIntro.title')}</Text>
        <Text style={styles.description}>
          {t('recoveryPhraseIntro.subtitle')}
        </Text>
        <View style={styles.section}>
          <Image
            source={infoImage}
            style={styles.sectionIcon}
            resizeMode="contain"
          />
          <Text style={styles.sectionText}>
            {t('recoveryPhraseIntro.fact1')}
          </Text>
        </View>
        <View style={styles.section}>
          <Image
            source={infoImage}
            style={styles.sectionIcon}
            resizeMode="contain"
          />
          <Text style={styles.sectionText}>
            {t('recoveryPhraseIntro.fact2')}
          </Text>
        </View>
        <View style={styles.section}>
          <Image
            source={infoImage}
            style={styles.sectionIcon}
            resizeMode="contain"
          />
          <Text style={styles.sectionText}>
            {t('recoveryPhraseIntro.fact3')}
          </Text>
        </View>
        <View style={styles.section}>
          <Image
            source={infoImage}
            style={styles.sectionIcon}
            resizeMode="contain"
          />
          <Text style={styles.sectionText}>
            {t('recoveryPhraseIntro.fact4')}
          </Text>
        </View>
      </ScrollView>
      <View style={styles.buttonContainer}>
        <Button
          size={BtnSizes.FULL}
          text={t('recoveryPhraseIntro.ctaBtn')}
          onPress={generateRecoveryPhrase}
        />
      </View>
    </SafeAreaView>
  );
};

RecoveryPhraseIntro.navOptions = noHeader;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  contentContainer: {
    alignItems: 'center',
    marginHorizontal: 24,
  },
  cancelButton: {
    color: colors.gray4,
  },
  headerContainer: {
    width: '100%',
    marginTop: 12,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  image: {
    marginTop: 18,
  },
  title: {
    ...fontStyles.h2,
    marginTop: 32,
    textAlign: 'center',
  },
  description: {
    ...fontStyles.regular,
    marginTop: 12,
    textAlign: 'center',
    color: colors.error,
  },
  section: {
    width: '100%',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
  },
  sectionText: {
    ...fontStyles.regular,
    color: colors.dark,
    flex: 1,
    flexGrow: 1,
  },
  sectionIcon: {
    marginRight: 16,
    width: 18,
    height: 18,
  },
  learnMoreLink: {
    textDecorationLine: 'underline',
  },
  buttonContainer: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderTopColor: colors.gray2,
    borderTopWidth: 1,
  },
});

export default RecoveryPhraseIntro;
