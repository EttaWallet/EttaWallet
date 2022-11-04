import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Touchable from '../components/Touchable';
import { ArrowLeft } from '@ettawallet/rn-bitcoin-icons/dist/filled';
import Backspace from '../icons/Backspace';
import fontStyles from '../styles/fonts';
import colors from '../styles/colors';

interface Props {
  onDigitPress: (digit: number) => void;
  onBackspacePress: () => void;
  onDecimalPress?: () => void;
  onBackspaceLongPress?: () => void;
  decimalSeparator?: string;
}

const DigitButton = ({
  digit,
  onDigitPress,
}: {
  digit: number;
  onDigitPress: (digit: number) => void;
}) => {
  const onPress = () => onDigitPress(digit);
  return (
    <Touchable borderless={true} onPress={onPress}>
      <Text allowFontScaling={false} style={styles.digit}>
        {digit}
      </Text>
    </Touchable>
  );
};

const NumericKeypad = (props: Props) => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <DigitButton digit={1} onDigitPress={props.onDigitPress} />
        <DigitButton digit={2} onDigitPress={props.onDigitPress} />
        <DigitButton digit={3} onDigitPress={props.onDigitPress} />
      </View>
      <View style={styles.row}>
        <DigitButton digit={4} onDigitPress={props.onDigitPress} />
        <DigitButton digit={5} onDigitPress={props.onDigitPress} />
        <DigitButton digit={6} onDigitPress={props.onDigitPress} />
      </View>
      <View style={styles.row}>
        <DigitButton digit={7} onDigitPress={props.onDigitPress} />
        <DigitButton digit={8} onDigitPress={props.onDigitPress} />
        <DigitButton digit={9} onDigitPress={props.onDigitPress} />
      </View>
      <View style={styles.row}>
        {props.decimalSeparator && props.onDecimalPress ? (
          <Touchable borderless={true} onPress={props.onDecimalPress}>
            <Text style={styles.digit}>{props.decimalSeparator}</Text>
          </Touchable>
        ) : (
          <View style={styles.digit} />
        )}
        <DigitButton digit={0} onDigitPress={props.onDigitPress} />
        <Touchable
          borderless={true}
          onPress={props.onBackspacePress}
          onLongPress={props.onBackspaceLongPress}
        >
          <View style={styles.digit}>
            <Backspace color={colors.error} />
          </View>
        </Touchable>
      </View>
    </View>
  );
};

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
    ...fontStyles.regular500,
    width: 64,
    padding: 24,
    fontSize: 22,
    lineHeight: 28,
    justifyContent: 'center',
    textAlign: 'center',
    alignItems: 'center',
  },
});

export default NumericKeypad;
