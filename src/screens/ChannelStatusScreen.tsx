import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, BackHandler, ScrollView, StyleSheet, Text } from 'react-native';
import { noHeader } from '../navigation/Headers';
import { navigateHome } from '../navigation/NavigationService';
import LottieView from 'lottie-react-native';
import { Colors, TypographyPresets } from 'etta-ui';
import { cueSuccessHaptic } from '../utils/accessibility/haptics';
import { verticalScale } from '../utils/sizing';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StackParamList } from '../navigation/types';
import { Screens } from '../navigation/Screens';
import { sleep } from '../utils/helpers';

type RouteProps = NativeStackScreenProps<StackParamList, Screens.ChannelStatusScreen>;

export function ChannelStatusScreen(props: RouteProps) {
  const channel = props.route.params.channel;

  // Prevent back button on Android
  useEffect(() => {
    const backPressListener = () => true;
    BackHandler.addEventListener('hardwareBackPress', backPressListener);
    return () => BackHandler.removeEventListener('hardwareBackPress', backPressListener);
  }, []);

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
    <SafeAreaView style={styles.safeAreaView}>
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
    <SafeAreaView style={styles.safeAreaView}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <ActivityIndicator color={Colors.orange.light} size="large" />
        <Text style={styles.text}>Negotiating receiving capacity with liquidity provider</Text>
        <Text style={styles.subText}>This will only take a few minutes ...</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    marginBottom: verticalScale(24),
  },
  contentContainer: {
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  text: {
    ...TypographyPresets.Header4,
    marginBottom: 16,
    textAlign: 'center',
  },
  subText: {
    ...TypographyPresets.Body4,
    paddingHorizontal: 16,
    textAlign: 'center',
    paddingBottom: 10,
  },
  button: {
    marginBottom: 16,
    justifyContent: 'center',
  },
  buttonContainer: {
    flexDirection: 'column',
    paddingHorizontal: 32,
  },
  icon: {
    alignSelf: 'center',
    justifyContent: 'center',
    fontSize: 52,
    color: Colors.common.white,
  },
  iconContainer: {
    alignSelf: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: 50,
    backgroundColor: Colors.purple.base,
    marginBottom: 20,
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
  },
  nodeIdBox: {
    borderRadius: 4,
    backgroundColor: Colors.neutrals.light.neutral3,
    padding: 16,
  },
  copy: {
    ...TypographyPresets.Body5,
    paddingTop: 10,
    textDecorationLine: 'underline',
    color: Colors.neutrals.light.neutral7,
    textAlign: 'center',
  },
});

ChannelStatusScreen.navOptions = {
  ...noHeader,
  // Prevent swiping back on iOS
  gestureEnabled: false,
};

export default ChannelStatusScreen;
