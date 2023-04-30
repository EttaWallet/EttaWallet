import { AppModelType, appModel } from './app';
import { LightningNodeModelType, lightningModel } from './lightning';
import { NuxtModelType, nuxtModel } from './nuxt';
import { InternetModelType, internetModel } from './internet';
import { thunk, Thunk } from 'easy-peasy';
import Logger from '../../utils/logger';
import {
  getAppBuild,
  getAppVersion,
  getChosenLanguage,
  getDeviceBiometryType,
  getDisclaimerStatus,
  getPinType,
  setupApp,
} from '../../storage/disk';
import { WalletModelType, walletModel } from './wallet';
import { SettingsModelType, settingsModel } from './settings';
import { AccessibilityModelType, accessibilityModel } from './accessibility';

const TAG = 'state/root';

export interface RootModelType {
  initializeApp: Thunk<RootModelType>;
  internet: InternetModelType;
  nuxt: NuxtModelType;
  app: AppModelType;
  accessibility: AccessibilityModelType;
  lightning: LightningNodeModelType;
  settings: SettingsModelType;
  wallet: WalletModelType;
}

const rootModel: RootModelType = {
  initializeApp: thunk(async (actions) => {
    Logger.info(TAG, 'initializing app for the first time');
    // initialize stored data
    await setupApp();
    // rehydrate state with persisted data
    actions.app.setAppVersion(await getAppVersion());
    actions.app.setAppBuild(await getAppBuild());
    actions.app.setAppReady(true);
    actions.nuxt.setLanguage(await getChosenLanguage());
    actions.nuxt.setAcknowledgedDisclaimer(await getDisclaimerStatus());
    actions.nuxt.setPincodeType(await getPinType());
    actions.app.setSupportedBiometryType(await getDeviceBiometryType());
    Logger.info(TAG, 'Finished initialization process');
    return true;
  }),
  internet: internetModel,
  app: appModel,
  accessibility: accessibilityModel,
  nuxt: nuxtModel,
  lightning: lightningModel,
  settings: settingsModel,
  wallet: walletModel,
};

export default rootModel;
