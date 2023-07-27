import React, { useEffect, useState, useRef } from 'react';
import { Keyboard, Text, View, LayoutAnimation } from 'react-native';
import { useTheme } from 'etta-ui';
import { getPincodeStyles } from './pincode.style';
import Keypad from '../KeyPad';
import { cueInformativeHaptic } from '../../utils/accessibility/haptics';

// How long the last entered digit is visible
const LAST_DIGIT_VISIBLE_INTERVAL = 1000; // 1secs

const PIN_LENGTH = 6;

interface Props {
  title?: string;
  subtitle?: string;
  errorText?: string;
  maxLength?: number;
  pin: string;
  onChangePin: (pin: string) => void;
  onCompletePin: (pin: string) => void;
}

const PincodeComponent = ({
  title,
  subtitle,
  errorText,
  maxLength = PIN_LENGTH,
  pin,
  onChangePin,
  onCompletePin,
}: Props) => {
  const theme = useTheme();
  const styles = getPincodeStyles(theme);

  const onDigitPress = (digit: number) => {
    if (pin.length >= maxLength) {
      return;
    }

    const newPin = pin + digit;
    onChangePin(newPin);
  };

  const onBackspacePress = () => {
    cueInformativeHaptic();
    onChangePin(pin.substring(0, pin.length - 1));
  };

  useEffect(() => {
    if (pin.length === maxLength) {
      requestAnimationFrame(() => onCompletePin(pin));
    }
  }, [maxLength, onCompletePin, pin]);

  useEffect(() => {
    Keyboard.dismiss();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <View style={styles.pincodeContainer}>
        <PincodeDisplay pinEntered={pin} maxLength={maxLength} />
      </View>
      <Text style={styles.error}>{errorText || ' '}</Text>
      <View style={styles.spacer} />
      <Keypad onDigitPress={onDigitPress} onBackspacePress={onBackspacePress} />
    </View>
  );
};

interface PinDisplayProps {
  pinEntered: string;
  maxLength: number;
}

const PincodeDisplay = ({ pinEntered, maxLength }: PinDisplayProps) => {
  const [revealIndex, setRevealIndex] = useState(-1);
  const prevPinRef = useRef(pinEntered);

  const theme = useTheme();
  const styles = getPincodeStyles(theme);

  useEffect(() => {
    const prevPin = prevPinRef.current;
    prevPinRef.current = pinEntered;

    // Check if pin length is smaller, so as not to reveal previous digits
    // when deleting
    if (pinEntered.length < prevPin.length) {
      LayoutAnimation.configureNext({
        ...LayoutAnimation.Presets.easeInEaseOut,
        duration: 150,
      });
      setRevealIndex(-1);
      return;
    }

    setRevealIndex(pinEntered.length - 1);
    const timeout = setTimeout(() => {
      LayoutAnimation.easeInEaseOut();
      setRevealIndex(-1);
    }, LAST_DIGIT_VISIBLE_INTERVAL);

    return () => {
      clearTimeout(timeout);
    };
  }, [pinEntered]);

  return (
    <View style={styles.displayContainer}>
      {Array.from({ length: maxLength }).map((_x, index) => {
        const char = index === revealIndex ? pinEntered[index] : undefined;
        const isEntered = index < pinEntered.length;
        const key = `${index}_${isEntered}_${char}`;

        return (
          <View key={key} style={styles.inputContainer}>
            {char ? (
              <Text allowFontScaling={false} style={styles.char}>
                {char}
              </Text>
            ) : (
              <View style={[styles.dot, isEntered && styles.dotFilled]} />
            )}
          </View>
        );
      })}
    </View>
  );
};
export const Pincode = React.memo(PincodeComponent);
