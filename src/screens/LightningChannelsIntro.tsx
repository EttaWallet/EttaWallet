import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { headerWithBackButton } from '../navigation/Headers';
import { navigate } from '../navigation/NavigationService';

import { Button, Colors, Icon, TypographyPresets } from 'etta-ui';
import { Screens } from '../navigation/Screens';
import { cueInformativeHaptic } from '../utils/accessibility/haptics';

const LightningChannelsIntroScreen = () => {
  const onPressProceed = () => {
    cueInformativeHaptic();
    navigate(Screens.ChannelStatusScreen);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>First things first, you'll need a payment channel</Text>
        <Text style={styles.description}>TLDR:</Text>
        <View style={styles.section}>
          <Icon name="icon-arrow-right" style={styles.sectionIcon} />
          <Text style={styles.sectionText}>
            Before you can send or receive bitcoin on the lightning network, you need to have a
            payment channel with a well connected node
          </Text>
        </View>
        <View style={styles.section}>
          <Icon name="icon-arrow-right" style={styles.sectionIcon} />
          <Text style={styles.sectionText}>
            Setting up a payment channel will allow you to move bitcoin freely and instantly from
            one person to the next
          </Text>
        </View>
        <View style={styles.section}>
          <Icon name="icon-arrow-right" style={styles.sectionIcon} />
          <Text style={styles.sectionText}>
            EttaWallet will attempt to open a new channel with a Lightning Service Provider (LSP) to
            obtain liquidity and to route your payments through the network
          </Text>
        </View>
        <View style={styles.section}>
          <Icon name="icon-arrow-right" style={styles.sectionIcon} />
          <Text style={styles.sectionText}>
            In order to route payments to their final destination, there is usually a small routing
            fee you have to pay
          </Text>
        </View>
      </ScrollView>
      <View style={styles.buttonContainer}>
        <Button title="Proceed" onPress={onPressProceed} style={styles.button} />
      </View>
    </SafeAreaView>
  );
};

LightningChannelsIntroScreen.navigationOptions = () => ({
  ...headerWithBackButton,
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  contentContainer: {
    marginHorizontal: 24,
    marginTop: 16,
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
    ...TypographyPresets.Header5,
  },
  description: {
    ...TypographyPresets.Body4,
    marginTop: 12,
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
    marginBottom: 40,
    marginHorizontal: 32,
  },
  button: {
    justifyContent: 'center',
  },
});

export default LightningChannelsIntroScreen;
