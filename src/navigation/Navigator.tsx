import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { Screens } from './Screens';
import type { StackParamList } from './types';
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  useBottomSheetDynamicSnapPoints,
} from '@gorhom/bottom-sheet';
import {
  createBottomSheetNavigator,
  BottomSheetNavigationOptions,
} from '@th3rdwave/react-navigation-bottom-sheet';
import ErrorScreen from '../shared/ErrorScreen';
import { noHeader, emptyHeader } from './Headers';
import OnboardingSlidesScreen from '../screens/OnboardingSlidesScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import { useEttaStorageContext } from '../storage/context';
import AppLoading from '../shared/AppLoading';
import SplashScreen from 'react-native-splash-screen';
import Logger from '../utils/logger';
import LanguageChooser from '../screens/LanguageChooserScreen';
import type { ExtractProps } from '../utils/helpers';
import DrawerNavigator from './DrawerNavigator';

const TAG = 'Navigator';

const Stack = createNativeStackNavigator<StackParamList>();
const RootStack = createBottomSheetNavigator<StackParamList>();

type combinedNavProps = BottomSheetNavigationOptions & NativeStackNavigationOptions;

type InitialRouteName = ExtractProps<typeof Stack.Navigator>['initialRouteName'];

export const MainStackScreen = () => {
  const [initialRouteName, setInitialRoute] = useState<InitialRouteName>(undefined);
  // get storage booleans from context
  const { areOnboardingSlidesCompleted, isUserLanguageSet } = useEttaStorageContext();

  useEffect(() => {
    let initialRoute: InitialRouteName;

    const checkStorageDefaults = async () => {
      // grab from storage context
      const defaultLanguageChosen = await isUserLanguageSet();
      const onboardingSlidesCompleted = await areOnboardingSlidesCompleted();
      if (defaultLanguageChosen === false) {
        initialRoute = Screens.LangugageChooserScreen;
      } else if (onboardingSlidesCompleted === false) {
        initialRoute = Screens.OnboardingSlidesScreen;
        // missing else if here for LDK wallet
      } else {
        initialRoute = Screens.DrawerNavigator;
      }

      setInitialRoute(initialRoute);
      Logger.info(`${TAG}@MainStackScreen`, `Initial route: ${initialRoute}`);

      // Wait for next frame to avoid slight gap when hiding the splash
      requestAnimationFrame(() => SplashScreen.hide());
    };

    checkStorageDefaults()
      // catch any errors
      .catch(console.error);
  }, [areOnboardingSlidesCompleted, isUserLanguageSet]);

  if (!initialRouteName) {
    return <AppLoading />;
  }

  return (
    <Stack.Navigator initialRouteName={initialRouteName} screenOptions={emptyHeader}>
      {/* Onboarding screens */}
      <Stack.Group>
        <Stack.Screen
          name={Screens.LangugageChooserScreen}
          component={LanguageChooser}
          options={LanguageChooser.navigationOptions() as NativeStackNavigationOptions}
        />
        <Stack.Screen
          name={Screens.OnboardingSlidesScreen}
          component={OnboardingSlidesScreen}
          options={noHeader}
        />
        <Stack.Screen
          name={Screens.WelcomeScreen}
          component={WelcomeScreen}
          options={WelcomeScreen.navigationOptions}
        />
      </Stack.Group>
      {/* Home drawer navigation */}
      <Stack.Screen name={Screens.DrawerNavigator} component={DrawerNavigator} options={noHeader} />
      {/* Common screens */}
      <Stack.Group>
        <Stack.Screen name={Screens.ErrorScreen} component={ErrorScreen} options={noHeader} />
      </Stack.Group>
    </Stack.Navigator>
  );
};

export const modalScreenOptions = () =>
  Platform.select({
    // iOS 13 modal presentation
    ios: {
      presentation: 'modal',
    },
  });

const mainScreenNavOptions = () => ({
  ...modalScreenOptions(),
  headerShown: false,
});

const RootStackScreen = () => {
  const initialBottomSheetSnapPoints = React.useMemo(() => ['CONTENT_HEIGHT'], []);
  const { animatedHandleHeight, animatedSnapPoints, animatedContentHeight } =
    useBottomSheetDynamicSnapPoints(initialBottomSheetSnapPoints);

  const renderBackdrop = React.useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop opacity={0.25} appearsOnIndex={0} disappearsOnIndex={-1} {...props} />
    ),
    []
  );

  return (
    <RootStack.Navigator
      screenOptions={{
        backdropComponent: renderBackdrop,
        handleHeight: animatedHandleHeight,
        //@ts-ignore: React 18 types error pending PR: https://github.com/gorhom/react-native-bottom-sheet/pull/1123
        snapPoints: animatedSnapPoints,
        contentHeight: animatedContentHeight,
      }}
    >
      <RootStack.Screen
        name={Screens.Main}
        component={MainStackScreen}
        options={mainScreenNavOptions as combinedNavProps}
      />
    </RootStack.Navigator>
  );
};

export default RootStackScreen;
