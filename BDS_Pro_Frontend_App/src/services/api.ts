import axios from 'axios';
import { Platform } from 'react-native';

// Địa chỉ IPv4 của máy tính trên mạng Wi-Fi
// Cho phép cả Trình duyệt Web và Điện thoại thật (Expo Go) kết nối đồng bộ 100% vào chung 1 Database MySQL
export const LAN_IP = '192.168.1.93';

export const BASE_URL = Platform.select({
  android: `http://${LAN_IP}:4000/api/v1`,
  ios: `http://${LAN_IP}:4000/api/v1`,
  default: 'http://localhost:4000/api/v1',
});

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
