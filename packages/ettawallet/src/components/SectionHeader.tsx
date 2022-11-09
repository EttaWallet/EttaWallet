import * as React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import colors from '../styles/colors';
import fontStyles from '../styles/fonts';
import variables from '../styles/variables';

interface Props {
  text: string;
  style?: StyleProp<ViewStyle>;
}

const SectionHeader = ({ text, style }: Props) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.light,
    paddingHorizontal: variables.contentPadding,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  text: {
    ...fontStyles.sectionHeader,
    fontSize: 13,
    lineHeight: 16,
    color: colors.gray4,
  },
});

export default SectionHeader;
