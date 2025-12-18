import axios from 'axios';

const BACK_END_URL = import.meta.env.VITE_BACK_END_URL;

const axiosInstance = axios.create({
  baseURL: BACK_END_URL,
  // baseURL: '/', // sau
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


export default axiosInstance; 