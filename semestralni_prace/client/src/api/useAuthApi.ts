import { UserProfile } from '@/types/auth';
import { LoginFormMutation, RegistrationFormMutation } from '@/types/forms/auth';

import axios from '@/utils/axios';

const useAuthApi = () => {
  const checkAuth = async () => {
    const { data } = await axios.post<{ success: boolean; msg: string | undefined | UserProfile }>('/isAuthenticated');
    const { success, msg } = data;

    if (!success || typeof msg === 'string' || !msg) {
      throw new Error(typeof msg === 'string' ? msg : `err_fetch_failed`);
    }
    return msg;
  };

  const login = async (form: LoginFormMutation): Promise<UserProfile> => {
    const { data } = await axios.post<{ success: boolean; msg: string | undefined | UserProfile }>('/auth', {
      email: form.email.toLowerCase(),
      password: form.password
    });
    const { success, msg } = data;

    if (!success || typeof msg === 'string' || !msg) {
      throw new Error(typeof msg === 'string' ? msg : `err_fetch_failed`);
    }
    return msg;
  };

  const registration = async (form: RegistrationFormMutation): Promise<UserProfile> => {
    const { data } = await axios.post<{ success: boolean; msg: string | undefined | UserProfile }>('/register', {
      name: form.name,
      email: form.email.toLowerCase(),
      password: form.password,
      role: form.role
    });

    const { success, msg } = data;

    if (!success || typeof msg === 'string' || !msg) {
      throw new Error(typeof msg === 'string' ? msg : `err_fetch_failed`);
    }

    return msg;
  };

  const logout = async () => {
    const response = await axios.post('/signout');
    const { data } = response;
    return data;
  };

  return { checkAuth, login, registration, logout };
};

export default useAuthApi;
