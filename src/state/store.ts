import { createStore, persist } from 'easy-peasy';
import rootModel, { RootModelType } from './models';

const store = createStore<RootModelType>(persist(rootModel));

export default store;
