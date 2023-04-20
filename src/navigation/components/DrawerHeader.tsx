import { useNavigation } from '@react-navigation/native';
import * as React from 'react';
import { processColor, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { cond, greaterThan } from 'react-native-reanimated';
import Hamburger from '../../icons/Hamburger';
import { Colors } from 'etta-ui';

interface Props {
  middleElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  scrollPosition?: Animated.Value<number>;
  testID?: string;
}

function DrawerHeader({ middleElement, rightElement, scrollPosition }: Props) {
  const navigation = useNavigation();
  const viewStyle = React.useMemo(
    () => ({
      ...styles.container,
      borderBottomWidth: 1,
      borderBottomColor: cond(
        greaterThan(scrollPosition ?? new Animated.Value(0), 0),
        // TODO: fix type
        processColor(Colors.neutrals.light.neutral4) as any,
        processColor('transparent') as any
      ) as any,
    }),
    [scrollPosition]
  );

  const onPressHamburger = () => {
    // @ts-ignore Only used in a drawer
    return navigation.toggleDrawer();
  };

  return (
    <Animated.View style={viewStyle}>
      <TouchableOpacity
        style={styles.hamburger}
        onPress={onPressHamburger}
        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
      >
        <Hamburger />
      </TouchableOpacity>
      {middleElement}
      {rightElement && <View style={styles.rightElement}>{rightElement}</View>}
    </Animated.View>
  );
}

DrawerHeader.defaultProps = {
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
  hamburger: {
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

export default DrawerHeader;
