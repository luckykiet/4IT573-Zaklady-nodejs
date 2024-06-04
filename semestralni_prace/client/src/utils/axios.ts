import axios from 'axios';

const axiosServices = axios.create({
  baseURL: 'api/v1',
  withCredentials: true
});
// ==============================|| AXIOS - FOR MOCK SERVICES ||============================== //

axiosServices.interceptors.request.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      return Promise.reject('Unauthorized');
    }

    return Promise.reject(
      error?.response && error.response?.data ? (error.response.data.msg ? error.response.data.msg : error.response.data) : 'Wrong Services'
    );
  }
);

axiosServices.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      return Promise.reject('Unauthorized');
    }
    return Promise.reject(
      error?.response && error.response?.data ? (error.response.data.msg ? error.response.data.msg : error.response.data) : 'Wrong Services'
    );
  }
);

export default axiosServices;
