import * as React from 'react';
import { useFlipper } from '@react-navigation/devtools';
import { NavigationContainer, NavigationState } from '@react-navigation/native';
import { StyleSheet, View } from 'react-native';
import { navigationRef, navigatorIsReadyRef } from './NavigationService';
import Navigator from './Navigator';
import navTheme from './theme';
import Logger from '../utils/logger';
import * as Sentry from '@sentry/react-native';
import type { SeverityLevel } from '@sentry/types';
import { sentryRoutingInstrumentation } from '../utils/sentry';
import DeviceInfo from 'react-native-device-info';
import { useStoreState, useStoreActions } from '../state/hooks';
import { isVersionBelowMinimum } from '../utils/helpers';
import UpgradeScreen from '../shared/UpgradeScreen';
import PinLockScreen from '../shared/PinLockScreen';
import { DEV_RESTORE_NAV_STATE_ON_RELOAD } from '../../config';
import mmkvStorage, { StorageItem } from '../storage/disk';

// @ts-ignore
export const getActiveRouteName = (state: NavigationState) => {
  const route = state.routes[state.index];

  if (route.state) {
    // @ts-ignore Dive into nested navigators
    return getActiveRouteName(route.state);
  }

  return route.name;
};

const RESTORE_STATE = __DEV__ && DEV_RESTORE_NAV_STATE_ON_RELOAD;

export const NavigatorWrapper = () => {
  const [initialState, setInitialState] = React.useState();
  const appReady = useStoreState((state) => state.app.appReady);
  const initializeApp = useStoreActions((action) => action.initializeApp);
  const isAppLocked = useStoreState((state) => state.app.locked);
  const minAppVersion = useStoreState((state) => state.app.minAppVersion);
  const routeNameRef = React.useRef();

  useFlipper(navigationRef);

  const setActiveRouteDispatch = useStoreActions((action) => action.app.setActiveScreen);

  const updateRequired = React.useMemo(() => {
    if (!minAppVersion) {
      return false;
    }
    const version = DeviceInfo.getVersion();
    Logger.info(
      'NavigatorWrapper',
      `Current version: ${version}. Required min version: ${minAppVersion}`
    );
    return isVersionBelowMinimum(version, minAppVersion);
  }, [minAppVersion]);

  React.useEffect(() => {
    if (navigationRef && navigationRef.current) {
      const state = navigationRef.current.getRootState();

      if (state) {
        // Save the initial route name
        routeNameRef.current = getActiveRouteName(state);
      }
    }
  }, []);

  React.useEffect(() => {
    const restoreState = async () => {
      const savedStateString = await mmkvStorage.getItem(StorageItem.navState);
      if (savedStateString) {
        try {
          //@ts-ignore
          const navState = JSON.parse(savedStateString);
          setInitialState(navState);
        } catch (e) {
          //@ts-ignore
          Logger.error('NavigatorWrapper', 'Error getting nav state', e);
        }
      }
      if (!appReady) {
        try {
          await initializeApp();
        } catch (e) {
          console.log('Something terrible happened. App not ready', e);
        }
      }
    };

    if (!appReady) {
      restoreState().catch((error) => Logger.error('NavigatorWrapper', 'App not ready', error));
    }
  }, [appReady, initializeApp]);

  React.useEffect(() => {
    return () => {
      navigatorIsReadyRef.current = false;
    };
  }, []);

  if (!appReady) {
    return null;
  }

  const handleStateChange = (state: NavigationState | undefined) => {
    if (state === undefined) {
      return;
    }

    if (RESTORE_STATE) {
      mmkvStorage.setItem(StorageItem.navState, JSON.stringify(state));
    }

    const previousRouteName = routeNameRef.current;
    const currentRouteName = getActiveRouteName(state);

    if (previousRouteName !== currentRouteName) {
      setActiveRouteDispatch(currentRouteName);
      Sentry.addBreadcrumb({
        category: 'navigation',
        message: `Navigated to ${currentRouteName}`,
        level: 'info' as SeverityLevel,
      });
    }

    // Save the current route name for later comparision
    routeNameRef.current = currentRouteName;
  };

  const onReady = () => {
    navigatorIsReadyRef.current = true;
    sentryRoutingInstrumentation.registerNavigationContainer(navigationRef);
  };

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={onReady}
      onStateChange={handleStateChange}
      theme={navTheme}
      initialState={initialState}
    >
      <View style={styles.container}>
        <Navigator />
        {(isAppLocked || updateRequired) && (
          <View style={styles.locked}>
            {updateRequired ? <UpgradeScreen /> : <PinLockScreen />}
          </View>
        )}
      </View>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
  },
  locked: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  },
});

export default NavigatorWrapper;
