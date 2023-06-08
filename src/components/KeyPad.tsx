import { Colors, TypographyPresets } from 'etta-ui';
import * as React from 'react';
import { StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { Backspace } from '../icons/Backspace';

interface Props {
  onDigitPress: (digit: number) => void;
  onBackspacePress: () => void;
  onDecimalPress?: () => void;
  onBackspaceLongPress?: () => void;
  decimalSeparator?: string;
}

const Digit = ({
  number,
  onDigitPress,
}: {
  number: number;
  onDigitPress: (digit: number) => void;
}) => {
  const onPress = () => onDigitPress(number);
  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <Text allowFontScaling={false} style={styles.digit}>
        {number}
      </Text>
    </TouchableWithoutFeedback>
  );
};

export default function Keypad(props: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Digit number={1} onDigitPress={props.onDigitPress} />
        <Digit number={2} onDigitPress={props.onDigitPress} />
        <Digit number={3} onDigitPress={props.onDigitPress} />
      </View>
      <View style={styles.row}>
        <Digit number={4} onDigitPress={props.onDigitPress} />
        <Digit number={5} onDigitPress={props.onDigitPress} />
        <Digit number={6} onDigitPress={props.onDigitPress} />
      </View>
      <View style={styles.row}>
        <Digit number={7} onDigitPress={props.onDigitPress} />
        <Digit number={8} onDigitPress={props.onDigitPress} />
        <Digit number={9} onDigitPress={props.onDigitPress} />
      </View>
      <View style={styles.row}>
        {props.decimalSeparator && props.onDecimalPress ? (
          <TouchableWithoutFeedback onPress={props.onDecimalPress}>
            <Text style={styles.digit}>{props.decimalSeparator}</Text>
          </TouchableWithoutFeedback>
        ) : (
          <View style={styles.digit} />
        )}
        <Digit number={0} onDigitPress={props.onDigitPress} />
        <TouchableWithoutFeedback
          onPress={props.onBackspacePress}
          onLongPress={props.onBackspaceLongPress}
        >
          <View style={styles.digit}>
            <Backspace width={30} height={35} color={Colors.red.dark} />
          </View>
        </TouchableWithoutFeedback>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  row: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  digit: {
    ...TypographyPresets.Body2,
    width: 64,
    padding: 24,
    justifyContent: 'center',
    textAlign: 'center',
    alignItems: 'center',
    color: Colors.common.black,
  },
});
