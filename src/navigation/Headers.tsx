import * as React from 'react';
import { Dimensions, PixelRatio, StyleSheet, Text, View } from 'react-native';
import type { StackNavigationOptions } from '@react-navigation/stack';
import BackButton from './components/BackButton';
import CancelButton from './components/CancelButton';
import { navigateBack } from './NavigationService';
import DisconnectBanner from '../shared/DisconnectBanner';
import { TypographyPresets, Colors, Icon } from 'etta-ui';

export const noHeader: StackNavigationOptions = {
  headerShown: false,
};

export const noHeaderGestureDisabled: StackNavigationOptions = {
  headerShown: false,
  gestureEnabled: false,
};

export const styles = StyleSheet.create({
  headerTitle: {
    ...TypographyPresets.Header5,
    maxWidth: Dimensions.get('window').width * 0.6,
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

export const initNavigationOptions: StackNavigationOptions = {
  headerShown: true,
  headerTransparent: true,
  // Prevents double back button on Android
  headerBackTitleVisible: false,
  headerLeft: ({ canGoBack }) => (canGoBack ? <BackButton /> : <View />),
  headerRight: () => <View />,
  headerTitle: () => <DisconnectBanner />,
  headerStyle: {
    backgroundColor: 'transparent',
  },
};

export const initNavigationOptionsNoBackButton: StackNavigationOptions = {
  ...initNavigationOptions,
  headerLeft: () => <View />,
};

export const emptyHeader: StackNavigationOptions = {
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

export const headerWithBackButton: StackNavigationOptions = {
  ...emptyHeader,
  headerLeft: ({ canGoBack }) => (canGoBack ? <BackButton /> : null),
};

export const headerWithCancelButton: StackNavigationOptions = {
  ...emptyHeader,
  headerLeft: () => <CancelButton />,
};

export const headerWithBackEditButtons: StackNavigationOptions = {
  ...emptyHeader,
  headerLeft: () =>
    PixelRatio.getFontScale() > 1 ? <CancelButton /> : <CancelButton />,
  headerRight: () => <BackButton />,
};

export const headerWithCloseButton: StackNavigationOptions = {
  ...emptyHeader,
  headerLeft: () => <Icon name="icon-cross" onPress={navigateBack} />,
};

export function HeaderTitleWithSubtitle({
  title,
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
    </View>
  );
}
