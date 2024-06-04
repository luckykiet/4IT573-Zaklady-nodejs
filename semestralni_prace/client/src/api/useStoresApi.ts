import { Store } from '@/types/api/store';
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
    const { data } = await axios.get<{ success: boolean; msg: string | undefined | Store[] }>('/store', { params: { storeId: id } });
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
    const { data } = await axios.get<{ success: boolean; msg: string | undefined | Store }>('/mod/store', { params: { storeId: id } });
    const { success, msg } = data;
    if (!success || typeof msg === 'string' || !msg) {
      throw new Error(typeof msg === 'string' ? msg : `err_fetch_failed`);
    }
    return msg;
  };

  return { fetchGuestStore, fetchGuestStores, fetchOwnStores, fetchOwnStore };
};

export default useStoreApi;
