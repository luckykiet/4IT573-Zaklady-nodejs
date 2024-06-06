import { Reservation } from './../api/reservation';

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type NewReservationForm = PartialBy<Reservation, '_id' | 'storeId' | 'isCancelled'>;
export type NewReservationFormMutation = {} & NewReservationForm;
