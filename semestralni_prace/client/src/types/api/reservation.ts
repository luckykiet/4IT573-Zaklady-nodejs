export interface Reservation {
  _id: string;
  userId?: string | null;
  storeId: string;
  tableId: string;
  email: String;
  name: String;
  start: string;
  end: string;
  isCancelled: Boolean;
}
