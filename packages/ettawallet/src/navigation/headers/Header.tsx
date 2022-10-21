import React from 'react';
import {
  GestureResponderEvent,
  InteractionManager,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewProps,
} from 'react-native';
import Animated, {
  Extrapolate,
  interpolate,
  spring,
  useValue,
} from 'react-native-reanimated';

type PageHeaderProps = {
  leftNode?: JSX.Element;
  rightNode?: JSX.Element;
  headerText?: string;
  handleOnPressLeftNode?: (event: GestureResponderEvent) => void;
  handleOnPressRightNode?: (event: GestureResponderEvent) => void;
  rightContainerStyle?: ViewProps['style'] | null;
  leftContainerStyle?: ViewProps['style'] | null;
  animatingWidthValues?: number[];
};

const PageHeader: React.FC<PageHeaderProps> = ({
  leftNode = null,
  rightNode = null,
  headerText = '',
  handleOnPressLeftNode = null,
  handleOnPressRightNode = null,
  rightContainerStyle = null,
  leftContainerStyle = null,
  animatingWidthValues = [0, 0],
}) => {
  const animatingValue = useValue(0);
  React.useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    InteractionManager.runAfterInteractions(() => {
      spring(animatingValue, {
        toValue: 1,
        mass: 1,
        damping: 15,
        stiffness: 120,
        overshootClamping: 0.001,
        restDisplacementThreshold: 0.001,
        restSpeedThreshold: 0.001,
      }).start();
    });
  }, []);
  return (
    <View>
      <View style={styles.pageHeaderContainer}>
        <Pressable
          onPress={handleOnPressLeftNode}
          style={leftContainerStyle || styles.leftItem}
        >
          {leftNode}
        </Pressable>
        <View style={styles.headerItem}>
          <Text style={styles.headerText}>{headerText}</Text>
        </View>
        <Pressable
          onPress={handleOnPressRightNode}
          style={rightContainerStyle || styles.rightItem}
        >
          {rightNode}
        </Pressable>
      </View>
      <View style={styles.viewTing}>
        <Animated.View
          style={[
            styles.animatedView,
            {
              width: interpolate(animatingValue, {
                inputRange: [0, 1],
                outputRange: [animatingWidthValues[0], animatingWidthValues[1]],
                extrapolate: Extrapolate.CLAMP,
              }),
            },
            styles.animatingBorder,
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  pageHeaderContainer: {
    flex: 1,
    marginTop: 50,
    color: '#000',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftItem: {
    paddingLeft: 20,
    paddingVertical: 20,
  },
  rightItem: {
    paddingRight: 20,
    paddingVertical: 20,
    alignItems: 'flex-end',
  },
  headerItem: {
    paddingVertical: 20,
  },
  animatingBorder: {
    top: -1,
  },
  animatedView: {
    position: 'absolute',
    borderBottomWidth: 2,
    borderColor: '#2563EB',
  },
  headerText: {
    fontSize: 20,
    fontWeight: '700',
    alignSelf: 'center',
  },
  viewTing: {
    width: '100%',
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
});

export default PageHeader;
