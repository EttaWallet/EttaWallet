import React from 'react';
import { StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import ClipboardAwarePasteIcon from './ClipboardAwarePasteIcon';
import TextInputWithButtons from './TextInputWithButtons';
import Touchable from './Touchable';
import { Scan } from '@ettawallet/rn-bitcoin-icons/dist/filled';
import { navigate } from '../navigation/NavigationService';
import colors from '../styles/colors';

interface Props {
  inputContainerStyle?: ViewStyle;
  inputStyle?: TextInputProps['style'];
  accountAddress: string;
  onAddressChanged: (address: string) => void;
  color?: string;
}

const BtcAddressInput = ({
  inputContainerStyle,
  inputStyle,
  btcAddress,
  onAddressChanged,
  color = colors.goldUI,
}: Props) => {
  const onPressQrCode = () => {
    navigate('QRCodeScanner', {
      onAddressScanned: onAddressChanged,
    });
  };

  return (
    <TextInputWithButtons
      style={inputContainerStyle}
      inputStyle={inputStyle}
      placeholder={'bc1...'}
      placeholderTextColor={colors.gray3}
      onChangeText={onAddressChanged}
      value={btcAddress}
    >
      <ClipboardAwarePasteIcon
        style={styles.paste}
        onChangeText={onAddressChanged}
        color={color}
        value={btcAddress}
      />
      <Touchable borderless={true} onPress={onPressQrCode}>
        <Scan height={32} width={32} color={color} />
      </Touchable>
    </TextInputWithButtons>
  );
};

const styles = StyleSheet.create({
  paste: {
    marginRight: 8,
  },
});

export default BtcAddressInput;
