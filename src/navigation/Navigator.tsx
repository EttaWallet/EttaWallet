import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { Screens } from './Screens';
import type { StackParamList } from './types';
import ErrorScreen from '../shared/ErrorScreen';
import { noHeader, emptyHeader } from './Headers';
import OnboardingSlidesScreen from '../screens/OnboardingSlidesScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import { useEttaStorageContext } from '../storage/context';
import AppLoading from '../shared/AppLoading';
import SplashScreen from 'react-native-splash-screen';
import Logger from '../utils/logger';
// import WalletHomeScreen from '../screens/WalletHomeScreen';

const TAG = 'Navigator';

/**
 * Utility type to extract external Props of a component (respecting defaultProps)
 * See https://github.com/Microsoft/TypeScript/issues/26704
 * Usage: ExtractProps<typeof SomeComponent>
 */
type ExtractProps<T extends keyof JSX.IntrinsicElements | React.JSXElementConstructor<any>> =
  JSX.LibraryManagedAttributes<T, React.ComponentProps<T>>;

const Stack = createStackNavigator<StackParamList>();

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

export function MainStack() {
  const [initialRouteName, setInitialRoute] = useState<InitialRouteName>(undefined);

  // get storage booleans from context
  const { areOnboardingSlidesCompleted, isUserLanguageSet } = useEttaStorageContext();

  useEffect(() => {
    let initialRoute: InitialRouteName;

    if (!isUserLanguageSet) {
      initialRoute = Screens.LangugageChooserScreen;
    } else if (!areOnboardingSlidesCompleted) {
      initialRoute = Screens.OnboardingSlidesScreen;
      // see if LDK exists
    } else if (!isUserLanguageSet) {
      // added a definitive true here but this should check that LDK wallet is ready
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
      {/* <Stack.Screen
        name={Screens.WalletHomeScreen}
        component={WalletHomeScreen}
        options={noHeader}
      /> */}
      {commonScreens(Stack)}
      {onboardingScreens(Stack)}
    </Stack.Navigator>
  );
}
