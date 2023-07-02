import { Colors, Icon } from 'etta-ui';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';

interface Props {
  isExpandable: boolean;
  isExpanded: boolean;
  containerStyle?: ViewStyle;
  children?: React.ReactNode;
  arrowColor?: string;
}

export default function Expandable({
  isExpandable,
  isExpanded,
  containerStyle,
  children,
  arrowColor,
}: Props) {
  const anim = useRef(new Animated.Value(0)).current;
  const firstRun = useRef(true);

  useEffect(() => {
    if (firstRun.current === true) {
      firstRun.current = false;
      return;
    }
    Animated.spring(anim, {
      toValue: isExpanded ? 1 : 0,
      overshootClamping: true,
      useNativeDriver: true,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpanded]);

  const arrowRotation = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={[styles.container, containerStyle]}>
      {children}
      {isExpandable && (
        // eslint-disable-next-line react-native/no-inline-styles
        <Animated.View style={{ marginLeft: 7, transform: [{ rotate: arrowRotation }] }}>
          <Icon
            name="icon-caret-down"
            style={{ color: arrowColor ? arrowColor : Colors.common.black }}
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
});
