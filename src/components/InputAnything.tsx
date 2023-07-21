import React, { useLayoutEffect } from 'react';
import {
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import Card from './Card';
import TextInput, { LINE_HEIGHT } from './TextInput';
import { Colors, Icon, TypographyPresets } from 'etta-ui';
import PasteButtonWithClipboardCtx from './PasteButtonWithClipboardCtx';
import { useClipboard } from '../utils/hooks';

export enum InputStatus {
  Disabled = 'Disabled', // input disabled
  Inputting = 'Inputting', // input enabled
  Received = 'Received', // code received, still not validated
  Processing = 'Processing', // code validated, now trying to send it
  Error = 'Error', // the code processing failed and it's waiting to be input again.
  Accepted = 'Accepted', // the code has been accepted and completed
}

export interface Props {
  label?: string | null;
  status: InputStatus;
  inputValue: string;
  inputPlaceholder: string;
  inputPlaceholderWithClipboardContent?: string;
  onInputChange: (value: string) => void;
  shouldShowClipboard: (value: string) => boolean;
  multiline?: boolean;
  numberOfLines?: number;
  style?: StyleProp<ViewStyle>;
  autoFocus?: boolean;
}

const InputAnything = ({
  label,
  status,
  inputValue,
  inputPlaceholder,
  inputPlaceholderWithClipboardContent,
  onInputChange,
  shouldShowClipboard,
  multiline,
  numberOfLines,
  style,
  autoFocus,
}: Props) => {
  const [forceShowingPasteIcon, clipboardContent, getFreshClipboardContent] = useClipboard();

  // LayoutAnimation when switching to/from input
  useLayoutEffect(() => {
    LayoutAnimation.easeInEaseOut();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status === InputStatus.Inputting]);

  function shouldShowClipboardInternal() {
    if (forceShowingPasteIcon) {
      return true;
    }
    return (
      !inputValue.toLowerCase().startsWith(clipboardContent.toLowerCase()) &&
      shouldShowClipboard(clipboardContent)
    );
  }

  const showInput = status === InputStatus.Inputting || status === InputStatus.Error;
  const showSpinner = status === InputStatus.Processing || status === InputStatus.Received;
  const showCheckmark = status === InputStatus.Accepted;
  const showError = status === InputStatus.Error;
  const showStatus = showCheckmark || showSpinner || showError;

  return (
    <Card
      rounded={true}
      shadow={showInput ? true : false}
      style={[showInput ? styles.containerActive : styles.container, style]}
    >
      <View style={styles.containRadius}>
        <View style={[showInput ? styles.content : styles.contentLong]}>
          <View style={styles.innerContent}>
            {label && <Text style={showInput ? styles.label : styles.labelLong}>{label}</Text>}

            {showInput ? (
              <TextInput
                showClearButton={false}
                value={inputValue}
                placeholder={
                  inputPlaceholderWithClipboardContent && shouldShowClipboardInternal()
                    ? inputPlaceholderWithClipboardContent
                    : inputPlaceholder
                }
                onChangeText={onInputChange}
                multiline={multiline}
                autoCorrect={false}
                keyboardType="email-address"
                numberOfLines={Platform.OS === 'ios' ? undefined : numberOfLines}
                inputStyle={{
                  minHeight:
                    Platform.OS === 'ios' && numberOfLines
                      ? LINE_HEIGHT * numberOfLines
                      : undefined,
                }}
                autoCapitalize="none"
                autoFocus={autoFocus}
              />
            ) : (
              <Text style={styles.longInput} numberOfLines={1}>
                {inputValue || ' '}
              </Text>
            )}
          </View>
          {showStatus && (
            <View style={styles.statusContainer}>
              {showSpinner && <ActivityIndicator size="small" color={Colors.green.base} />}
              {showCheckmark && (
                <View style={[styles.iconContainer, { backgroundColor: Colors.green.base }]}>
                  <Icon name="icon-check" style={styles.successIcon} />
                </View>
              )}
              {showError && (
                <View style={[styles.iconContainer, { backgroundColor: Colors.red.base }]}>
                  <Icon name="icon-cross" style={styles.successIcon} />
                </View>
              )}
            </View>
          )}
        </View>
        {showInput && (
          <PasteButtonWithClipboardCtx
            getClipboardContent={getFreshClipboardContent}
            shouldShow={shouldShowClipboardInternal()}
            onPress={onInputChange}
          />
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 0,
    backgroundColor: 'rgba(103, 99, 86, 0.1)',
  },
  containerActive: {
    padding: 0,
  },
  containRadius: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  contentLong: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingVertical: 12,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  contentActive: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  innerContent: {
    flex: 1,
  },
  labelLong: {
    ...TypographyPresets.Body5,
    color: Colors.neutrals.light.neutral7,
    opacity: 0.5,
    marginBottom: 4,
  },
  longInput: {
    ...TypographyPresets.Body5,
    color: Colors.neutrals.light.neutral7,
  },
  label: {
    ...TypographyPresets.Body5,
    color: Colors.neutrals.light.neutral7,
    opacity: 0.5,
    marginBottom: 4,
  },
  statusContainer: {
    width: 32,
    marginLeft: 4,
  },
  successIcon: {
    alignSelf: 'center',
    justifyContent: 'center',
    fontSize: 20,
    color: Colors.common.white,
  },
  errorIcon: {
    alignSelf: 'center',
    justifyContent: 'center',
    fontSize: 20,
    color: Colors.common.white,
  },
  iconContainer: {
    alignSelf: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
    borderRadius: 50,
  },
});

export default InputAnything;
