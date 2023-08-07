import { Colors, TypographyPresets } from 'etta-ui';
import React, { useState } from 'react';
import { LayoutAnimation, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import Expandable from './Expandable';
import { InfoListItem } from './InfoListItem';
import { TLightningPayment } from '../utils/types';
import PathDrawer from './PathDrawer';

interface Props {
  buttonTitle?: string;
  transaction: TLightningPayment;
  style?: StyleProp<ViewStyle>;
}

const DetailedActivityDrawer = ({ transaction, buttonTitle }: Props) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    LayoutAnimation.easeInEaseOut();
    setExpanded(!expanded);
  };

  const title = buttonTitle ? buttonTitle : 'Details';

  return (
    <View>
      <TouchableWithoutFeedback onPress={toggleExpanded}>
        <View style={styles.titleContainer}>
          <Expandable isExpandable={true} isExpanded={expanded}>
            <Text style={styles.title}>{title}</Text>
          </Expandable>
        </View>
      </TouchableWithoutFeedback>
      {expanded && (
        <View>
          {transaction.invoice && (
            <InfoListItem
              title="BOLT11 invoice"
              value={transaction.invoice}
              canCopy={true}
              maskValue={true}
            />
          )}
          {transaction.payment_hash && (
            <InfoListItem
              title="Payment hash"
              value={transaction.payment_hash}
              valueIsNumeric={false}
              canCopy={true}
              maskValue={true}
            />
          )}
          {transaction.payment_preimage && (
            <InfoListItem
              title="Payment preimage"
              value={transaction.payment_preimage}
              valueIsNumeric={false}
              canCopy={true}
              maskValue={true}
            />
          )}
          {transaction.pathData && transaction.pathData.length > 0 && (
            <PathDrawer path={transaction.pathData} buttonTitle="Path" />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingLeft: 3,
  },
  title: {
    ...TypographyPresets.Body4,
    color: Colors.common.black,
  },
});

export default DetailedActivityDrawer;
