import React from 'react';
import { StyleSheet, SafeAreaView, View } from 'react-native';
import { HomeButton } from 'etta-ui';
import { noHeader } from '../navigation/Headers';

const WalletHomeScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={{ padding: 50 }} />
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
