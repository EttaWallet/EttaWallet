/* eslint-disable react-hooks/rules-of-hooks */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useStoreActions, useStoreState } from '../state/hooks';
import CircularProgress from 'react-native-circular-progress-indicator';
import LottieView from 'lottie-react-native';

const StartLN: React.FC = () => {
  const startNode = useStoreActions((actions) => actions.lightning.startNode);
  const message = useStoreState((state) => state.lightning.message);
  const nodeStarted = useStoreState((state) => state.lightning.nodeStarted);
  const progress = useStoreState((state) => state.lightning.progress);

  useEffect(() => {
    const runThunks = async () => {
      const connectToElectrum = useStoreActions((actions) => actions.lightning.connectToElectrum);
      const syncLdk = useStoreActions((actions) => actions.lightning.syncLdk);
      const setupLdk = useStoreActions((actions) => actions.lightning.setupLdk);

      const thunks = [connectToElectrum, syncLdk, setupLdk];

      const totalThunks = thunks.length;
      let numThunksCompleted = 0;

      for (const thunk of thunks) {
        await new Promise<void>((resolve, reject) => {
          thunk()
            .then(() => {
              numThunksCompleted++;
              const progressValue = (numThunksCompleted / totalThunks) * 100;
              useStoreActions((actions) => actions.lightning.setProgress(progressValue));
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
  }, [nodeStarted, startNode]);

  return (
    <View style={styles.container}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
  },
  lottieIcon: {
    width: '50%',
    aspectRatio: 1,
  },
});

export default StartLN;
