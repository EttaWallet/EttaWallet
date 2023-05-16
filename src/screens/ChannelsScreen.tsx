import React from 'react';
import { Text, SafeAreaView, StyleSheet, View, Platform } from 'react-native';
import { headerWithBackButton } from '../navigation/Headers';
import { useStoreState } from '../state/hooks';

const ChannelsScreen = () => {
  const channels = useStoreState((state) => state.lightning.channels);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.messageContainer}>
        <Text style={styles.text}>
          {Object.entries(channels).map(([key, value]) => (
            <Text key={key}>{value.short_channel_id}</Text>
          ))}
        </Text>
      </View>
    </SafeAreaView>
  );
};

ChannelsScreen.navigationOptions = {
  ...headerWithBackButton,
  ...Platform.select({
    ios: { animation: 'slide_from_bottom' },
  }),
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
