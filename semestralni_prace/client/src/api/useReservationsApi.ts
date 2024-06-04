import { Store } from '@/types/api/store';
import axios from '@/utils/axios';
const useReservationsApi = () => {
  const fetchAllStoresReservations = async (): Promise<Store[]> => {
    const { data } = await axios.get<{ success: boolean; msg: string | undefined | Store[] }>('/mod/reservations');
    const { success, msg } = data;

    if (!success || typeof msg === 'string' || !msg) {
      throw new Error(typeof msg === 'string' ? msg : `err_fetch_failed`);
    }
    return msg;
  };
  const fetchOwnReservations = async (): Promise<Store[]> => {
    const { data } = await axios.get<{ success: boolean; msg: string | undefined | Store[] }>('/user/reservations');
    const { success, msg } = data;

    if (!success || typeof msg === 'string' || !msg) {
      throw new Error(typeof msg === 'string' ? msg : `err_fetch_failed`);
    }
    return msg;
  };

  return { fetchAllStoresReservations, fetchOwnReservations };
};

export default useReservationsApi;
