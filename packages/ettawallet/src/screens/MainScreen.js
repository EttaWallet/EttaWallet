import React from 'react';
import { Text } from '@ettawallet/react-native-kit';
import { View, StyleSheet } from 'react-native';

const MainArea = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text
        style={{ textAlign: 'center', marginBottom: 10 }}
        typography="h3"
        fontWeight="bold"
        fontColor="dark"
      >
        0 sats
      </Text>
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

export default MainArea;
