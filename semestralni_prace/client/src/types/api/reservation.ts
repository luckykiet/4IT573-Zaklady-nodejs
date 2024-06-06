import { Store } from './store';
import { Table } from './table';

export interface Reservation {
  _id: string;
  userId?: string | null;
  storeId: string;
  store?: Store;
  tableId: string;
  table?: Table;
  email: String;
  name: String;
  start: string;
  end: string;
  isCancelled: Boolean;
}
