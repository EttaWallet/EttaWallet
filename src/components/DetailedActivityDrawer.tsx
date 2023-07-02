import { Colors, TypographyPresets } from 'etta-ui';
import React, { useState } from 'react';
import { LayoutAnimation, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import Expandable from './Expandable';
import { InfoListItem } from './InfoListItem';

interface Props {
  buttonTitle?: string;
  invoice?: string;
  pre_image?: string;
  node?: string;
  style?: StyleProp<ViewStyle>;
}

const DetailedActivityDrawer = ({ invoice, pre_image, node, buttonTitle }: Props) => {
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
          {invoice && (
            <InfoListItem
              title="From node"
              value={node}
              valueIsNumeric={false}
              canCopy={true}
              maskValue={true}
            />
          )}
          {invoice && (
            <InfoListItem
              title="Lightning invoice"
              value={invoice}
              canCopy={true}
              maskValue={true}
            />
          )}
          {pre_image && (
            <InfoListItem
              title="Payment hash"
              value={pre_image}
              valueIsNumeric={false}
              canCopy={true}
              maskValue={true}
            />
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
    paddingHorizontal: 16,
  },
  title: {
    ...TypographyPresets.Body4,
    color: Colors.common.black,
  },
});

export default DetailedActivityDrawer;
