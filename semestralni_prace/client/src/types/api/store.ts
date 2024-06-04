import { Table } from './table';

// types.ts
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
  type: string;
  openingTime: OpeningTime[];
  tables: Table[];
}
