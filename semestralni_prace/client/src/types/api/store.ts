import { STORES_TYPES } from '@/config';
import { Table } from './table';
type StoreType = (typeof STORES_TYPES)[number];

export interface Address {
  street: string;
  city: string;
  zip: string;
  country: string;
}

export interface OpeningTime {
  start: string;
  end: string;
  isOpen: boolean;
}

export interface Store {
  _id: string;
  name: string;
  address: Address;
  type: StoreType;
  openingTime: OpeningTime[];
  tables: Table[];
  isAvailable: boolean;
}
