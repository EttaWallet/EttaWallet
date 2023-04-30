import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon } from 'etta-ui';

const CancelButton = () => {
  return (
    <View style={styles.container}>
      <Icon name="icon-caret-left" style={styles.iconContainer} />
      <Text style={styles.textContainer}>Back</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    paddingRight: 8,
    fontSize: 20,
  },
  textContainer: {
    fontSize: 18,
    lineHeight: 18,
    fontWeight: '500',
  },
});

export default CancelButton;
