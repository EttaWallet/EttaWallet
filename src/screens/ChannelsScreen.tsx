import React, { useEffect, useRef, useState } from 'react';
import { Text, SafeAreaView, StyleSheet, View } from 'react-native';
import DrawerHeader from '../navigation/components/DrawerHeader';
import Animated from 'react-native-reanimated';
import { getLightningChannels, startLightning } from '../utils/lightning/helpers';
import { isLdkRunning, waitForLdk } from '../ldk';
import { TChannel } from '@synonymdev/react-native-ldk';

const ChannelsScreen = () => {
  const scrollPosition = useRef(new Animated.Value(0)).current;

  const [channels, setChannels] = useState({
    value: [],
  });

  useEffect(() => {
    async function getAllLdkChannels() {
      try {
        // ensure Ldk is up
        const isLdkUp = await isLdkRunning();
        if (!isLdkUp) {
          await startLightning({});
        }
        await waitForLdk();
        const allChannels = await getLightningChannels();
        setChannels({ value: allChannels.value });
        console.log('all channels: ', allChannels);
      } catch (e) {
        console.error(e.message);
      }
    }

    getAllLdkChannels();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <DrawerHeader scrollPosition={scrollPosition} showLogo={false} />
      <View style={styles.messageContainer}>
        <Text style={styles.text}>
          {channels.value.map((item: TChannel) => (
            <Text key={item.short_channel_id}>{item.short_channel_id}</Text>
          ))}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
});

export default ChannelsScreen;
