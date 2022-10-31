/**
 *
 * Users will see this component once they've completed the manual backup process succesfully. They are then redirected in 3 seconds
 */

import React, { useEffect, useContext } from 'react';
import { Text, Button } from '@ettawallet/react-native-kit';
import { View, StyleSheet } from 'react-native';
import { Check } from '@ettawallet/rn-bitcoin-icons/dist/filled';
import colors from '../styles/colors';
import { navigate } from '../navigation/NavigationService';
import { EttaStorageContext } from '../../storage/context';

const ManualBackupComplete = () => {
  const { backupCompleted } = useContext(EttaStorageContext);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (backupCompleted) {
        navigate('TabsRoot'); // go to main screen
      } else {
        throw new Error(
          'Backup complete screen should not be reachable without completing backup'
        );
      }
    }, 3000); // redirect after 3 seconds
    return () => clearTimeout(timer);
  }, []);
  return (
    <View style={styles.container}>
      <Check
        style={{ alignSelf: 'center', marginTop: 50 }}
        width={100}
        height={100}
        color={colors.greenUI}
      />
      <Text
        style={{ textAlign: 'center', marginBottom: 10 }}
        typography="h3"
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
        Well done!. {'\n'}Please keep your recovery phrase safe. Memorize it if
        you can.
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
    fontSize: 16,
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
