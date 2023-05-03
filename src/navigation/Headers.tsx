import * as React from 'react';
import { Dimensions, PixelRatio, StyleSheet, Text, View } from 'react-native';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import BackButton from './components/BackButton';
import CancelButton from './components/CancelButton';
import { navigateBack } from './NavigationService';
import DisconnectBanner from '../shared/DisconnectBanner';
import { Colors, Icon } from 'etta-ui';

export const noHeader: NativeStackNavigationOptions = {
  headerShown: false,
};

export const noHeaderGestureDisabled: NativeStackNavigationOptions = {
  headerShown: false,
  gestureEnabled: false,
};

export const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 16,
    lineHeight: 20,
    maxWidth: Dimensions.get('window').width * 0.6,
  },
  headerSubTitle: {
    color: Colors.neutrals.light.neutral7,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenHeader: {
    textAlign: 'center',
    fontWeight: undefined,
  },
});

export const initNavigationOptions: NativeStackNavigationOptions = {
  headerShown: true,
  headerTransparent: true,
  // Prevents double back button on Android
  headerBackTitleVisible: false,
  headerBackVisible: false,
  headerLeft: ({ canGoBack }) => (canGoBack ? <BackButton /> : <View />),
  headerRight: () => <View />,
  headerTitle: () => <DisconnectBanner />,
  headerStyle: {
    backgroundColor: 'transparent',
  },
};

export const initOnboardingNavigationOptions: NativeStackNavigationOptions = {
  ...initNavigationOptions,
  headerLeft: ({ canGoBack }) => (canGoBack ? <BackButton /> : <View />),
};

export const initNavigationOptionsNoBackButton: NativeStackNavigationOptions = {
  ...initNavigationOptions,
  headerLeft: () => <View />,
};

export const emptyHeader: NativeStackNavigationOptions = {
  headerTitle: ' ',
  headerShown: true,
  // Prevents double back button on Android
  headerBackTitleVisible: false,
  headerTitleStyle: [styles.headerTitle, styles.screenHeader],
  headerShadowVisible: false,
  headerTitleAlign: 'center',
  headerStyle: {
    backgroundColor: Colors.common.white,
  },
};

export const headerWithBackButton: NativeStackNavigationOptions = {
  ...emptyHeader,
  headerLeft: ({ canGoBack }) => (canGoBack ? <BackButton /> : null),
};

export const headerWithCancelButton: NativeStackNavigationOptions = {
  ...emptyHeader,
  headerLeft: () => <CancelButton />,
};

export const headerWithBackEditButtons: NativeStackNavigationOptions = {
  ...emptyHeader,
  headerLeft: () => (PixelRatio.getFontScale() > 1 ? <CancelButton /> : <CancelButton />),
  headerRight: () => <BackButton />,
};

export const headerWithCloseButton: NativeStackNavigationOptions = {
  ...emptyHeader,
  headerLeft: () => <Icon name="icon-cross" onPress={navigateBack} />,
};

export function HeaderTitleWithSubtitle({
  title,
  subTitle,
}: {
  title: string | JSX.Element;
  subTitle?: string | JSX.Element;
}) {
  return (
    <View style={styles.header}>
      {title && (
        <Text
          testID="HeaderTitle"
          style={styles.headerTitle}
          numberOfLines={1}
          allowFontScaling={false}
        >
          {title}
        </Text>
      )}
      {subTitle && (
        <Text style={styles.headerSubTitle} numberOfLines={1} allowFontScaling={false}>
          {subTitle}
        </Text>
      )}
    </View>
  );
}
