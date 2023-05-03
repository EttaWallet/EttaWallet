import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { noHeader } from '../navigation/Headers';
import { navigate } from '../navigation/NavigationService';

import { Button, Chip, Colors, Icon, TypographyPresets } from 'etta-ui';
import { Screens } from '../navigation/Screens';
import useLiquidityOptionBottomSheet from '../components/useLiquidityOptionBottomSheet';
import CancelButton from '../navigation/components/CancelButton';

const onPressLearnMore = () => {
  // @TODO: should open webView with appropiate URL
  navigate(Screens.TestScreen);
};

function Header() {
  const { t } = useTranslation();

  return (
    <View style={styles.headerContainer}>
      <CancelButton />
      <Chip onPress={onPressLearnMore} selected={true}>
        {t('Learn more')}
      </Chip>
    </View>
  );
}

export const LightningInstructions = () => {
  const { t } = useTranslation();

  return (
    <>
      <Text style={styles.title}>{t('You need a payment channel to send or receive')}</Text>
      <Text style={styles.description}>{t('Here`s the TLDR:')}</Text>
      <View style={styles.section}>
        <Icon name="icon-arrow-right" style={styles.sectionIcon} />
        <Text style={styles.sectionText}>
          {t(
            'Before you can send or receive any bitcoin on the lightning network, you need to have a payment channel with a well connected node'
          )}
        </Text>
      </View>
      <View style={styles.section}>
        <Icon name="icon-arrow-right" style={styles.sectionIcon} />
        <Text style={styles.sectionText}>
          {t(
            'Setting up a payment channel will enable you to move bitcoin freely and instantly from one person to the next'
          )}
        </Text>
      </View>
      <View style={styles.section}>
        <Icon name="icon-arrow-right" style={styles.sectionIcon} />
        <Text style={styles.sectionText}>
          {t('There are fees in order to use the lightning network')}
        </Text>
      </View>
    </>
  );
};

const LightningChannelsIntroScreen = () => {
  const { openSheet, SelectLiquidityOptionBottomSheet } = useLiquidityOptionBottomSheet();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Header />
        <LightningInstructions />
      </ScrollView>
      <View style={styles.buttonContainer}>
        <Button title="Get started" size="default" onPress={openSheet} style={styles.button} />
      </View>
      {SelectLiquidityOptionBottomSheet}
    </SafeAreaView>
  );
};

LightningChannelsIntroScreen.navigationOptions = {
  ...noHeader,
  ...Platform.select({
    ios: { animation: 'slide_from_bottom' },
  }),
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  contentContainer: {
    alignItems: 'center',
    marginHorizontal: 24,
  },
  headerContainer: {
    width: '100%',
    marginTop: 12,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...TypographyPresets.Header3,
    marginTop: 32,
    textAlign: 'center',
  },
  description: {
    ...TypographyPresets.Body4,
    marginTop: 12,
    textAlign: 'center',
  },
  section: {
    width: '100%',
    flex: 1,
    flexDirection: 'row',
    marginTop: 24,
  },
  sectionText: {
    ...TypographyPresets.Body4,
    flex: 1,
    flexGrow: 1,
    alignSelf: 'center',
  },
  closeIcon: {
    fontSize: 20,
  },
  sectionIcon: {
    marginRight: 16,
    fontSize: 24,
    color: Colors.orange.base,
  },
  learnMoreLink: {
    textDecorationLine: 'underline',
  },
  buttonContainer: {
    paddingTop: 32,
    paddingBottom: 16,
    marginHorizontal: 32,
  },
  button: {
    justifyContent: 'center',
  },
});

export default LightningChannelsIntroScreen;
