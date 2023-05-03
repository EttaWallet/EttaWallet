import React from 'react';
import { StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import { Colors, TypographyPresets } from 'etta-ui';

interface Props {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export default function FormLabel({ style, children }: Props) {
  return <Text style={[styles.container, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  container: {
    ...TypographyPresets.Body4,
    color: Colors.common.black,
  },
});
