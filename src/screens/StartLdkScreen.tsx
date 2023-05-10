import React, { useEffect, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, BackHandler, ScrollView, StyleSheet, Text, View } from 'react-native';
import { noHeader } from '../navigation/Headers';
import { navigateHome } from '../navigation/NavigationService';
import LottieView from 'lottie-react-native';
import { NodeState } from '../utils/types';
import { Button, Colors, TypographyPresets } from 'etta-ui';
import { useStoreActions, useStoreState } from '../state/hooks';
import { cueSuccessHaptic } from '../utils/accessibility/haptics';

export function StartLdkScreen() {
  const ldkState = useStoreState((state) => state.lightning.ldkState);
  const nodeStarted = useStoreState((state) => state.lightning.nodeStarted);
  const nodeId = useStoreState((state) => state.lightning.nodeId);
  const startNode = useStoreActions((actions) => actions.lightning.startLdk);

  useEffect(() => {
    if (!nodeStarted) {
      startNode().then();
    }
    return;
  }, [nodeStarted, startNode]);

  const onPressDone = () => {
    cueSuccessHaptic();
    requestAnimationFrame(() => {
      navigateHome();
    });
  };

  const navigationButtons = useMemo(() => {
    switch (ldkState) {
      case NodeState.ERROR:
        return (
          <View style={styles.actionBar}>
            <Button title="Try again" onPress={() => 0} style={styles.button} />
            <Button title="Done" onPress={onPressDone} appearance="outline" style={styles.button} />
          </View>
        );
      case NodeState.COMPLETE:
        return (
          <View style={styles.actionBar}>
            <Button title="Done" onPress={onPressDone} appearance="outline" style={styles.button} />
          </View>
        );
      default:
        return null;
    }
  }, [ldkState]);

  const stateDisplay = useMemo(() => {
    switch (ldkState) {
      default:
      case NodeState.START:
        return (
          <>
            <Text style={styles.text}>Initializing</Text>
            <Text style={styles.subText}>Starting your node ...</Text>
          </>
        );
      case NodeState.ERROR:
        return (
          <View>
            <Text style={styles.text}>Etta couldn't start your node</Text>
            <Text style={styles.subText}>Please try again</Text>
          </View>
        );
      case NodeState.COMPLETE:
        return (
          <>
            <Text style={styles.text}>Completed</Text>
            <Text style={styles.subText}>Your Node ID is: {nodeId}</Text>
          </>
        );
    }
  }, [ldkState, nodeId]);

  const stateIcon = useMemo(() => {
    switch (ldkState) {
      default:
      case NodeState.START:
        return <ActivityIndicator color={Colors.orange.light} />;
      case NodeState.ERROR:
        return <ActivityIndicator color={Colors.red.light} />;
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
        <View style={styles.iconContainer}>{stateIcon}</View>
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
    padding: 16,
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexGrow: 1,
  },
  text: {
    ...TypographyPresets.Header4,
    marginBottom: 16,
    textAlign: 'center',
  },
  subText: {
    ...TypographyPresets.Body3,
    paddingHorizontal: 16,
    textAlign: 'center',
    paddingBottom: 24,
  },
  button: {
    width: '100%',
    paddingBottom: 16,
  },
  actionBar: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  iconContainer: {
    marginTop: '32%',
    marginBottom: 16,
  },
  lottieIcon: {
    width: '50%',
    aspectRatio: 1,
  },
});

StartLdkScreen.navOptions = {
  ...noHeader,
  // Prevent swiping back on iOS
  gestureEnabled: false,
};

export default StartLdkScreen;
