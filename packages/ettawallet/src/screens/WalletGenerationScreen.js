import BdkRn from 'bdk-rn';
import React, { useState } from 'react';
import { Text, Button } from '@ettawallet/react-native-kit';
import { View, StyleSheet } from 'react-native';

const WalletGenerator = ({ navigation }) => {
  const [mnemonic, setMnemonic] = useState('');
  const [displayText, setDisplayText] = useState('');
  const [balance, setBalance] = useState();
  const [wallet, setWallet] = useState();
  const [syncResponse, setSyncResponse] = useState();
  const [address, setAddress] = useState();

  // Methods

  const getMnemonic = async () => {
    const { data } = await BdkRn.generateMnemonic({
      network: 'testnet',
      length: 12,
    });
    console.log(data);
    setMnemonic(data);
    setDisplayText(JSON.stringify(data));
  };

  const createWallet = async () => {
    const { data } = await BdkRn.createWallet({
      mnemonic: mnemonic,
      network: 'mainnet',
    });
    setWallet(data);
    setDisplayText(JSON.stringify(data));
  };

  const syncWallet = async () => {
    const { data } = await BdkRn.syncWallet();
    setSyncResponse(data);
    setDisplayText(JSON.stringify(data));
  };

  const getBalance = async () => {
    const { data } = await BdkRn.getBalance();
    setBalance(data);
    setDisplayText(data);
  };

  const getAddress = async () => {
    const { data } = await BdkRn.getNewAddress();
    setAddress(data);
    setDisplayText(data);
  };

  return (
    <View style={styles.container}>
      {/* method call result */}
      {displayText ? (
        <View>
          <Text fontWeight="normal" fontColor="dark" selectable>
            Response:
          </Text>
          <Text fontWeight="normal" fontColor="dark" selectable>
            {displayText}
          </Text>
        </View>
      ) : null}
      <Button
        style={styles.button}
        color="secondary"
        variant="outlined"
        tone="neutral4"
        onPress={getMnemonic}
      >
        <Text fontWeight="normal" fontColor="dark">
          Generate Mnemonic
        </Text>
      </Button>
      <Button
        style={styles.button}
        color="primary"
        variant="outlined"
        tone="neutral4"
        onPress={createWallet}
      >
        <Text fontWeight="normal" fontColor="dark">
          Create Wallet
        </Text>
      </Button>
      <Button
        style={styles.button}
        color="secondary"
        variant="outlined"
        tone="neutral2"
        onPress={syncWallet}
      >
        <Text fontWeight="normal" fontColor="dark">
          Sync Wallet
        </Text>
      </Button>
      <Button
        style={styles.button}
        color="secondary"
        variant="outlined"
        tone="neutral2"
        onPress={getBalance}
      >
        <Text fontWeight="normal" fontColor="dark">
          Get Balance
        </Text>
      </Button>
      <Button
        style={styles.button}
        color="secondary"
        variant="outlined"
        tone="neutral2"
        onPress={getAddress}
      >
        <Text fontWeight="normal" fontColor="dark">
          Get Address
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

export default WalletGenerator;
