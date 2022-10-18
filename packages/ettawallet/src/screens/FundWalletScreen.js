import React from 'react';
import {
  Text,
  Button,
  IconTextButton,
  ListSection,
  ListItem,
  Divider,
} from '@ettawallet/react-native-kit';
import { View, StyleSheet } from 'react-native';
import { Receive } from '@ettawallet/rn-bitcoin-icons/dist/filled';

const FundWallet = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Receive
        width={80}
        height={80}
        color="#BB6BD9"
        style={{ marginBottom: 20, alignSelf: 'center' }}
      />
      <Text
        style={{ textAlign: 'center', marginBottom: 10 }}
        typography="h3"
        fontWeight="bold"
        fontColor="dark"
      >
        Fund your wallet
      </Text>
      <Text style={styles.text} fontWeight="light" fontColor="dark">
        Deposit or buy bitcoin to get started
      </Text>
      <Divider style={{ marginBottom: -9 }} linePosition="top" />
      <ListSection>
        <ListItem
          style={{ fontSize: 70 }}
          right={props => (
            <IconTextButton
              variant="text"
              iconProps={{ name: 'icon-caret-right' }}
              onPress={() => navigation.navigate('DepositBitcoin')}
            />
          )}
          title="Receive bitcoin"
        />
        <Divider linePosition="bottom" />
        <ListItem
          right={props => (
            <IconTextButton
              variant="text"
              iconProps={{ name: 'icon-caret-right' }}
            />
          )}
          title="Buy bitcoin"
        />
      </ListSection>
      <Divider style={{ marginTop: -10 }} linePosition="bottom" />

      <Button
        style={styles.button}
        color="secondary"
        variant="outlined"
        tone="neutral4"
        onPress={() => navigation.navigate('ImproveSecurity')}
      >
        <Text fontWeight="normal" fontColor="dark">
          Do this later
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

export default FundWallet;
