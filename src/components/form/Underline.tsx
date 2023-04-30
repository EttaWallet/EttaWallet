import { Colors } from 'etta-ui';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function FormUnderline() {
  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    height: 1,
    backgroundColor: Colors.neutrals.light.neutral4,
  },
});
