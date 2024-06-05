import { Table } from '@/types/api/table';
import { NewTableFormMutation, TableFormMutation } from '@/types/forms/table';
import axios from '@/utils/axios';
const useTableApi = () => {
  const addNewTable = async (form: NewTableFormMutation): Promise<Table> => {
    const { data } = await axios.post<{ success: boolean; msg: string | undefined | Table }>('/mod/table', form);
    const { success, msg } = data;
    if (!success || typeof msg === 'string' || !msg) {
      throw new Error(typeof msg === 'string' ? msg : `err_fetch_failed`);
    }
    return msg;
  };
  const updateTable = async (form: TableFormMutation): Promise<Table> => {
    const { data } = await axios.put<{ success: boolean; msg: string | undefined | Table }>('/mod/table', form);
    const { success, msg } = data;
    if (!success || typeof msg === 'string' || !msg) {
      throw new Error(typeof msg === 'string' ? msg : `err_fetch_failed`);
    }
    return msg;
  };

  const deleteTable = async ({ id }: { id: string }): Promise<string> => {
    const { data } = await axios.delete<{ success: boolean; msg: string | undefined }>(`/mod/table/${id}`);
    const { success, msg } = data;
    if (!success || !msg) {
      throw new Error(`err_fetch_failed`);
    }
    return msg;
  };

  const fetchTable = async ({ id }: { id: string }): Promise<Table> => {
    const { data } = await axios.get<{ success: boolean; msg: string | undefined | Table }>(`/mod/table/${id}`);
    const { success, msg } = data;
    if (!success || typeof msg === 'string' || !msg) {
      throw new Error(typeof msg === 'string' ? msg : `err_fetch_failed`);
    }
    return msg;
  };

  return { addNewTable, updateTable, deleteTable, fetchTable };
};

export default useTableApi;
