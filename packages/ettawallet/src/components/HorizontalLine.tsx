import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import colors from '../styles/colors';

const HorizontalLine = () => {
  return <View style={styles.container} />;
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderStyle: 'solid',
    borderTopWidth: 1,
    borderTopColor: colors.gray1,
    marginTop: 10,
    marginBottom: 15,
  },
});

export default HorizontalLine;
