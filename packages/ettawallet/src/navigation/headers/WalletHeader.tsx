import { useNavigation } from '@react-navigation/native';
import * as React from 'react';
import { processColor, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { cond, greaterThan } from 'react-native-reanimated';
import { QrCode, Scan } from '@ettawallet/rn-bitcoin-icons/dist/filled';
import { Contacts } from '@ettawallet/rn-bitcoin-icons/dist/outline';
import colors from '../../styles/colors';
import { TopBarIconButton } from '../headers/TopBarButton';

interface Props {
  middleElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  scrollPosition?: Animated.Value<number>;
}

const WalletHeader = ({
  middleElement,
  rightElement,
  scrollPosition,
}: Props) => {
  const navigation = useNavigation();
  const viewStyle = React.useMemo(
    () => ({
      ...styles.container,
      borderBottomWidth: 1,
      borderBottomColor: cond(
        greaterThan(scrollPosition ?? new Animated.Value(0), 0),
        // TODO: fix type
        processColor(colors.gray2) as any,
        processColor('transparent') as any
      ) as any,
    }),
    [scrollPosition]
  );

  const onPressContactsBtn = () => {
    return null;
  };

  const onPressQrCodeBtn = () => {
    return null;
  };

  return (
    <Animated.View style={viewStyle}>
      <TopBarIconButton
        style={styles.contactsBtn}
        onPress={onPressContactsBtn}
        icon={<Contacts width={35} height={35} color={colors.dark} />}
      />
      {/* should probably add a logo in the middle??? */}
      {middleElement}
      <TopBarIconButton
        style={styles.rightElement}
        onPress={onPressQrCodeBtn}
        icon={<Scan width={35} height={35} color={colors.dark} />}
      />
    </Animated.View>
  );
};

WalletHeader.defaultProps = {
  showLogo: true,
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  contactsBtn: {
    position: 'absolute',
    left: 0,
    padding: 0,
    marginLeft: 16,
    marginBottom: 0,
  },
  rightElement: {
    position: 'absolute',
    right: 0,
    padding: 0,
    marginRight: 16,
    marginBottom: 0,
  },
});

export default WalletHeader;
