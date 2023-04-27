import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useStoreActions, useStoreState } from '../state/hooks';
import CircularProgress from 'react-native-circular-progress-indicator';
import LottieView from 'lottie-react-native';
import { Button } from 'etta-ui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { navigate } from '../navigation/NavigationService';
import { Screens } from '../navigation/Screens';
import { sleep } from '../utils/helpers';

const StartLN: React.FC = () => {
  const [message, setMessage] = useState('Hang tight. Setting up your lightning wallet ...');
  const startNode = useStoreActions((actions) => actions.lightning.startLdk);
  const nodeStarted = useStoreState((state) => state.lightning.nodeStarted);

  useEffect(() => {
    if (!nodeStarted) {
      startNode().then();
    } else {
      setMessage('All set. Proceed to your wallet');
    }
    return;
  }, [nodeStarted, startNode]);

  const onPressProceed = () => {
    sleep(1000);
    navigate(Screens.DrawerNavigator);
  };

  return (
    <SafeAreaView style={styles.container}>
      {nodeStarted ? (
        <LottieView
          style={styles.lottieIcon}
          source={require('../../assets/lottie/success-check.json')}
          autoPlay={true}
          loop={false}
        />
      ) : (
        <CircularProgress radius={100} value={50} valueSuffix={'%'} activeStrokeWidth={12} />
      )}
      <Text style={styles.text}>{message}</Text>
      <View style={styles.buttonContainer}>
        <Button
          appearance="filled"
          onPress={onPressProceed}
          title="Proceed"
          disabled={!nodeStarted}
          style={styles.proceedBtn}
        />
      </View>
    </SafeAreaView>
  );
};

const fontFamilyChoice = Platform.OS === 'ios' ? 'Menlo-Regular' : 'monospace';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', // center vertically
    alignItems: 'center', // center horizontally
    paddingHorizontal: 40,
  },
  text: {
    fontSize: 18,
    marginTop: 20,
    fontFamily: fontFamilyChoice,
    textAlign: 'center',
  },
  lottieIcon: {
    width: '50%',
    aspectRatio: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 30, // move to the bottom of the screen
    marginBottom: 20,
    marginHorizontal: 40,
    width: '80%',
    justifyContent: 'center',
  },
  proceedBtn: {
    justifyContent: 'center',
  },
});

export default StartLN;
