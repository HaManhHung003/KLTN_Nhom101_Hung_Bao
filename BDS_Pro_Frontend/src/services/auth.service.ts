import { api } from './api';
import type { User, UserRole } from '../types';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: UserRole;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  async login(dto: LoginDto): Promise<AuthResponse> {
    const res = await api.post<any, AuthResponse>('/auth/login', dto);
    if (res.accessToken) {
      localStorage.setItem('token', res.accessToken);
      if (res.refreshToken) {
        localStorage.setItem('refreshToken', res.refreshToken);
      }
      localStorage.setItem('user', JSON.stringify(res.user));
    }
    return res;
  },

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const res = await api.post<any, AuthResponse>('/auth/register', dto);
    if (res.accessToken) {
      localStorage.setItem('token', res.accessToken);
      if (res.refreshToken) {
        localStorage.setItem('refreshToken', res.refreshToken);
      }
      localStorage.setItem('user', JSON.stringify(res.user));
    }
    return res;
  },

  /** Bước 1: Gửi OTP đến email đăng ký. */
  async sendOtp(email: string, name: string): Promise<{ message: string }> {
    return api.post<any, { message: string }>('/auth/send-otp', { email, name });
  },

  /** Bước 2: Xác thực OTP và hoàn tất đăng ký. */
  async verifyOtp(data: {
    email: string;
    otp: string;
    name: string;
    password: string;
    phone?: string;
    role?: string;
  }): Promise<AuthResponse> {
    const res = await api.post<any, AuthResponse>('/auth/verify-otp', data);
    if (res.accessToken) {
      localStorage.setItem('token', res.accessToken);
      if (res.refreshToken) {
        localStorage.setItem('refreshToken', res.refreshToken);
      }
      localStorage.setItem('user', JSON.stringify(res.user));
    }
    return res;
  },

  async getProfile(): Promise<User> {
    const user = await api.get<any, User>('/auth/me');
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};

/** Helpers tiện ích để kiểm tra trạng thái đăng nhập từ localStorage. */
export const authStorage = {
  isAuthenticated(): boolean {
    return Boolean(localStorage.getItem('token'));
  },
  getToken(): string | null {
    return localStorage.getItem('token');
  },
  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? (JSON.parse(userStr) as User) : null;
  },
};
