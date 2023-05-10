import { Colors, TypographyPresets } from 'etta-ui';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { pressableHitSlop } from '../../utils/helpers';

interface Props {
  showToast: boolean;
  title?: string;
  message: string | React.ReactElement;
  labelCTA: string;
  onPress(): void;
}

// this value is used to ensure the toast is offset by its own height when transitioning in and out of view
const TOAST_HEIGHT = 100;
const SHOW_DURATION = 300;
const HIDE_DURATION = 150;

export const useShowHideAnimation = (
  progress: Animated.SharedValue<number>,
  showing: boolean,
  onShow: () => void,
  onHide: () => void
) => {
  useEffect(() => {
    progress.value = withTiming(
      showing ? 1 : 0,
      { duration: showing ? SHOW_DURATION : HIDE_DURATION },
      (isFinished) => {
        if (isFinished && !showing) {
          runOnJS(onHide)();
        }
      }
    );
    if (showing) {
      onShow();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showing]);
};

// for now, this Toast component is launched from the bottom of the screen only
const ToastWithCTA = ({ showToast, onPress, message, labelCTA, title }: Props) => {
  const [isVisible, setIsVisible] = useState(showToast);

  const progress = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: (1 - progress.value) * TOAST_HEIGHT }],
    };
  });

  useShowHideAnimation(
    progress,
    showToast,
    () => {
      setIsVisible(true);
    },
    () => {
      setIsVisible(false);
    }
  );

  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.toast}>
        <View style={styles.contentContainer}>
          {!!title && <Text style={styles.title}>{title}</Text>}
          <Text style={styles.message}>{message}</Text>
        </View>
        <TouchableWithoutFeedback onPress={onPress} hitSlop={pressableHitSlop}>
          <Text style={styles.labelCTA}>{labelCTA}</Text>
        </TouchableWithoutFeedback>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    width: '100%',
  },
  toast: {
    backgroundColor: Colors.common.black,
    borderRadius: 8,
    marginHorizontal: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    ...TypographyPresets.Header5,
    color: Colors.common.white,
  },
  message: {
    ...TypographyPresets.Body5,
    color: Colors.common.white,
  },
  labelCTA: {
    ...TypographyPresets.Body5,
    color: Colors.green.base,
  },
});

export default ToastWithCTA;
