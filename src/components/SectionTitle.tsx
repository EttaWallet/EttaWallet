/* eslint-disable react-native/no-inline-styles */
import { Colors, TypographyPresets } from 'etta-ui';
import * as React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

interface Props {
  title: string;
  details?: string;
  style?: StyleProp<ViewStyle>;
}

const SectionTitle = ({ title, details, style }: Props) => {
  return (
    <View style={style}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
      </View>
      {details && (
        <View style={styles.detailsContainer}>
          <Text style={styles.details}>{details}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...TypographyPresets.Header5,
    color: Colors.common.black,
  },
  detailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  details: {
    ...TypographyPresets.Body5,
    color: Colors.neutrals.light.neutral7,
  },
});

export default SectionTitle;
