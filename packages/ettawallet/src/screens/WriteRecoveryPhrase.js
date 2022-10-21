import React, { useContext } from 'react';
import { EttaStorageContext } from '../../storage/context';
import { Text, Button } from '@ettawallet/react-native-kit';
import { View, StyleSheet } from 'react-native';

const WriteRecoveryPhrase = ({ navigation }) => {
  const { mnemonic } = useContext(EttaStorageContext);

  return (
    <View style={styles.container}>
      {/* method call result */}
      {mnemonic ? (
        <View>
          <Text fontWeight="normal" fontColor="dark" typography="h3">
            Recovery Phrase:
          </Text>
          <Text fontWeight="normal" fontColor="dark" typography="h4" selectable>
            {mnemonic}
          </Text>
        </View>
      ) : null}
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
});

export default WriteRecoveryPhrase;
