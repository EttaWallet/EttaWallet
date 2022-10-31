import * as React from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import ReactNativeModal from 'react-native-modal';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from './Card';
import colors from '../styles/colors';

interface Props {
  children: React.ReactNode;
  isVisible: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  onBackgroundPress?: () => void;
}

export default function Modal({
  children,
  isVisible,
  style,
  onBackgroundPress,
}: Props) {
  return (
    <ReactNativeModal
      isVisible={isVisible}
      backdropOpacity={0.1}
      onBackdropPress={onBackgroundPress}
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
    backgroundColor: colors.light,
    padding: 24,
    maxHeight: '100%',
  },
});
