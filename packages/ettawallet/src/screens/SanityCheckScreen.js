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
import { Wallet } from '@ettawallet/rn-bitcoin-icons/dist/filled';

const SanityCheck = ({ navigation }) => {
  const [check, setCheck] = useState(false);

  return (
    <View style={styles.container}>
      <Wallet
        width={80}
        height={80}
        color="#27AE60"
        style={{ marginBottom: 20, alignSelf: 'center' }}
      />
      <Text
        style={{ textAlign: 'center', marginBottom: 20 }}
        typography="h3"
        fontWeight="bold"
        fontColor="dark"
      >
        Two things you must understand
      </Text>
      <Divider linePosition="top" />
      <ListSection style={{ marginBottom: 50 }}>
        <ListItem
          right={props => <Switch active={check} onChange={setCheck} />}
          title="With bitcoin, you are your own bank. No one else has access to your private keys."
        />
        <Divider linePosition="bottom" />
        <ListItem
          right={props => <Switch active={check} onChange={setCheck} />}
          title="If you lose access to this app, and the backup we will help you create, your bitcoin cannot be recovered."
        />
      </ListSection>
      <Button
        style={styles.button}
        color="primary"
        variant="filled"
        tone="neutral4"
        // disabled  disabled state removed once both switches are validated
        onPress={() => navigation.navigate('WalletGenerator')}
      >
        <Text fontWeight="normal" fontColor="light">
          Next
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
  button: {
    marginTop: 'auto',
  },
});

export default SanityCheck;
