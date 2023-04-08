import { createStore } from 'easy-peasy';
import rootModel, { RootModelType } from './models';

const store = createStore<RootModelType>(rootModel);

export default store;
