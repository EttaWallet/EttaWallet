import { Colors, TypographyPresets } from 'etta-ui';
import React, { useState } from 'react';
import { LayoutAnimation, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import Expandable from './Expandable';
import {
  TChannelManagerPaymentPathFailed,
  TChannelManagerPaymentPathSuccessful,
} from '@synonymdev/react-native-ldk';
import Clipboard from '@react-native-clipboard/clipboard';
import { showToast } from '../utils/alerts';
import { cueInformativeHaptic } from '../utils/accessibility/haptics';

interface Props {
  buttonTitle?: string;
  path:
    | TChannelManagerPaymentPathFailed['path_hops']
    | TChannelManagerPaymentPathSuccessful['path_hops'];
  style?: StyleProp<ViewStyle>;
}

const PathDrawer = ({ path, buttonTitle }: Props) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    LayoutAnimation.easeInEaseOut();
    setExpanded(!expanded);
  };

  const title = buttonTitle ? buttonTitle : 'Route';

  const onPressCopy = () => {
    Clipboard.setString(JSON.stringify(path) || '');
    showToast({ message: 'Path copied to clipboard' });
    cueInformativeHaptic();
  };

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
        <TouchableWithoutFeedback onPress={onPressCopy}>
          {path.map((hop, index) => (
            <Text key={index}>{JSON.stringify(hop)}</Text>
          ))}
        </TouchableWithoutFeedback>
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

export default PathDrawer;
