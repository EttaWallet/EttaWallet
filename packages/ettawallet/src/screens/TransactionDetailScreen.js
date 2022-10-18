import React from 'react';
import {
  Text,
  Button,
  ListSection,
  ListIcon,
  ListItem,
  IconTextButton,
  Divider,
} from '@ettawallet/react-native-kit';
import { View, StyleSheet } from 'react-native';
import { Receive } from '@ettawallet/rn-bitcoin-icons/dist/filled';

const TransactionDetail = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Receive
        width={50}
        height={50}
        color="#2D9CDB"
        style={{ marginBottom: 20, alignSelf: 'center' }}
      />
      <Text
        style={{ textAlign: 'center', marginBottom: 30 }}
        typography="h4"
        fontWeight="semibold"
        fontColor="dark"
      >
        You received 10,000,000 sats
      </Text>

      <Divider style={{ marginBottom: -9 }} linePosition="top" />
      <ListSection>
        <ListItem title="From" description="bc1q..." />
        <Divider style={{ marginTop: -10 }} linePosition="bottom" />
        <ListItem
          title="Network fee"
          description="~7 sats"
          right={props => <ListIcon {...props} icon="icon-info" />}
        />
        <Divider style={{ marginTop: -10 }} linePosition="bottom" />
        <ListItem
          title="Swap fee"
          description="~2,000 sats"
          right={props => <ListIcon {...props} icon="icon-info" />}
        />
        <Divider style={{ marginTop: -10 }} linePosition="bottom" />
        <ListItem
          title="Details"
          right={props => (
            <IconTextButton
              variant="text"
              iconProps={{ name: 'icon-caret-down', size: 'deca' }}
              onPress={() =>
                console.log('show I/O info or link to block explorer')
              }
            />
          )}
        />
        <Divider style={{ marginTop: -10 }} linePosition="bottom" />
        <ListItem
          onPress={() => console.log('add a note')}
          title="Note"
          left={props => <ListIcon {...props} icon="icon-edit" />}
        />
        <ListItem
          onPress={() => console.log('add a tag')}
          title="Tags"
          left={props => <ListIcon {...props} icon="icon-tag" />}
        />
      </ListSection>
      <Button
        style={styles.button}
        color="secondary"
        variant="outlined"
        tone="neutral4"
        disabled // disabled state removed once both switches are validated
        onPress={() => navigation.navigate('FundWallet')}
      >
        <Text fontWeight="normal" fontColor="dark">
          Share receipt
        </Text>
      </Button>
      <Button
        style={styles.button}
        color="primary"
        variant="filled"
        tone="orange"
        onPress={() => navigation.navigate('ImproveSecurity')}
      >
        <Text fontWeight="normal" fontColor="light">
          Done
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
    marginTop: 50,
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

export default TransactionDetail;
