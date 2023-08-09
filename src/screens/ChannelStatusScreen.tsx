import React, { useEffect, useLayoutEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { headerWithBackButton } from '../navigation/Headers';
import { navigate, navigateHome } from '../navigation/NavigationService';
import LottieView from 'lottie-react-native';
import { Button, Colors, Icon, TypographyPresets } from 'etta-ui';
import { cueSuccessHaptic } from '../utils/accessibility/haptics';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StackParamList } from '../navigation/types';
import { Screens } from '../navigation/Screens';
import { navigateToURI, pressableHitSlop, sleep } from '../utils/helpers';
import { modalScreenOptions } from '../navigation/Navigator';
import { TouchableOpacity } from 'react-native-gesture-handler';

type RouteProps = NativeStackScreenProps<StackParamList, Screens.ChannelStatusScreen>;

export function ChannelStatusScreen(props: RouteProps) {
  useLayoutEffect(() => {
    props.navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            navigate(Screens.LightningChannelsIntroScreen);
          }}
          hitSlop={pressableHitSlop}
          style={styles.navIconContainer}
        >
          <Icon name="icon-question" style={styles.helpNavIcon} />
        </TouchableOpacity>
      ),
    });
  }, [props.navigation]);

  const channel = props.route.params.channel;

  useEffect(() => {
    if (channel?.is_channel_ready) {
      cueSuccessHaptic();
      sleep(3000);
      // wait for 3 seconds and navigate to the homescreen
      requestAnimationFrame(() => {
        navigateHome();
      });
    }
  });

  return channel?.is_channel_ready ? (
    // show channel is ready and redirect back home
    <SafeAreaView style={styles.safeAreaView} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <LottieView
          style={styles.lottieIcon}
          source={require('../../assets/lottie/success-check.json')}
          autoPlay={true}
          loop={false}
        />
        <Text style={styles.text}>All set!</Text>
      </ScrollView>
    </SafeAreaView>
  ) : (
    // show activity indicator and text about pending open
    <SafeAreaView style={styles.safeAreaView} edges={['bottom']}>
      <ScrollView style={styles.contentContainer}>
        <View style={styles.section}>
          <View style={styles.sectionIconContainer}>
            <Icon name="icon-check" style={styles.sectionIcon} />
          </View>
          <Text style={styles.sectionText}>New channel requested</Text>
        </View>
        <View style={styles.section}>
          <View style={styles.sectionIconContainer}>
            <Icon name="icon-check" style={styles.sectionIcon} />
          </View>
          <Text style={styles.sectionText}>Invoice paid</Text>
        </View>
        <View style={styles.section}>
          <View style={styles.sectionIconContainer}>
            <Icon name="icon-check" style={styles.sectionIcon} />
          </View>
          <Text style={styles.sectionText}>Channel request approved</Text>
        </View>
        <View style={styles.section}>
          <View style={styles.sectionIconContainer}>
            <Icon name="icon-check" style={styles.sectionIcon} />
          </View>
          <Text style={styles.sectionText}>Funding transaction broadcast</Text>
        </View>
        <View style={styles.section}>
          <View style={styles.pendingContainer}>
            <ActivityIndicator color={Colors.orange.light} size="small" />
          </View>
          <Text style={styles.sectionText}>Waiting for one confirmation...</Text>
          <Button
            title="Check"
            size="small"
            appearance="outline"
            icon="icon-confirmations-1"
            iconPosition="left"
            onPress={async () => {
              navigateToURI(`https://mempool.space/testnet/tx/${channel?.funding_txid}`);
            }}
          />
        </View>
        <View style={styles.section}>
          <View style={styles.pendingContainer}>
            <ActivityIndicator color={Colors.orange.light} size="small" />
          </View>
          <Text style={styles.sectionText}>Provisioning liquidity</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

ChannelStatusScreen.navigationOptions = () => ({
  ...modalScreenOptions(),
  ...headerWithBackButton,
  gestureEnabled: false,
});

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  contentContainer: {
    flexGrow: 1,
  },
  text: {
    ...TypographyPresets.Header4,
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    marginBottom: 16,
    justifyContent: 'center',
  },
  buttonContainer: {
    flexDirection: 'column',
    paddingHorizontal: 32,
  },
  errorIconContainer: {
    alignSelf: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: 50,
    backgroundColor: Colors.red.base,
    marginBottom: 20,
  },
  lottieIcon: {
    width: '40%',
    aspectRatio: 1,
    alignSelf: 'center',
  },
  navIconContainer: {
    justifyContent: 'center',
    width: 30,
    height: 30,
    borderRadius: 50,
    alignItems: 'center',
    backgroundColor: Colors.neutrals.light.neutral3,
  },
  helpNavIcon: {
    alignSelf: 'center',
    justifyContent: 'center',
    fontSize: 20,
    color: Colors.common.black,
  },
  section: {
    width: '100%',
    flex: 1,
    flexDirection: 'row',
    marginVertical: 5,
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
    fontSize: 24,
    color: Colors.green.base,
  },
  sectionIconContainer: {
    justifyContent: 'center',
    width: 30,
    height: 30,
    borderRadius: 50,
    alignItems: 'center',
    backgroundColor: 'rgba(39, 174, 96, 0.1)',
    marginRight: 12,
  },
  pendingContainer: {
    justifyContent: 'center',
    width: 30,
    height: 30,
    borderRadius: 50,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 157, 0, 0.1)',
    marginRight: 12,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutrals.light.neutral2,
  },
  statusText: {
    ...TypographyPresets.Body5,
    color: Colors.common.black,
    marginHorizontal: 12,
  },
});

export default ChannelStatusScreen;
