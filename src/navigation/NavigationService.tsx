import {
  CommonActions,
  createNavigationContainerRef,
  NavigationState,
  StackActions,
} from '@react-navigation/native';
import { createRef, MutableRefObject } from 'react';
import { Screens } from './Screens';
import type { StackParamList } from './types';
import Logger from '../utils/logger';
import store from '../state/store';
import { PinType } from '../utils/types';
import { getPincodeWithBiometry, requestPincodeInput } from '../utils/pin/auth';
import { isUserCancelledError } from '../utils/keychain';

const TAG = 'NavigationService';

const NAVIGATOR_INIT_RETRIES = 10;

type SafeNavigate = typeof navigate;

// create async sleep function
const sleep = (delay: any) => new Promise((resolve) => setTimeout(resolve, delay));

export const navigationRef = createNavigationContainerRef();
export const navigatorIsReadyRef: MutableRefObject<boolean | null> = createRef();
navigatorIsReadyRef.current = false;

async function ensureNavigator() {
  let retries = 0;
  while (
    (!navigationRef.current || !navigatorIsReadyRef.current) &&
    retries < NAVIGATOR_INIT_RETRIES
  ) {
    await sleep(200);
    retries++;
  }
  if (!navigationRef.current || !navigatorIsReadyRef.current) {
    throw new Error('navigator is not initialized');
  }
}

export async function ensurePincode(): Promise<boolean> {
  const pincodeType = store.getState().nuxt.pincodeType;

  if (pincodeType === PinType.Unset) {
    Logger.error(TAG + '@ensurePincode', 'Pin has never been set');
    return false;
  }

  if (pincodeType !== PinType.Custom && pincodeType !== PinType.Device) {
    Logger.error(TAG + '@ensurePincode', `Unsupported Pincode Type ${pincodeType}`);
    return false;
  }

  if (pincodeType === PinType.Device) {
    try {
      await getPincodeWithBiometry();
      return true;
    } catch (error) {
      if (!isUserCancelledError(error)) {
        Logger.warn(`${TAG}@ensurePincode`, `Retrieve PIN by biometry error`, error);
      }
      // do not return here, the pincode input is the user's fallback if
      // biometric auth fails
    }
  }

  try {
    await requestPincodeInput(true, false);
    return true;
  } catch (error) {
    if (error === 'CANCELLED_PIN_INPUT') {
      Logger.warn(`${TAG}@ensurePincode`, `PIN entering cancelled`, error);
    } else {
      Logger.error(`${TAG}@ensurePincode`, `PIN entering error`, error);
    }
    return false;
  }
}

export const popToScreen: SafeNavigate = (...args) => {
  const [routeName] = args;
  ensureNavigator()
    .then(() => {
      Logger.debug(`${TAG}@popToScreen`, `Dispatch ${routeName}`);
      while (
        navigationRef.current?.canGoBack() &&
        navigationRef.current?.getCurrentRoute()?.name !== routeName
      ) {
        navigationRef.current?.dispatch(StackActions.pop());
      }
    })
    .catch((reason) => {
      Logger.error(`${TAG}@popToScreen`, 'Navigation failure', reason);
    });
};

export const replace: SafeNavigate = (...args) => {
  const [routeName, params] = args;
  ensureNavigator()
    .then(() => {
      Logger.debug(`${TAG}@replace`, `Dispatch ${routeName}`);
      navigationRef.current?.dispatch(StackActions.replace(routeName, params));
    })
    .catch((reason) => {
      Logger.error(`${TAG}@replace`, 'Navigation failure', reason);
    });
};

// for when a screen should be pushed onto stack even if it already exists in it.
export const pushToStack: SafeNavigate = (...args) => {
  const [routeName, params] = args;
  ensureNavigator()
    .then(() => {
      Logger.debug(`${TAG}@pushToStack`, `Dispatch ${routeName}`);
      navigationRef.current?.dispatch(StackActions.push(routeName, params));
    })
    .catch((reason) => {
      Logger.error(`${TAG}@pushToStack`, 'Navigation failure', reason);
    });
};

export function navigate<RouteName extends keyof StackParamList>(
  ...args: undefined extends StackParamList[RouteName]
    ? [RouteName] | [RouteName, StackParamList[RouteName]]
    : [RouteName, StackParamList[RouteName]]
) {
  const [routeName, params] = args;
  ensureNavigator()
    .then(() => {
      Logger.debug(`${TAG}@navigate`, `Dispatch ${routeName}`);
      navigationRef.current?.dispatch(
        CommonActions.navigate({
          name: routeName,
          params,
        })
      );
    })
    .catch((reason) => {
      Logger.error(`${TAG}@navigate`, 'Navigation failure', reason);
    });
}

export const navigateClearingStack: SafeNavigate = (...args) => {
  const [routeName, params] = args;
  ensureNavigator()
    .then(() => {
      Logger.debug(`${TAG}@navigateClearingStack`, `Dispatch ${routeName}`);

      navigationRef.current?.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: routeName, params }],
        })
      );
    })
    .catch((reason) => {
      Logger.error(`${TAG}@navigateClearingStack`, 'Navigation failure', reason);
    });
};

export function navigateBack() {
  ensureNavigator()
    .then(() => {
      Logger.debug(`${TAG}@navigateBack`, 'Dispatch navigate back');
      navigationRef.current?.dispatch(CommonActions.goBack());
    })
    .catch((reason) => {
      Logger.error(`${TAG}@navigateBack`, 'Navigation failure', reason);
    });
}

const getActiveRouteState = function (route: NavigationState): NavigationState {
  if (!route.routes || route.routes.length === 0 || route.index >= route.routes.length) {
    // TODO: React Navigation types are hard :(
    // @ts-ignore
    return route.state;
  }

  const childActiveRoute = route.routes[route.index] as unknown as NavigationState;
  return getActiveRouteState(childActiveRoute);
};

export async function isScreenOnForeground(screen: Screens) {
  await ensureNavigator();
  const state = navigationRef.current?.getRootState();
  if (!state) {
    return false;
  }
  const activeRouteState = getActiveRouteState(state);
  // Note: The '?' in the following line shouldn't be necessary, but are there anyways to be defensive
  // because of the ts-ignore on getActiveRouteState.
  return activeRouteState?.routes[activeRouteState?.routes.length - 1]?.name === screen;
}

export async function isBottomSheetVisible(screen: Screens) {
  await ensureNavigator();
  const state = navigationRef.current?.getRootState();
  return !!state?.routes.find((route: any) => route.name === screen);
}

interface NavigateHomeOptions {
  params?: StackParamList[Screens.WalletHomeScreen];
}

export function navigateHome(options?: NavigateHomeOptions) {
  const { params } = options ?? {};
  navigationRef.current?.reset({
    index: 0,
    routes: [{ name: Screens.DrawerNavigator, params }],
  });
}

export function navigateToError(errorMessage: string, error?: Error) {
  Logger.debug(`${TAG}@navigateToError`, `Navigating to error screen: ${errorMessage}`, error);
  navigate(Screens.GenericErrorScreen, { errorMessage });
}
