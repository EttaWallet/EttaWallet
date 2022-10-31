import { useNavigation } from '@react-navigation/native';
import * as React from 'react';
import { processColor, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { cond, greaterThan } from 'react-native-reanimated';
import { Contacts } from '@ettawallet/rn-bitcoin-icons/dist/filled';
import colors from '../../styles/colors';
import { iconHitslop } from '../../styles/variables';

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

  const onPressContactBtn = () => {
    // @ts-ignore
    return navigation.toggleDrawer();
  };

  return (
    <Animated.View style={viewStyle}>
      <TouchableOpacity
        style={styles.contactsBtn}
        onPress={onPressContactBtn}
        hitSlop={iconHitslop}
      >
        <Contacts
          width={35}
          height={35}
          color={colors.gray3}
          style={{ marginBottom: 20, alignSelf: 'center' }}
        />
      </TouchableOpacity>
      {middleElement}
      {rightElement && <View style={styles.rightElement}>{rightElement}</View>}
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
