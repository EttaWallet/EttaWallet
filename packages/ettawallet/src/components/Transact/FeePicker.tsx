import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Touchable from '../../components/Touchable';
import DownArrowIcon from '../../icons/DownArrowIcon';
import colors from '../../styles/colors';

interface Props {
  feeOption: string;
  onChangeFee: () => void;
}

const FeeSelector = ({ feeOption, onChangeFee }: Props) => {
  const getFeeInfo = feeOption => {
    return {
      label: 'Fast',
      amount: 200,
    };
  };
  const feeInfo = getFeeInfo(feeOption);

  const onButtonPressed = () => {
    onChangeFee();
  };

  return (
    <Touchable style={styles.touchable} onPress={onButtonPressed}>
      <View style={styles.container}>
        <Text allowFontScaling={false} style={styles.fee}>
          {feeInfo?.label} - {feeInfo?.amount} sats
        </Text>
        <DownArrowIcon height={16} color={colors.orangeUI} />
      </View>
    </Touchable>
  );
};

const styles = StyleSheet.create({
  touchable: {},
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    paddingRight: 8,
    borderRadius: 10,
    backgroundColor: colors.lightGreen,
  },
  fee: {
    paddingVertical: 8,
    paddingLeft: 8,
    color: colors.orangeUI,
  },
});

export default FeeSelector;
