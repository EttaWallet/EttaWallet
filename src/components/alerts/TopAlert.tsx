import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlexStyle,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlertTypes } from '../../utils/types';
import { cueErrorHaptic, cueInformativeHaptic } from '../../utils/accessibility/haptics';
import { Button, Colors, Icon, TypographyPresets } from 'etta-ui';

interface Props {
  alert: {
    type: AlertTypes;
    title?: string | null;
    message: string;
    dismissAfter?: number | null;
    buttonMessage?: string | null;
    onPress: () => void;
  } | null;
}

// This component needs to be always mounted for the hide animation to be visible
function TopAlert({ alert }: Props) {
  const [visibleAlertState, setVisibleAlertState] = useState(alert);
  const insets = useSafeAreaInsets();
  const yOffset = useRef(new Animated.Value(-500));
  const containerRef = useRef<View>();

  function hide() {
    if (!containerRef.current) {
      return;
    }

    containerRef.current.measure((l, t, w, height) => {
      Animated.timing(yOffset.current, {
        toValue: -height,
        duration: 150,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setVisibleAlertState(null);
        }
      });
    });
  }

  useEffect(() => {
    if (alert) {
      // show
      setVisibleAlertState(alert);
      if (type === AlertTypes.ERROR) {
        cueErrorHaptic();
      } else {
        cueInformativeHaptic();
      }
    } else {
      // hide
      hide();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alert]);

  useEffect(() => {
    let timeoutHandle: number;

    if (!visibleAlertState) {
      return;
    }

    const rafHandle: number = requestAnimationFrame(() => {
      if (!containerRef.current) {
        return;
      }

      containerRef.current.measure((l, t, w, height) => {
        Animated.timing(yOffset.current, {
          // @ts-ignore, react-native type defs are missing this one!
          fromValue: -height,
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();

        if (visibleAlertState.dismissAfter) {
          timeoutHandle = window.setTimeout(hide, visibleAlertState.dismissAfter);
        }
      });
    });

    return () => {
      if (rafHandle) {
        cancelAnimationFrame(rafHandle);
      }
      if (timeoutHandle) {
        window.clearTimeout(timeoutHandle);
      }
    };
  }, [visibleAlertState]);

  if (!visibleAlertState || visibleAlertState.type === AlertTypes.TOAST) {
    return null;
  }

  const { type, title, message, buttonMessage, onPress } = visibleAlertState;
  const isError = type === AlertTypes.ERROR;

  return (
    <View style={styles.overflowContainer}>
      <TouchableWithoutFeedback onPress={onPress}>
        <Animated.View
          ref={containerRef}
          style={[
            styles.container,
            (buttonMessage && styles.containerWithButton) as FlexStyle,
            isError && styles.containerError,
            {
              paddingTop: insets.top + PADDING_VERTICAL,
              transform: [{ translateY: yOffset.current }],
            },
          ]}
        >
          {isError && (
            <View style={styles.iconContainer}>
              <Icon name="icon-alert" style={styles.errorIcon} />
            </View>
          )}
          <Text
            style={[TypographyPresets.Body5, isError && TypographyPresets.Header5, styles.text]}
          >
            {!!title && <Text style={[TypographyPresets.Header5, styles.text]}> {title} </Text>}
            {message}
          </Text>
          {buttonMessage && (
            <Button
              size="small"
              onPress={onPress}
              title={buttonMessage}
              appearance="filled"
              style={styles.button}
              textStyle={styles.buttonText}
            />
          )}
        </Animated.View>
      </TouchableWithoutFeedback>
    </View>
  );
}

const PADDING_VERTICAL = 10;

const styles = StyleSheet.create({
  overflowContainer: {
    overflow: 'hidden',
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.neutrals.light.neutral3,
    paddingBottom: PADDING_VERTICAL,
    paddingHorizontal: 25,
  },
  containerError: {
    backgroundColor: Colors.red.base,
  },
  containerWithButton: {
    flexDirection: 'column',
  },
  text: {
    color: 'white',
    // Unset explicit lineHeight set by fonts.tsx otherwise the text is not centered vertically
    lineHeight: undefined,
    textAlign: 'center',
  },
  iconContainer: {
    alignSelf: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
    borderRadius: 50,
    backgroundColor: Colors.red.base,
    marginBottom: 20,
  },
  errorIcon: {
    fontSize: 20,
    marginLeft: 5,
    marginRight: 8,
    color: Colors.common.white,
  },
  button: {
    marginTop: 8,
    borderColor: Colors.common.white,
    alignSelf: 'center',
  },
  buttonText: {
    color: Colors.common.white,
  },
});

export default TopAlert;
