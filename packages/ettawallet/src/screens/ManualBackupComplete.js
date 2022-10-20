import React from 'react';
import { Text, Button } from '@ettawallet/react-native-kit';
import { View, StyleSheet } from 'react-native';
import { Check } from '@ettawallet/rn-bitcoin-icons/dist/filled';
/**
 *
 * Users will see this component once they've completed the manual backup process succesfully. They are then redirected in 3 seconds
 */

const ManualBackupComplete = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Check
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
        Back Up Verified
      </Text>
      <Text
        style={styles.text}
        typography="h5"
        fontWeight="light"
        fontColor="dark"
      >
        You have verified your manual backup. Please keep your seed safe.
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

export default ManualBackupComplete;
