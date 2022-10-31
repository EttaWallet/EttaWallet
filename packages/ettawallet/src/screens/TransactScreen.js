import React, { useState, useRef } from 'react';
import Animated from 'react-native-reanimated';
import { Text, IconTextButton, Chip } from '@ettawallet/react-native-kit';
import { View, StyleSheet } from 'react-native';
import { Touchable } from '../components/Touchable';
import WalletHeader from '../navigation/headers/WalletHeader';
import {
  BitcoinCircle,
  QrCode,
} from '@ettawallet/rn-bitcoin-icons/dist/filled';
import { navigate } from '../navigation/NavigationService';

const onPressQrCode = () => {
  navigate('QRNavigator');
};

export const QRCodeButton = () => {
  return (
    <Touchable borderless={true} onPress={onPressQrCode}>
      <QrCode width={32} height={32} color="#000000" />
    </Touchable>
  );
};

const Transact = ({ navigation }) => {
  const scrollPosition = useRef(new Animated.Value(0)).current;
  const onScroll = Animated.event([
    { nativeEvent: { contentOffset: { y: scrollPosition } } },
  ]);

  const [satsAmount, setSatsAmount] = useState(0);

  const updateAmount = newAmount => {
    setSatsAmount(newAmount);
  };

  return (
    <View style={styles.container}>
      <WalletHeader
        middleElement={<BitcoinCircle width={30} height={30} color="#000000" />}
        scrollPosition={scrollPosition}
        rightElement={<QrCode width={32} height={32} color="#000000" />}
      />
      <Chip
        mode="outlined"
        icon="icon-bitcoin-circle"
        onPress={() => {
          navigation.navigate('TransactionDetail');
        }}
        style={[styles.chip, styles.customBorderRadius]}
      >
        Receiving 10,000,000 sats
      </Chip>
      <Text
        style={{ textAlign: 'center', marginBottom: 10 }}
        typography="h1"
        fontWeight="bold"
        fontColor="dark"
      >
        {satsAmount} sats
      </Text>
      <Text
        style={{ textAlign: 'center', marginBottom: 10 }}
        typography="h5"
        fontWeight="regular"
        fontColor="dark"
      >
        10,000 UGX
      </Text>
      {/* <VirtualKeyboard
        color="#48484a"
        pressMode="string"
        decimal
        applyBackspaceTint
        clearOnLongPress
        onPress={val => updateAmount(val)}
        rowStyle={{ marginTop: 50 }}
      /> */}
      <View style={styles.btnGroup}>
        <IconTextButton
          style={styles.button}
          variant="filled"
          color="primary"
          tone="orange"
          size="small"
          label={'Request'}
        />
        <IconTextButton
          style={styles.button}
          variant="filled"
          color="primary"
          tone="neutral4"
          size="small"
          label={'Pay'}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: 50, // kill this once we have headers
  },
  text: {
    marginBottom: 50,
    textAlign: 'center',
    fontSize: 18,
    color: '#777777',
  },
  button: {
    minWidth: 150,
  },
  btnGroup: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 'auto',
    marginBottom: 20,
  },
  chip: {
    margin: 4,
    marginBottom: 20,
  },
  customBorderRadius: {
    borderRadius: 16,
  },
});

export default Transact;
