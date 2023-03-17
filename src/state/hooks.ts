import { createTypedHooks } from 'easy-peasy';
import type { RootModelType } from './models';

const typedHooks = createTypedHooks<RootModelType>();

export const useStoreActions = typedHooks.useStoreActions;
export const useStoreDispatch = typedHooks.useStoreDispatch;
export const useStoreState = typedHooks.useStoreState;
