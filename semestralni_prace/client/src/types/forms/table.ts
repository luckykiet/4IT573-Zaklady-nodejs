import { Table } from './../api/table';

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type NewTableForm = PartialBy<Table, 'isAvailable' | '_id'>;

export type NewTableFormMutation = {} & NewTableForm;

export type TableForm = { tableId: string } & Table;
export type TableFormMutation = {} & TableForm;
