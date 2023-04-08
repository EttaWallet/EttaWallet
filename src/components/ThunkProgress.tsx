import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useStoreState, useStoreDispatch } from '../state/hooks';

const StartLN: React.FC = () => {
  const nodeStarted = useStoreState((state) => state.lightning.nodeStarted);
  const message = useStoreState((state) => state.lightning.message);
  const dispatch = useStoreDispatch();

  React.useEffect(() => {
    dispatch.lightning.connectToElectrum();
  }, [dispatch.lightning]);

  if (!nodeStarted) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>{message || 'Loading...'}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Thunks executed successfully</Text>
    </View>
  );
};

export default StartLN;
