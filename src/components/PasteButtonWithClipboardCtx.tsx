import { Button } from 'etta-ui';
import React, { useLayoutEffect } from 'react';
import { LayoutAnimation, Platform, StyleSheet } from 'react-native';

interface Props {
  getClipboardContent: () => Promise<string>;
  shouldShow: boolean;
  onPress: (clipboardContent: string) => void;
}

const PasteButtonWithClipboardCtx = ({ getClipboardContent, shouldShow, onPress }: Props) => {
  useLayoutEffect(() => {
    if (Platform.OS !== 'android') {
      LayoutAnimation.easeInEaseOut();
    }
  }, [shouldShow]);

  async function onPressButton() {
    onPress(await getClipboardContent());
  }

  if (!shouldShow) {
    return null;
  }

  return (
    <Button
      title="Paste"
      appearance="transparent"
      size="large"
      onPress={onPressButton}
      style={styles.button}
    />
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
  },
});

export default PasteButtonWithClipboardCtx;
