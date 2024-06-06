import { Reservation } from '@/types/api/reservation';
import { Store } from '@/types/api/store';
import { Table } from '@/types/api/table';
import axios from '@/utils/axios';
const useReservationsApi = () => {
  const fetchAllStoresReservations = async (): Promise<{ reservations: Reservation[]; stores: Store[] }> => {
    const { data } = await axios.get<{ success: boolean; msg: string | undefined | { reservations: Reservation[]; stores: Store[] } }>(
      '/mod/reservations'
    );
    const { success, msg } = data;

    if (!success || typeof msg === 'string' || !msg) {
      throw new Error(typeof msg === 'string' ? msg : `err_fetch_failed`);
    }
    return msg;
  };
  const fetchOwnReservations = async (): Promise<{ reservations: Reservation[]; stores: Store[]; tables: Table[] }> => {
    const { data } = await axios.get<{
      success: boolean;
      msg: string | undefined | { reservations: Reservation[]; stores: Store[]; tables: Table[] };
    }>('/user/reservations');
    const { success, msg } = data;

    if (!success || typeof msg === 'string' || !msg) {
      throw new Error(typeof msg === 'string' ? msg : `err_fetch_failed`);
    }
    return msg;
  };

  return { fetchAllStoresReservations, fetchOwnReservations };
};

export default useReservationsApi;
