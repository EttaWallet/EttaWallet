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
import { Cloud } from '@ettawallet/rn-bitcoin-icons/dist/filled';

const Backup = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Cloud
        width={80}
        height={80}
        color="#BB6BD9"
        style={{ marginBottom: 20, alignSelf: 'center' }}
      />
      <Text
        style={{ textAlign: 'center', marginBottom: 20 }}
        typography="h3"
        fontWeight="bold"
        fontColor="dark"
      >
        Back up your wallet to cloud storage
      </Text>
      <Text style={styles.text} fontWeight="light" fontColor="dark">
        Regularly saves an encrypted copy of your wallet to your cloud account.
        {'\n'}
        Allows for easy recovery in case you lose access to this device.
      </Text>
      <Divider style={{ marginBottom: -9 }} linePosition="top" />
      <ListSection style={{ marginBottom: 50 }}>
        <ListItem
          style={{ fontSize: 70 }}
          right={props => (
            <IconTextButton
              variant="text"
              iconProps={{ name: 'icon-caret-right' }}
            />
          )}
          title="Apple iCloud"
        />
        <Divider linePosition="bottom" />
        <ListItem
          right={props => (
            <IconTextButton
              variant="text"
              iconProps={{ name: 'icon-caret-right' }}
            />
          )}
          title="Google Drive"
        />
      </ListSection>
      <Button
        color="primary"
        variant="text"
        tone="orange"
        onPress={() => navigation.navigate('')}
      >
        <Text fontWeight="normal" fontColor="orange">
          Learn more
        </Text>
      </Button>
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

export default Backup;
