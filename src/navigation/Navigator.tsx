import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import {
  createStackNavigator,
  StackNavigationOptions,
  TransitionPresets,
} from '@react-navigation/stack';
import { Screens } from './Screens';
import type { StackParamList } from './types';
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  useBottomSheetDynamicSnapPoints,
} from '@gorhom/bottom-sheet';
import { createBottomSheetNavigator } from '@th3rdwave/react-navigation-bottom-sheet';
import ErrorScreen from '../shared/ErrorScreen';
import { noHeader, emptyHeader } from './Headers';
import OnboardingSlidesScreen from '../screens/OnboardingSlidesScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import { useEttaStorageContext } from '../storage/context';
import AppLoading from '../shared/AppLoading';
import SplashScreen from 'react-native-splash-screen';
import Logger from '../utils/logger';
import LanguageChooser from '../screens/LanguageChooserScreen';
import WalletHomeScreen from '../screens/WalletHomeScreen';

const TAG = 'Navigator';

/**
 * Utility type to extract external Props of a component (respecting defaultProps)
 * See https://github.com/Microsoft/TypeScript/issues/26704
 * Usage: ExtractProps<typeof SomeComponent>
 */
type ExtractProps<T extends keyof JSX.IntrinsicElements | React.JSXElementConstructor<any>> =
  JSX.LibraryManagedAttributes<T, React.ComponentProps<T>>;

const Stack = createStackNavigator<StackParamList>();
const ModalStack = createStackNavigator<StackParamList>();
const RootStack = createBottomSheetNavigator<StackParamList>();

export const modalScreenOptions = () =>
  Platform.select({
    // iOS 13 modal presentation
    ios: {
      gestureEnabled: true,
      cardOverlayEnabled: true,
      headerStatusBarHeight: 0,
      ...TransitionPresets.ModalPresentationIOS,
    },
  });

const commonScreens = (Navigator: typeof Stack) => {
  return (
    <>
      <Navigator.Screen name={Screens.ErrorScreen} component={ErrorScreen} options={noHeader} />
    </>
  );
};

const onboardingScreens = (Navigator: typeof Stack) => (
  <>
    <Navigator.Screen
      name={Screens.OnboardingSlidesScreen}
      component={OnboardingSlidesScreen}
      options={noHeader}
    />
    <Navigator.Screen
      name={Screens.WelcomeScreen}
      component={WelcomeScreen}
      options={WelcomeScreen.navigationOptions}
    />
  </>
);

type InitialRouteName = ExtractProps<typeof Stack.Navigator>['initialRouteName'];

export const MainStackScreen = () => {
  const [initialRouteName, setInitialRoute] = useState<InitialRouteName>(undefined);

  // get storage booleans from context
  const { areOnboardingSlidesCompleted, isUserLanguageSet } = useEttaStorageContext();

  useEffect(() => {
    let initialRoute: InitialRouteName = Screens.LangugageChooserScreen;

    if (!isUserLanguageSet) {
      initialRoute = Screens.LangugageChooserScreen;
    } else if (!areOnboardingSlidesCompleted) {
      initialRoute = Screens.OnboardingSlidesScreen;
      // see if LDK node exists. Change the boolean check once setup.
    } else if (!isUserLanguageSet) {
      initialRoute = Screens.WelcomeScreen;
    } else {
      initialRoute = Screens.WalletHomeScreen;
    }

    setInitialRoute(initialRoute);
    Logger.info(`${TAG}@MainStackScreen`, `Initial route: ${initialRoute}`);

    // Wait for next frame to avoid slight gap when hiding the splash
    requestAnimationFrame(() => SplashScreen.hide());
  }, [areOnboardingSlidesCompleted, isUserLanguageSet]);

  if (!initialRouteName) {
    return <AppLoading />;
  }

  return (
    <Stack.Navigator initialRouteName={initialRouteName} screenOptions={emptyHeader}>
      <Stack.Screen
        name={Screens.WalletHomeScreen}
        component={WalletHomeScreen}
        options={noHeader}
      />
      {commonScreens(Stack)}
      {onboardingScreens(Stack)}
    </Stack.Navigator>
  );
};

const modalAnimatedScreens = (Navigator: typeof Stack) => (
  <>
    {/* QR code screen and FAQ screen will go here too */}
    <Navigator.Screen
      name={Screens.LanguageModal}
      component={LanguageChooser}
      options={LanguageChooser.navigationOptions() as StackNavigationOptions}
    />
  </>
);

const mainScreenNavOptions = () => ({
  ...modalScreenOptions(),
  headerShown: false,
});

const ModalStackScreen = () => {
  return (
    <ModalStack.Navigator>
      <ModalStack.Screen
        name={Screens.Main}
        component={MainStackScreen}
        options={mainScreenNavOptions as StackNavigationOptions}
      />
      {modalAnimatedScreens(ModalStack)}
    </ModalStack.Navigator>
  );
};

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
      <RootStack.Screen name={Screens.MainModal} component={ModalStackScreen} />
    </RootStack.Navigator>
  );
};

export default RootStackScreen;
