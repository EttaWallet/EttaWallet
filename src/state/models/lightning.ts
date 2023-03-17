import { Action, action } from 'easy-peasy';

export interface LightningModelType {
  initialized: boolean;
  nodeId: string | null;
  setNodeId: Action<LightningModelType, string | null>;
}

export const lightningModel: LightningModelType = {
  initialized: false,
  nodeId: null,
  setNodeId: action((state, nodeId) => {
    state.nodeId = nodeId;
  }),
};
