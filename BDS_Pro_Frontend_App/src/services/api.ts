import axios from 'axios';
import { Platform } from 'react-native';

// Địa chỉ Backend API:
// - Android Emulator: 10.0.2.2:4000
// - iOS Simulator / Web: localhost:4000
// - Thiết bị thật: IP mạng LAN (ví dụ 192.168.1.x:4000)
export const BASE_URL = Platform.select({
  android: 'http://10.0.2.2:4000/api/v1',
  ios: 'http://localhost:4000/api/v1',
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
