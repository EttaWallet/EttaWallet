import { Action, action } from 'easy-peasy';

export interface AccessibilityModelType {
  hapticsEnabled: boolean;
  setHapticsStatus: Action<AccessibilityModelType, boolean>;
}

export const accessibilityModel: AccessibilityModelType = {
  hapticsEnabled: true, // enabled by default
  setHapticsStatus: action((state, payload) => {
    state.hapticsEnabled = payload;
  }),
};
