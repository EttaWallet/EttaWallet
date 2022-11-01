import { StackNavigationOptions } from '@react-navigation/stack';
import * as React from 'react';
import {
  Dimensions,
  PixelRatio,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import BackButton from './BackButton';
import CancelButton from '../../components/CancelButton';
import { Cross } from '@ettawallet/rn-bitcoin-icons/dist/filled';
import { navigateBack } from '../NavigationService';
import { TopBarIconButton } from './TopBarButton';
import DisconnectBanner from '../../components/DisconnectBanner';
import colors from '../../styles/colors';
import fontStyles from '../../styles/fonts';
import variables from '../../styles/variables';

export const noHeader: StackNavigationOptions = {
  headerShown: false,
};

export const noHeaderGestureDisabled: StackNavigationOptions = {
  headerShown: false,
  gestureEnabled: false,
};

export const styles = StyleSheet.create({
  headerTitle: {
    ...fontStyles.navigationHeader,
    maxWidth: Dimensions.get('window').width * 0.6,
  },
  headerSubTitle: {
    color: colors.gray4,
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

export const extraNavigationOptions: StackNavigationOptions = {
  headerShown: true,
  headerTransparent: true,
  headerLeft: ({ canGoBack }) => (canGoBack ? <BackButton /> : <View />),
  headerRight: () => <View />,
  headerTitle: () => <DisconnectBanner />,
  headerTitleContainerStyle: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  headerStyle: {
    backgroundColor: colors.light,
  },
};

export const extraNavigationOptionsNoBackButton: StackNavigationOptions = {
  ...extraNavigationOptions,
  headerLeft: () => <View />,
};

export const emptyHeader: StackNavigationOptions = {
  headerTitle: ' ',
  headerShown: true,
  headerTitleStyle: [styles.headerTitle, styles.screenHeader],
  headerTitleContainerStyle: {
    alignItems: 'center',
  },
  headerTitleAlign: 'center',
  cardStyle: { backgroundColor: colors.light },
  headerStyle: {
    backgroundColor: colors.light,
    shadowRadius: 0,
    shadowOffset: {
      height: 0,
      width: 0,
    },
    elevation: 0, // remove shadow on Android
    shadowOpacity: 0, // remove shadow on iOS
    borderBottomWidth: 0,
  },
};

export const drawerHeader: StackNavigationOptions = {
  ...emptyHeader,
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
    PixelRatio.getFontScale() > 1 ? (
      <CancelButton buttonType="icon" />
    ) : (
      <CancelButton buttonType="text" />
    ),
  headerRight: () => <BackButton />,
  headerRightContainerStyle: { paddingRight: variables.contentPadding + 6 },
};

export const headerWithCloseButton: StackNavigationOptions = {
  ...emptyHeader,
  headerLeft: () => (
    <TopBarIconButton
      icon={<Cross color="#000" width={20} height={20} />}
      onPress={navigateBack}
    />
  ),
  headerLeftContainerStyle: { paddingLeft: 20 },
};

interface Props {
  title: string | JSX.Element;
  switchTitleAndSubtitle?: boolean;
}

export const HeaderTitleWithSubtitle = ({
  title,
  subTitle,
}: {
  title: string | JSX.Element;
  subTitle?: string | JSX.Element;
}) => {
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
        <Text
          testID="HeaderSubTitle"
          style={styles.headerSubTitle}
          numberOfLines={1}
          allowFontScaling={false}
        >
          {subTitle}
        </Text>
      )}
    </View>
  );
};
