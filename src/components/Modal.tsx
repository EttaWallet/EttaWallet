import * as React from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import ReactNativeModal from 'react-native-modal';
import { SafeAreaView, useSafeAreaFrame } from 'react-native-safe-area-context';
import Card from './Card';
import { Colors } from 'etta-ui';

interface Props {
  children: React.ReactNode;
  isVisible: boolean;
  style?: StyleProp<ViewStyle>;
  onBackgroundPress?: () => void;
}

export default function Modal({ children, isVisible, style, onBackgroundPress }: Props) {
  const { height } = useSafeAreaFrame();

  return (
    <ReactNativeModal
      isVisible={isVisible}
      backdropOpacity={0.1}
      onBackdropPress={onBackgroundPress}
      deviceHeight={height}
      statusBarTranslucent={true}
    >
      <SafeAreaView>
        <Card style={[styles.root, style]} rounded={true}>
          {children}
        </Card>
      </SafeAreaView>
    </ReactNativeModal>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: Colors.common.white,
    padding: 24,
    maxHeight: '100%',
  },
});
