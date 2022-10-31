import React from 'react';
import { Text, Button } from '@ettawallet/react-native-kit';
import { View, StyleSheet } from 'react-native';
import { BitcoinCircle } from '@ettawallet/rn-bitcoin-icons/dist/filled';
import { navigate } from '../navigation/NavigationService';

const WelcomeScreen = () => {
  return (
    <View style={styles.container}>
      <BitcoinCircle
        style={{ alignSelf: 'center', marginTop: 50 }}
        width={100}
        height={100}
        color="#F7931A"
      />
      <Text
        style={{ textAlign: 'center', marginBottom: 10 }}
        typography="h1"
        fontWeight="bold"
        fontColor="dark"
      >
        EttaWallet
      </Text>
      <Text
        style={styles.text}
        typography="h5"
        fontWeight="light"
        fontColor="dark"
      >
        Bitcoin is for all of us!
      </Text>
      <Button
        style={styles.button}
        color="primary"
        variant="filled"
        tone="orange"
        // onPress={() => navigate('SetPin')}
        onPress={() => navigate('Language')}
      >
        <Text fontWeight="normal" fontColor="light">
          Create a new wallet
        </Text>
      </Button>
      <Button
        style={styles.button}
        color="primary"
        variant="text"
        tone="orange"
        onPress={() => navigate('Restore Wallet')}
      >
        <Text fontWeight="normal" fontColor="orange">
          Restore existing wallet
        </Text>
      </Button>
      <Text style={styles.footer} fontWeight="light">
        Your wallet, your coins. {'\n'} 100% open-source & open-design.
        {'\n'} Built with ❤️ in Uganda
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignContent: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    marginBottom: 50,
    textAlign: 'center',
    fontSize: 20,
    color: 'gray',
  },
  button: {
    marginBottom: 10,
  },
  footer: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 'auto',
  },
});

export default WelcomeScreen;
