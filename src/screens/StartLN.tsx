/* eslint-disable react-hooks/rules-of-hooks */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useStoreActions, useStoreState } from '../state/hooks';
import CircularProgress from 'react-native-circular-progress-indicator';
import LottieView from 'lottie-react-native';
import { Button } from 'etta-ui';
import { SafeAreaView } from 'react-native-safe-area-context';

const StartLN: React.FC = () => {
  const startNode = useStoreActions((actions) => actions.lightning.startNode);
  const message = useStoreState((state) => state.lightning.message);
  const nodeStarted = useStoreState((state) => state.lightning.nodeStarted);
  const progress = useStoreState((state) => state.lightning.progress);

  const connectToElectrum = useStoreActions((actions) => actions.lightning.connectToElectrum);
  const syncLdk = useStoreActions((actions) => actions.lightning.syncLdk);
  const setupLdk = useStoreActions((actions) => actions.lightning.setupLdk);
  const setProgress = useStoreActions((actions) => actions.lightning.setProgress);

  useEffect(() => {
    const runThunks = async () => {
      const thunks = [connectToElectrum, syncLdk, setupLdk];

      const totalThunks = thunks.length;
      let numThunksCompleted = 0;

      for (const thunk of thunks) {
        await new Promise<void>((resolve, reject) => {
          thunk()
            .then(() => {
              numThunksCompleted++;
              const progressValue = (numThunksCompleted / totalThunks) * 100;
              setProgress(progressValue);
              resolve();
            })
            .catch((error) => {
              reject(error);
            });
        });
      }
    };

    if (!nodeStarted) {
      startNode();
    } else {
      runThunks();
    }
  }, [connectToElectrum, nodeStarted, setProgress, setupLdk, startNode, syncLdk]);

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
        <CircularProgress radius={100} value={progress} activeStrokeWidth={12} />
      )}
      <Text style={styles.text}>{message || 'Initializing node...'}</Text>
      <View style={styles.buttonContainer}>
        <Button
          appearance="filled"
          onPress={() => 0}
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
  },
  text: {
    fontSize: 18,
    marginTop: 10,
    fontFamily: fontFamilyChoice,
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
