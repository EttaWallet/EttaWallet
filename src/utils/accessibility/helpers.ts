import store from '../../state/store';

/**
 * Returns the current state of the accessibility store
 * @return AcessibilityModelType
 */
export const getAccessibilityStore = () => {
  return store.getState().accessibility;
};
