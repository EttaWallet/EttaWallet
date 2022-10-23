/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { createRef, MutableRefObject, useContext } from 'react';
import { EttaStorageContext } from '../../storage/context';
import { NavigationActions } from '@react-navigation/compat';
import { CommonActions, StackActions } from '@react-navigation/core';
import {
  NavigationContainerRef,
  NavigationState,
} from '@react-navigation/native';
import sleep from 'sleep-promise';
import { PincodeType } from '../utils/types';
import { Screens } from './Screens';
import { StackParamList } from './Params';
import {
  CANCELLED_PIN_INPUT,
  getPincodeWithBiometry,
  requestPincodeInput,
} from '../utils/auth';
import Logger from '../utils/logger';
import { isUserCancelledError } from '../../storage/keychain';

const TAG = 'NavigationService';

const NAVIGATOR_INIT_RETRIES = 10;

type SafeNavigate = typeof navigate;

export const navigationRef = createRef<NavigationContainerRef>();
export const navigatorIsReadyRef: MutableRefObject<boolean | null> =
  createRef();
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

export const replace: SafeNavigate = (...args) => {
  const [routeName, params] = args;
  ensureNavigator()
    .then(() => {
      Logger.debug(`${TAG}@replace`, `Dispatch ${routeName}`);
      navigationRef.current?.dispatch(StackActions.replace(routeName, params));
    })
    .catch(reason => {
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
    .catch(reason => {
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
        NavigationActions.navigate({
          routeName,
          params,
        })
      );
    })
    .catch(reason => {
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
    .catch(reason => {
      Logger.error(
        `${TAG}@navigateClearingStack`,
        'Navigation failure',
        reason
      );
    });
};

export async function ensurePincode(): Promise<boolean> {
  const { pinType } = useContext(EttaStorageContext);

  if (pinType === PincodeType.Unset) {
    Logger.error(TAG + '@ensurePincode', 'Pin has never been set');
    return false;
  }

  if (pinType !== PincodeType.CustomPin && pinType !== PincodeType.PhoneAuth) {
    Logger.error(TAG + '@ensurePincode', `Unsupported Pincode Type ${pinType}`);
    return false;
  }

  if (pinType === PincodeType.PhoneAuth) {
    try {
      await getPincodeWithBiometry();
      return true;
    } catch (error) {
      if (!isUserCancelledError(error)) {
        Logger.warn(
          `${TAG}@ensurePincode`,
          `Retrieve PIN by biometry error`,
          error
        );
      }
      // do not return here, the pincode input is the user's fallback if
      // biometric auth fails
    }
  }

  try {
    await requestPincodeInput(true, false);
    return true;
  } catch (error) {
    if (error === CANCELLED_PIN_INPUT) {
      Logger.warn(`${TAG}@ensurePincode`, `PIN entering cancelled`, error);
    } else {
      Logger.error(`${TAG}@ensurePincode`, `PIN entering error`, error);
    }
    return false;
  }
}

export function navigateBack(params?: object) {
  ensureNavigator()
    .then(() => {
      Logger.debug(`${TAG}@navigateBack`, `Dispatch navigate back`);
      // @ts-ignore
      navigationRef.current?.dispatch(NavigationActions.back(params));
    })
    .catch(reason => {
      Logger.error(`${TAG}@navigateBack`, 'Navigation failure', reason);
    });
}

const getActiveRouteState = function (route: NavigationState): NavigationState {
  if (
    !route.routes ||
    route.routes.length === 0 ||
    route.index >= route.routes.length
  ) {
    // @ts-ignore
    return route.state;
  }

  const childActiveRoute = route.routes[
    route.index
  ] as unknown as NavigationState;
  return getActiveRouteState(childActiveRoute);
};

export async function isScreenOnForeground(screen: Screens) {
  await ensureNavigator();
  const state = navigationRef.current?.getRootState();
  if (!state) {
    return false;
  }
  const activeRouteState = getActiveRouteState(state);
  return (
    activeRouteState?.routes[activeRouteState?.routes.length - 1]?.name ===
    screen
  );
}

export async function isBottomSheetVisible(screen: Screens) {
  await ensureNavigator();
  const state = navigationRef.current?.getRootState();
  return !!state?.routes.find(route => route.name === screen);
}

interface NavigateHomeOptions {
  params?: StackParamList[Screens.DrawerNavigator];
}

export function navigateHome(options?: NavigateHomeOptions) {
  const { params } = options ?? {};
  navigationRef.current?.reset({
    index: 0,
    routes: [{ name: Screens.DrawerNavigator, params }],
  });
}

export function navigateToError(errorMessage: string, error?: Error) {
  Logger.debug(
    `${TAG}@navigateToError`,
    `Navigating to error screen: ${errorMessage}`,
    error
  );
  navigate(Screens.ErrorScreen, { errorMessage });
}
