import React, { useState } from 'react';
import {
  Text,
  Button,
  Switch,
  ListSection,
  ListItem,
  Divider,
} from '@ettawallet/react-native-kit';
import { View, StyleSheet } from 'react-native';
import { Safe } from '@ettawallet/rn-bitcoin-icons/dist/filled';

const ImproveSecurity = ({ navigation }) => {
  const [check, setCheck] = useState(false);

  return (
    <View style={styles.container}>
      <Safe
        width={80}
        height={80}
        color="#2D9CDB"
        style={{ marginBottom: 20, alignSelf: 'center' }}
      />
      <Text
        style={{ textAlign: 'center', marginBottom: 20 }}
        typography="h3"
        fontWeight="bold"
        fontColor="dark"
      >
        Improve your security
      </Text>
      <Text style={styles.text} fontWeight="light" fontColor="dark">
        Enable PIN or Face ID to ensure only you can access the wallet and
        transact with your funds.
      </Text>
      <Divider style={{ marginBottom: -9 }} linePosition="top" />
      <ListSection>
        <ListItem
          style={{ fontSize: 70 }}
          right={props => <Switch active={check} onChange={setCheck} />}
          title="PIN"
          description="Set a PIN to protect your wallet from unauthorized access."
        />
        <Divider linePosition="bottom" />
        <ListItem
          right={props => <Switch active={check} onChange={setCheck} />}
          title="Face ID"
          description="Require detection of your face for wallet access."
        />
      </ListSection>
      <Divider style={{ marginTop: -4 }} linePosition="bottom" />
      <Button
        style={styles.button}
        color="secondary"
        variant="outlined"
        tone="neutral4"
        disabled // disabled state removed once both switches are validated
        onPress={() => navigation.navigate('FundWallet')}
      >
        <Text fontWeight="normal" fontColor="dark">
          Do this later
        </Text>
      </Button>
      <Button
        style={styles.button2}
        color="primary"
        variant="filled"
        tone="orange"
        onPress={() => navigation.navigate('FundWallet')}
      >
        <Text fontWeight="normal" fontColor="light">
          Continue
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
  button2: {
    marginTop: 20,
  },
});

export default ImproveSecurity;
