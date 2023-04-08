import React, { useState, useEffect } from 'react';
import { Text, SafeAreaView, StyleSheet, View } from 'react-native';
import { setupLdk, syncLdk, updateHeader } from '../ldk';
import { connectToElectrum, subscribeToHeader } from '../utils/electrum';

const TestScreen = () => {
  const [message, setMessage] = useState('...');
  const [nodeStarted, setNodeStarted] = useState(false);

  useEffect(() => {
    //Restarting LDK on each code update causes constant errors.
    if (nodeStarted) {
      return;
    }

    (async (): Promise<void> => {
      // Connect to Electrum Server
      try {
        const electrumResponse = await connectToElectrum({});
        if (electrumResponse.isErr()) {
          setMessage(`Unable to connect to Electrum Server:\n ${electrumResponse.error.message}`);
          return;
        }
        // Subscribe to new blocks and sync LDK accordingly.
        const headerInfo = await subscribeToHeader({
          onReceive: async (): Promise<void> => {
            const syncRes = await syncLdk();
            if (syncRes.isErr()) {
              setMessage(syncRes.error.message);
              return;
            }
            setMessage(syncRes.value);
          },
        });
        if (headerInfo.isErr()) {
          setMessage(headerInfo.error.message);
          return;
        }
        await updateHeader({ header: headerInfo.value });
        // Setup LDK
        const setupResponse = await setupLdk();
        if (setupResponse.isErr()) {
          setMessage(setupResponse.error.message);
          return;
        }

        setNodeStarted(true);
        setMessage(setupResponse.value);
      } catch (error) {
        setMessage(`Error: ${error.message}`);
      }
    })();
  }, [nodeStarted]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.messageContainer}>
        <Text style={styles.text}>{message}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageContainer: {
    minHeight: 120,
    marginHorizontal: 20,
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
});

export default TestScreen;
