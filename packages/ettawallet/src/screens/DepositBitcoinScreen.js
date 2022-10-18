import React from 'react';
import { Text, Button } from '@ettawallet/react-native-kit';
import { View, StyleSheet } from 'react-native';
import QRCodeComponent from '../components/QRCodeComponent';

const DepositBitcoin = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text
        style={{ textAlign: 'center', marginBottom: 10 }}
        typography="h3"
        fontWeight="bold"
        fontColor="dark"
      >
        Deposit bitcoin to this address
      </Text>
      <Text style={styles.text} fontWeight="light" fontColor="dark">
        Use an existing bitcoin wallet or have a friend send you some bitcoin.
      </Text>
      {/* QR code component goes here. Should be able to toggle between address and QRcode with buttons to share copy etc */}
      <QRCodeComponent value="bitcoin:1BgGZ9tcN4rm9KBzDn7KprQz87SZ26SAMH" />
      <Button
        style={styles.button}
        color="primary"
        variant="filled"
        tone="orange"
        onPress={() => navigation.navigate('MainArea')}
      >
        <Text fontWeight="normal" fontColor="light">
          I made the deposit
        </Text>
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignContent: 'space-between',
    justifyContent: 'center',
    padding: 20,
    marginTop: 50, // kill this once we have headers
  },
  text: {
    marginBottom: 50,
    textAlign: 'center',
    fontSize: 18,
    color: '#777777',
  },
  button: {
    marginTop: 'auto',
  },
});

export default DepositBitcoin;
