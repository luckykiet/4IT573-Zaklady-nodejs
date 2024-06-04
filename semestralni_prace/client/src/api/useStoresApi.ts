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

  return { fetchGuestStores };
};

export default useStoreApi;
