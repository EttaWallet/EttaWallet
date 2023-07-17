import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ActionSheetIOS, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Modal from './Modal';
import { Colors, TypographyPresets } from 'etta-ui';

interface Props {
  isVisible: boolean;
  options: string[];
  includeCancelButton: boolean;
  isLastOptionDestructive: boolean;
  buttonsColor?: string;
  onOptionChosen: (optionIndex: number) => void;
  onCancel?: () => void;
}

const OptionsActionSheet = ({
  isVisible,
  options,
  includeCancelButton,
  isLastOptionDestructive,
  buttonsColor = Colors.green.base,
  onOptionChosen,
  onCancel,
}: Props) => {
  const { t } = useTranslation();
  const fullOptions = includeCancelButton ? [...options, t('cancel')] : options;
  const cancelButtonIndex = includeCancelButton ? fullOptions.length - 1 : undefined;
  const destructiveButtonIndex = isLastOptionDestructive
    ? (cancelButtonIndex || options.length) - 1
    : undefined;

  useEffect(() => {
    if (Platform.OS === 'ios' && isVisible) {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: fullOptions,
          cancelButtonIndex,
          destructiveButtonIndex,
          tintColor: buttonsColor,
        },
        (buttonIndex) => {
          if (buttonIndex === cancelButtonIndex) {
            onCancel?.();
          } else {
            onOptionChosen(buttonIndex);
          }
        }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  if (Platform.OS === 'ios') {
    return null;
  }

  const onItemPressed = (buttonIndex: number) => async () => {
    if (buttonIndex === cancelButtonIndex) {
      await onCancel?.();
    } else {
      await onOptionChosen(buttonIndex);
    }
  };

  return (
    <Modal isVisible={isVisible} style={styles.container}>
      {fullOptions.map((option, index) => {
        const extraStyles = {
          ...(index === cancelButtonIndex ? TypographyPresets.Body3 : TypographyPresets.Body4),
          color: index === destructiveButtonIndex ? Colors.orange.base : buttonsColor,
        };
        return (
          <View key={`separator-${option}`}>
            {index > 0 && (
              <View
                style={[
                  styles.separator,
                  index === cancelButtonIndex ? styles.cancelSeparator : {},
                ]}
              />
            )}
            <TouchableOpacity key={option} onPress={onItemPressed(index)}>
              <Text style={[styles.option, extraStyles]}>{option}</Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
  },
  option: {
    marginVertical: 16,
  },
  separator: {
    width: '100%',
    height: 1,
    backgroundColor: Colors.neutrals.light.neutral2,
  },
  cancelSeparator: {
    backgroundColor: Colors.neutrals.light.neutral3,
  },
});

export default OptionsActionSheet;
