// VIEW Paste icon that disappears when the |currentValue| passed matches the content
// of the clipboard.

import React from 'react';
import { StyleProp, ViewProps, ViewStyle } from 'react-native';
import Touchable from './Touchable';
import {
  PasteAwareWrappedElementProps,
  withPasteAware,
} from './WithPasteAware';
import { iconHitslop } from '../styles/variables';
import { Copy } from '@ettawallet/rn-bitcoin-icons/dist/filled';

interface PasteAwareProps {
  style?: StyleProp<ViewStyle>;
  color: string;
  onChangeText: (text: string) => void;
  value: string;
}

const isAddressFormat = (address: string): boolean => {
  return address.startsWith('bc1' || '3');
};

const ClipboardAwarePasteIcon = ({
  style,
  color,
  ...otherProps
}: PasteAwareProps) => {
  class Wrapper extends React.Component<
    ViewProps & PasteAwareWrappedElementProps
  > {
    render() {
      const { isPasteIconVisible, onPressPaste } = this.props;
      if (!isPasteIconVisible) {
        return null;
      }
      return (
        <Touchable style={style} onPress={onPressPaste} hitSlop={iconHitslop}>
          <Copy width={32} height={32} color={color} />
        </Touchable>
      );
    }
  }

  const Icon = withPasteAware(Wrapper);
  return <Icon shouldShowClipboard={isAddressFormat} {...otherProps} />;
};

export default ClipboardAwarePasteIcon;
