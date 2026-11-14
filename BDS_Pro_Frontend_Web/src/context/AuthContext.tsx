import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '../types';
import { authService, type LoginDto, type RegisterDto } from '../services/auth.service';

export type AppActorRole = 'guest' | 'user' | 'host' | 'admin';

interface AuthContextType {
  user: User | null;
  actorRole: AppActorRole;
  token: string | null;
  loading: boolean;
  login: (dto: LoginDto) => Promise<void>;
  register: (dto: RegisterDto) => Promise<void>;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => authService.getCurrentUser());
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (token) {
      authService
        .getProfile()
        .then((userData) => setUser(userData))
        .catch(() => {
          authService.logout();
          setUser(null);
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (dto: LoginDto) => {
    const res = await authService.login(dto);
    setUser(res.user);
    setToken(res.accessToken);
  };

  const register = async (dto: RegisterDto) => {
    const res = await authService.register(dto);
    setUser(res.user);
    setToken(res.accessToken);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  // Map backend/frontend role to 4 Actor names: guest, user (buyer), host (agent), admin
  const getActorRole = (): AppActorRole => {
    if (!user || !token) return 'guest';
    if (user.role === 'admin') return 'admin';
    if (user.role === 'agent') return 'host';
    return 'user';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        actorRole: getActorRole(),
        token,
        loading,
        login,
        register,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
