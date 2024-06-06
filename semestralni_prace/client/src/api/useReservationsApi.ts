import { Reservation } from '@/types/api/reservation';
import { Store } from '@/types/api/store';
import { Table } from '@/types/api/table';
import { NewReservationFormMutation } from '@/types/forms/reservation';
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

  const fetchReservation = async ({ id }: { id: string }): Promise<Reservation> => {
    const { data } = await axios.get<{ success: boolean; msg: string | undefined | Reservation }>(`/reservation/${id}`);
    const { success, msg } = data;

    if (!success || typeof msg === 'string' || !msg) {
      throw new Error(typeof msg === 'string' ? msg : `err_fetch_failed`);
    }
    return msg;
  };

  const addReservation = async (form: NewReservationFormMutation): Promise<Reservation> => {
    const { data } = await axios.post<{
      success: boolean;
      msg: string | undefined | Reservation;
    }>('/reservation', form);
    const { success, msg } = data;

    if (!success || typeof msg === 'string' || !msg) {
      throw new Error(typeof msg === 'string' ? msg : `err_fetch_failed`);
    }
    return msg;
  };

  const sendCancelReservationRequest = async ({ id }: { id: string }): Promise<string> => {
    const { data } = await axios.get<{
      success: boolean;
      msg: string | undefined;
    }>(`/reservation/cancel/${id}`);
    const { success, msg } = data;

    if (!success || !msg) {
      throw new Error(typeof msg === 'string' ? msg : `err_fetch_failed`);
    }
    return msg;
  };

  const cancelReservation = async ({ token }: { token: string }): Promise<string> => {
    const { data } = await axios.put<{ success: boolean; msg: string | undefined }>(`/reservation/cancel/${token}`);
    const { success, msg } = data;
    if (!success || !msg) {
      throw new Error(`err_fetch_failed`);
    }
    return msg;
  };

  return {
    fetchAllStoresReservations,
    fetchOwnReservations,
    addReservation,
    fetchReservation,
    cancelReservation,
    sendCancelReservationRequest
  };
};

export default useReservationsApi;
