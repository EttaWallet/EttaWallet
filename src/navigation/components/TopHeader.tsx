import * as React from 'react';
import { processColor, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { cond, greaterThan } from 'react-native-reanimated';
// import Hamburger from '../../icons/Hamburger';
import { Colors } from 'etta-ui';
import Logo from '../../icons/Logo';
import { pressableHitSlop } from '../../utils/helpers';

interface Props {
  middleElement?: React.ReactNode;
  leftElement?: React.ReactNode;
  scrollPosition?: Animated.Value<number>;
  onPressLogo?: () => void;
}

function TopHeader({ middleElement, leftElement, scrollPosition, onPressLogo }: Props) {
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

  return (
    <Animated.View style={viewStyle}>
      <TouchableOpacity
        style={styles.rightElement}
        onPress={onPressLogo}
        hitSlop={pressableHitSlop}
      >
        {/* <Hamburger /> */}
        <Logo height={32} />
      </TouchableOpacity>
      {middleElement}
      {leftElement && <View style={styles.leftElement}>{leftElement}</View>}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  rightElement: {
    position: 'absolute',
    right: 0,
    padding: 0,
    marginRight: 16,
    marginBottom: 0,
  },
  leftElement: {
    position: 'absolute',
    left: 0,
    padding: 0,
    marginLeft: 16,
    marginBottom: 0,
  },
});

export default TopHeader;
