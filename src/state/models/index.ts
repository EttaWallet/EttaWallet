import { AppModelType, appModel } from './app';
import { LightningNodeModelType, lightningModel } from './lightning';
import { NuxtModelType, nuxtModel } from './nuxt';
import { InternetModelType, internetModel } from './internet';
import { thunk, Thunk } from 'easy-peasy';
import Logger from '../../utils/logger';
import { WalletModelType, walletModel } from './wallet';
import { SettingsModelType, settingsModel } from './settings';
import { AccessibilityModelType, accessibilityModel } from './accessibility';
import * as Keychain from 'react-native-keychain';
import { collectAppVersion, collectBuildNumber } from '../../utils/helpers';

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
    // initialize with necessary data
    actions.app.setAppVersion(collectAppVersion);
    actions.app.setAppBuild(collectBuildNumber);
    const biometry = await Keychain.getSupportedBiometryType();
    actions.app.setSupportedBiometryType(biometry);
    actions.app.setAppReady(true);
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
