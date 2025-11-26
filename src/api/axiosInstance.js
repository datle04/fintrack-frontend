import axios from 'axios';

const BACK_END_URL = import.meta.env.VITE_BACK_END_URL;

// Tạo một Axios instance
const axiosInstance = axios.create({
  // baseURL: BACK_END_URL,
  baseURL: '/api',
  headers: {
        'Content-Type': 'application/json',
  },
  withCredentials: true, // Quan trọng: Để gửi cookie tự động
});


export default axiosInstance; // Export instance đã cấu hình