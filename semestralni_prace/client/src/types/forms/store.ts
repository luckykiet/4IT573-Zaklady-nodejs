import { Store } from '../api/store';
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type NewStoreForm = PartialBy<Store, 'tables' | 'openingTime' | '_id'>;

export type NewStoreFormMutation = {} & NewStoreForm;

export type StoreForm = { storeId: string } & Store;
export type StoreFormMutation = {} & StoreForm;
