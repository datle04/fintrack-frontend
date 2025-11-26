import axios from 'axios';

const BACK_END_URL = import.meta.env.VITE_BACK_END_URL;

// Tạo một Axios instance
const axiosInstance = axios.create({
  // baseURL: BACK_END_URL,
  baseURL: '/', // sau
  headers: {
        'Content-Type': 'application/json', // sau
  },
  withCredentials: true, // Quan trọng: Để gửi cookie tự động
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


export default axiosInstance; // Export instance đã cấu hình