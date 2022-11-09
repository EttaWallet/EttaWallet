import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import BottomSheet from './BottomSheet';
import Touchable from './Touchable';
import colors from '../styles/colors';
import fontStyles from '../styles/fonts';
import { Spacing } from '../styles/styles';
import { FeeStruct } from '../utils/types';

interface Props {
  isVisible: boolean;
  onFeeSelected: (feeType: string) => void;
  onClose: () => void;
  fees: FeeStruct[];
}

function FeeOption({
  feeInfo,
  onPress,
}: {
  feeInfo: FeeStruct;
  onPress: () => void;
}) {
  return (
    <Touchable onPress={onPress}>
      <View style={styles.feeOptionContainer}>
        <View style={styles.feeDetailContainer}>
          <Text style={styles.heading}>{feeInfo.label}</Text>
          <Text style={styles.subtitle}>{feeInfo.amount} sats</Text>
        </View>
        <View style={styles.feeRateContainer}>
          <Text style={styles.heading}>~{feeInfo.time}</Text>
          <Text style={styles.subtitle}>{feeInfo.rate}</Text>
        </View>
      </View>
    </Touchable>
  );
}

const FeeSelectionSheet = ({
  isVisible,
  onFeeSelected,
  onClose,
  fees,
}: Props) => {
  const feeList = fees.sort();

  const { t } = useTranslation();

  const onFeePressed = (feeType: string) => () => {
    onFeeSelected(feeType);
  };

  return (
    <BottomSheet isVisible={isVisible} onBackgroundPress={onClose}>
      <>
        <Text style={styles.title}>{t('selectFees')}</Text>
        {feeList.map((feeInfo, index) => {
          return (
            <React.Fragment key={`fee-${feeInfo.type}`}>
              {index > 0 && <View style={styles.separator} />}
              <FeeOption
                feeInfo={feeInfo}
                onPress={onFeePressed(feeInfo.type)}
              />
            </React.Fragment>
          );
        })}
      </>
    </BottomSheet>
  );
};

FeeSelectionSheet.navigationOptions = {};

const styles = StyleSheet.create({
  title: {
    ...fontStyles.navigationHeader,
    marginBottom: Spacing.Smallest8,
  },
  feeOptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  feeDetailContainer: {
    flex: 3,
    alignItems: 'flex-start',
    flexShrink: 1,
  },
  feeRateContainer: {
    flex: 2,
    flexShrink: 1,
    alignItems: 'flex-end',
  },
  heading: {
    flexShrink: 1,
    ...fontStyles.regular,
  },
  subtitle: {
    flexShrink: 1,
    ...fontStyles.small,
    color: colors.gray4,
  },
  separator: {
    width: '100%',
    height: 1,
    backgroundColor: colors.gray2,
  },
});

export default FeeSelectionSheet;
