import React, { useEffect } from 'react';
import { StyleSheet, SafeAreaView, View, Text } from 'react-native';
import { HomeButton } from 'etta-ui';
import { noHeader } from '../navigation/Headers';
import ldk from '@synonymdev/react-native-ldk/dist/ldk';
import { useStoreState } from '../state/hooks';

const WalletHomeScreen = () => {
  const nodeStarted = useStoreState((state) => state.lightning.nodeStarted);
  const message = useStoreState((state) => state.lightning.message);
  useEffect(() => {
    (async (): Promise<void> => {
      // Connect to Electrum Server
      const nodeId = await ldk.nodeId();
      if (nodeId.isErr()) {
        console.error('Couldnot get the node ID');
        return;
      }
      console.info('node ID: ', nodeId);
    })();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ padding: 50 }} />
      <View>
        <Text>{nodeStarted ? 'node is up' : message}</Text>
      </View>
      <View style={styles.homeButtonsGroup}>
        <HomeButton style={{ marginHorizontal: 8 }} icon="icon-arrow-up">
          Send
        </HomeButton>
        <HomeButton style={{ marginHorizontal: 8 }} icon="icon-qr-code">
          Scan
        </HomeButton>
        <HomeButton style={{ marginHorizontal: 8 }} icon="icon-arrow-down">
          Receive
        </HomeButton>
      </View>
    </SafeAreaView>
  );
};

WalletHomeScreen.navigationOptions = noHeader;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    paddingHorizontal: 16,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  homeButtonsGroup: {
    flexDirection: 'row',
    marginBottom: 20,
  },
});

export default WalletHomeScreen;
