import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  register: (payload: { name: string; email: string; pass: string; phone: string; role?: string }) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  quickLogin: (role: 'buyer' | 'agent' | 'admin') => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const AUTH_USER_KEY = '@bds_pro_user';
const AUTH_TOKEN_KEY = '@bds_pro_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Khởi động: Đọc token từ bộ nhớ đệm
  useEffect(() => {
    const loadSavedAuth = async () => {
      try {
        const savedToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        const savedUserStr = await AsyncStorage.getItem(AUTH_USER_KEY);
        if (savedToken && savedUserStr) {
          const parsedUser = JSON.parse(savedUserStr);
          setUser(parsedUser);
          setToken(savedToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
        } else {
          // Mặc định đăng nhập tài khoản Khách hàng Cao Văn Bảo để thuận tiện test
          const defaultUser: UserProfile = {
            id: 'u-bao',
            name: 'Cao Văn Bảo',
            email: 'baocao@gmail.com',
            phone: '0332536815',
            role: 'buyer',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
          };
          setUser(defaultUser);
        }
      } catch (e) {
        console.log('Error reading auth cache');
      } finally {
        setIsLoading(false);
      }
    };
    loadSavedAuth();
  }, []);

  // Đăng nhập
  const login = async (email: string, pass: string) => {
    try {
      const res = await api.post('/auth/login', { email, password: pass });
      const { accessToken, user: apiUser } = res.data;

      const profile: UserProfile = {
        id: apiUser.id,
        name: apiUser.name || 'Người dùng BDS Pro',
        email: apiUser.email,
        phone: apiUser.phone || '0332536815',
        role: apiUser.role || 'buyer',
        avatar: apiUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      };

      setUser(profile);
      setToken(accessToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      await AsyncStorage.setItem(AUTH_TOKEN_KEY, accessToken);
      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(profile));

      return { success: true };
    } catch (e: any) {
      return {
        success: false,
        message: e.response?.data?.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại!',
      };
    }
  };

  // Đăng ký
  const register = async (payload: { name: string; email: string; pass: string; phone: string; role?: string }) => {
    try {
      const res = await api.post('/auth/register', {
        name: payload.name,
        email: payload.email,
        password: payload.pass,
        phone: payload.phone,
        role: payload.role || 'buyer',
      });
      const { accessToken, user: apiUser } = res.data;
      if (accessToken && apiUser) {
        const profile: UserProfile = {
          id: apiUser.id,
          name: apiUser.name,
          email: apiUser.email,
          phone: apiUser.phone,
          role: apiUser.role,
          avatar: apiUser.avatar,
        };
        setUser(profile);
        setToken(accessToken);
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, accessToken);
        await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(profile));
      }
      return { success: true };
    } catch (e: any) {
      return {
        success: false,
        message: e.response?.data?.message || 'Đăng ký không thành công. Email có thể đã tồn tại!',
      };
    }
  };

  // Đăng xuất
  const logout = async () => {
    setUser(null);
    setToken(null);
    delete api.defaults.headers.common['Authorization'];
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    await AsyncStorage.removeItem(AUTH_USER_KEY);
  };

  // Đăng nhập nhanh 1-chạm (Dành cho Demo KLTN)
  const quickLogin = async (role: 'buyer' | 'agent' | 'admin') => {
    const mockUsers: Record<string, UserProfile> = {
      buyer: {
        id: 'u-buyer',
        name: 'Cao Văn Bảo (Khách hàng)',
        email: 'baocao@gmail.com',
        phone: '0332536815',
        role: 'buyer',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      },
      agent: {
        id: 'u-agent',
        name: 'Hà Mạnh Hưng (Môi giới cấp 1)',
        email: 'manhhung@bdspro.vn',
        phone: '0909123456',
        role: 'agent',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
      },
      admin: {
        id: 'u-admin',
        name: 'Quản trị viên Hệ thống',
        email: 'admin@bdspro.vn',
        phone: '0999888777',
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
      },
    };

    const targetUser = mockUsers[role];
    setUser(targetUser);
    setToken('mock_jwt_token_' + role);
    await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(targetUser));
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, 'mock_jwt_token_' + role);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, quickLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
