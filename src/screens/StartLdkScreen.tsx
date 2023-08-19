/* eslint-disable react-hooks/exhaustive-deps */
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
import { navigate } from '../navigation/NavigationService';
import LottieView from 'lottie-react-native';
import { NodeState } from '../utils/types';
import { Button, Colors, Icon, TypographyPresets } from 'etta-ui';
import { useStoreActions, useStoreState } from '../state/hooks';
import { cueInformativeHaptic, cueSuccessHaptic } from '../utils/accessibility/haptics';
import { restartApp } from '../utils/restart';
import Clipboard from '@react-native-clipboard/clipboard';
import { showToast } from '../utils/alerts';
import { pressableHitSlop } from '../utils/helpers';
import { verticalScale } from '../utils/sizing';
import { Screens } from '../navigation/Screens';
export function StartLdkScreen() {
  const ldkState = useStoreState((state) => state.lightning.ldkState);
  const nodeStarted = useStoreState((state) => state.lightning.nodeStarted);
  const nodeId = useStoreState((state) => state.lightning.nodeId);
  const startNode = useStoreActions((actions) => actions.lightning.startLdk);

  const onPressStart = useCallback(() => {
    cueInformativeHaptic();
    if (!nodeStarted) {
      startNode();
    } else {
      cueSuccessHaptic();
    }
    // return;
  }, [nodeStarted]);

  const onPressDone = () => {
    navigate(Screens.WalletHomeScreen);
  };

  const onPressCopy = () => {
    Clipboard.setString(nodeId || '');
    cueInformativeHaptic();
    showToast({
      message: 'Copied to your clipboard',
    });
  };

  const update = useMemo(() => {
    switch (ldkState) {
      case NodeState.ERROR:
        return null;
      case NodeState.START:
        return 'Starting your node ...';
      case NodeState.COMPLETE:
        return 'All set';
      default:
        return null;
    }
  }, [ldkState]);

  const actionButtons = useMemo(() => {
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
            <Button title="Try again" onPress={onPressStart} style={styles.button} />
            <Button
              title="Restart EttaWallet"
              onPress={restartApp}
              appearance="outline"
              style={styles.button}
            />
          </View>
        );
      case NodeState.START:
        return (
          <View style={styles.buttonContainer}>
            <Button
              title="Proceed to wallet"
              onPress={onPressDone}
              appearance="filled"
              style={styles.button}
              disabled={!nodeStarted}
            />
          </View>
        );
      case NodeState.COMPLETE:
        return (
          <View style={styles.buttonContainer}>
            <Button
              title="Proceed to wallet"
              onPress={onPressDone}
              appearance="filled"
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
          <View style={styles.section}>
            <View style={styles.pendingContainer}>
              <ActivityIndicator color={Colors.orange.light} size="small" />
            </View>
            <Text style={styles.sectionText}>{update}</Text>
          </View>
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
            <Text style={styles.text}>All set!</Text>
            <TouchableOpacity onPress={onPressCopy} hitSlop={pressableHitSlop}>
              <View style={styles.nodeIdBox}>
                <Text style={styles.subText}>Node ID</Text>
                <Text style={styles.nodeId}>{nodeId}</Text>
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
        return (
          <View style={styles.lottieContainer}>
            <LottieView
              style={styles.lottieIcon}
              source={require('../../assets/lottie/starting.json')}
              autoPlay={true}
              loop={true}
            />
          </View>
        );
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
    <SafeAreaView style={styles.safeAreaView} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View>{stateIcon}</View>
        {stateDisplay}
      </ScrollView>
      {actionButtons}
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
  lottieContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
    height: 200,
    borderRadius: 50,
    backgroundColor: Colors.neutrals.light.neutral1,
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
    marginTop: 24,
  },
  nodeId: {
    textAlign: 'center',
  },
  copy: {
    ...TypographyPresets.Body5,
    paddingTop: 10,
    textDecorationLine: 'underline',
    color: Colors.neutrals.light.neutral7,
    textAlign: 'center',
  },
  section: {
    flexDirection: 'row',
    marginVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionText: {
    ...TypographyPresets.Body4,
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
    marginRight: 5,
  },
});

StartLdkScreen.navOptions = {
  ...noHeader,
  // Prevent swiping back on iOS
  gestureEnabled: false,
};

export default StartLdkScreen;
