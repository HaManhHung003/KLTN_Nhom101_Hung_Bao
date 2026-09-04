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
      localStorage.setItem('user', JSON.stringify(res.user));
    }
    return res;
  },

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const res = await api.post<any, AuthResponse>('/auth/register', dto);
    if (res.accessToken) {
      localStorage.setItem('token', res.accessToken);
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
    localStorage.removeItem('user');
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};
