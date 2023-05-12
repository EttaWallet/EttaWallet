import React, { useCallback, useEffect, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  BackHandler,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { noHeader } from '../navigation/Headers';
import { navigate, navigateHome } from '../navigation/NavigationService';
import LottieView from 'lottie-react-native';
import { NodeState } from '../utils/types';
import { Button, Colors, Icon, TypographyPresets } from 'etta-ui';
import { useStoreActions, useStoreState } from '../state/hooks';
import { cueInformativeHaptic, cueSuccessHaptic } from '../utils/accessibility/haptics';
import { restartApp } from '../utils/restart';
import Clipboard from '@react-native-clipboard/clipboard';
import { showToast } from '../utils/alerts';
import { pressableHitSlop } from '../utils/helpers';
import { Screens } from '../navigation/Screens';

export function StartLdkScreen() {
  const ldkState = useStoreState((state) => state.lightning.ldkState);
  const nodeStarted = useStoreState((state) => state.lightning.nodeStarted);
  const nodeId = useStoreState((state) => state.lightning.nodeId);
  const startNode = useStoreActions((actions) => actions.lightning.startLdk);

  // useEffect(() => {
  //   if (!nodeStarted) {
  //     startNode().then();
  //   }
  //   return;
  // }, [nodeStarted, startNode]);

  const onPressStart = useCallback(() => {
    if (!nodeStarted) {
      startNode().then();
    }
    return;
  }, [nodeStarted]);

  const onPressDone = () => {
    cueSuccessHaptic();
    requestAnimationFrame(() => {
      navigateHome();
    });
  };

  const onPressOpenChannel = () => {
    cueInformativeHaptic();
    // go to channels intro
    navigate(Screens.LightningChannelsIntroScreen);
  };

  const onPressCopy = () => {
    Clipboard.setString(nodeId || '');
    cueInformativeHaptic();
    showToast({
      message: 'Copied to your clipboard',
    });
  };

  const navigationButtons = useMemo(() => {
    switch (ldkState) {
      case NodeState.OFFLINE:
        return (
          <View style={styles.buttonContainer}>
            <Button title="Start" onPress={onPressStart} style={styles.button} />
          </View>
        );
      case NodeState.ERROR:
        return (
          <View style={styles.buttonContainer}>
            <Button title="Try again" onPress={() => 0} style={styles.button} />
            <Button
              title="Restart EttaLN"
              onPress={restartApp}
              appearance="outline"
              style={styles.button}
            />
          </View>
        );
      case NodeState.COMPLETE:
        return (
          <View style={styles.buttonContainer}>
            <Button
              title="Open a channel"
              onPress={onPressOpenChannel}
              appearance="filled"
              style={styles.button}
            />
            <Button
              title="Proceed to wallet"
              onPress={onPressDone}
              appearance="outline"
              style={styles.button}
            />
          </View>
        );
      default:
        return null;
    }
  }, [ldkState]);

  const stateDisplay = useMemo(() => {
    switch (ldkState) {
      default:
      case NodeState.OFFLINE:
        return (
          <>
            <Text style={styles.text}>Start your lightning node</Text>
            <Text style={styles.subText}>Send and receive instant payments ...</Text>
          </>
        );
      case NodeState.START:
        return (
          <>
            <Text style={styles.text}>Initializing</Text>
            <Text style={styles.subText}>Starting your lightning node ...</Text>
          </>
        );
      case NodeState.ERROR:
        return (
          <View>
            <Text style={styles.text}>Couldn't start your node</Text>
            <Text style={styles.subText}>
              This could happen for any number of reasons. Please try again
            </Text>
          </View>
        );
      case NodeState.COMPLETE:
        return (
          <>
            <Text style={styles.text}>Your node is ready</Text>
            <Text style={styles.subText}>Node ID</Text>
            <TouchableOpacity onPress={onPressCopy} hitSlop={pressableHitSlop}>
              <View style={styles.nodeIdBox}>
                <Text>{nodeId}</Text>
                <Text style={styles.copy}>Tap to copy</Text>
              </View>
            </TouchableOpacity>
          </>
        );
    }
  }, [ldkState, nodeId]);

  const stateIcon = useMemo(() => {
    switch (ldkState) {
      default:
      case NodeState.OFFLINE:
        return (
          <View style={styles.iconContainer}>
            <Icon name="icon-lightning" style={styles.icon} />
          </View>
        );
      case NodeState.START:
        return <ActivityIndicator color={Colors.orange.light} size="large" />;
      case NodeState.ERROR:
        return (
          <View style={styles.errorIconContainer}>
            <Icon name="icon-alert" style={styles.icon} />
          </View>
        );
      case NodeState.COMPLETE:
        return (
          <LottieView
            style={styles.lottieIcon}
            source={require('../../assets/lottie/success-check.json')}
            autoPlay={true}
            loop={false}
          />
        );
    }
  }, [ldkState]);

  // Prevent back button on Android
  useEffect(() => {
    const backPressListener = () => true;
    BackHandler.addEventListener('hardwareBackPress', backPressListener);
    return () => BackHandler.removeEventListener('hardwareBackPress', backPressListener);
  }, []);

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View>{stateIcon}</View>
        {stateDisplay}
      </ScrollView>
      {navigationButtons}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
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

StartLdkScreen.navOptions = {
  ...noHeader,
  // Prevent swiping back on iOS
  gestureEnabled: false,
};

export default StartLdkScreen;
