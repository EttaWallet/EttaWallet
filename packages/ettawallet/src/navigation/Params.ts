import { Screens } from './Screens';

// Typed nested navigator params
type NestedNavigatorParams<ParamList> = {
  [K in keyof ParamList]: undefined extends ParamList[K]
    ? { screen: K; params?: ParamList[K] }
    : { screen: K; params: ParamList[K] };
}[keyof ParamList];

export type StackParamList = {
  [Screens.SetPin]:
    | {
        changePin?: boolean;
        choseToRestoreAccount?: boolean;
        registrationStep?: { step: number; totalSteps: number };
        showGuidedOnboarding?: boolean;
      }
    | undefined;
};
