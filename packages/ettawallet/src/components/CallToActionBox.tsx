import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import TextButton from './TextButton';
import colors from '../styles/colors';
import fontStyles from '../styles/fonts';

interface CTAProps {
  icon: React.ReactElement;
  header: string;
  body: string;
  cta: string;
  onPressCta: () => void;
}

// A CTA 'card'
export function CallToActionBox(props: CTAProps) {
  return (
    <View style={styles.container}>
      {props.icon}
      <View style={styles.textContainer}>
        <Text style={fontStyles.small500}>{props.header}</Text>
        <Text style={styles.bodyText}>{props.body}</Text>
        <TextButton onPress={props.onPressCta}>{props.cta}</TextButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: colors.gray1,
  },
  textContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  bodyText: {
    ...fontStyles.small,
    marginVertical: 10,
  },
});
