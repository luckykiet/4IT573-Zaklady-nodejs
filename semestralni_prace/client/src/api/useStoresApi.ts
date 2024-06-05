import { Store } from '@/types/api/store';
import { NewStoreFormMutation, StoreFormMutation } from '@/types/forms/store';
import axios from '@/utils/axios';
const useStoreApi = () => {
  const fetchGuestStores = async (): Promise<Store[]> => {
    const { data } = await axios.get<{ success: boolean; msg: string | undefined | Store[] }>('/stores');
    const { success, msg } = data;
    if (!success || typeof msg === 'string' || !msg) {
      throw new Error(typeof msg === 'string' ? msg : `err_fetch_failed`);
    }
    return msg;
  };
  const fetchGuestStore = async ({ id }: { id: string }): Promise<Store[]> => {
    const { data } = await axios.get<{ success: boolean; msg: string | undefined | Store[] }>(`/store/${id}`);
    const { success, msg } = data;
    if (!success || typeof msg === 'string' || !msg) {
      throw new Error(typeof msg === 'string' ? msg : `err_fetch_failed`);
    }
    return msg;
  };

  const fetchOwnStores = async (): Promise<Store[]> => {
    const { data } = await axios.get<{ success: boolean; msg: string | undefined | Store[] }>('/mod/stores');
    const { success, msg } = data;

    if (!success || typeof msg === 'string' || !msg) {
      throw new Error(typeof msg === 'string' ? msg : `err_fetch_failed`);
    }
    return msg;
  };

  const fetchOwnStore = async ({ id }: { id: string }): Promise<Store> => {
    const { data } = await axios.get<{ success: boolean; msg: string | undefined | Store }>(`/mod/store/${id}`);
    const { success, msg } = data;
    if (!success || typeof msg === 'string' || !msg) {
      throw new Error(typeof msg === 'string' ? msg : `err_fetch_failed`);
    }
    return msg;
  };

  const addNewStore = async (form: NewStoreFormMutation): Promise<Store> => {
    const { data } = await axios.post<{ success: boolean; msg: string | undefined | Store }>('/mod/store', form);
    const { success, msg } = data;
    if (!success || typeof msg === 'string' || !msg) {
      throw new Error(typeof msg === 'string' ? msg : `err_fetch_failed`);
    }
    return msg;
  };
  const updateStore = async (form: StoreFormMutation): Promise<Store> => {
    const { data } = await axios.put<{ success: boolean; msg: string | undefined | Store }>('/mod/store', form);
    const { success, msg } = data;
    if (!success || typeof msg === 'string' || !msg) {
      throw new Error(typeof msg === 'string' ? msg : `err_fetch_failed`);
    }
    return msg;
  };

  return { addNewStore, updateStore, fetchGuestStore, fetchGuestStores, fetchOwnStores, fetchOwnStore };
};

export default useStoreApi;
