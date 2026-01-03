
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, Permission } from '../types';
import axios from 'axios';

interface AuthContextType {
  user: User | null;
  users: User[]; 
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  hasPermission: (permission: Permission) => boolean;
  addUser: (user: Partial<User>) => void;
  updateUser: (user: User) => void;
  deleteUser: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]); 
  const [loading, setLoading] = useState(true);

  // CRITICAL: Must use full URL in production (Vercel has no proxy)
  // In development, Vite proxy handles /api -> localhost:3000
  const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://guthmi-api-production.up.railway.app/api';

  useEffect(() => {
    const token = localStorage.getItem('guthmi_token');
    const savedUser = localStorage.getItem('guthmi_user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      const payload = { email, password }; 
      const { data } = await axios.post(`${API_URL}/auth/login`, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (data.token && data.user) {
        localStorage.setItem('guthmi_token', data.token);
        localStorage.setItem('guthmi_user', JSON.stringify(data.user));
        setUser(data.user);
        return true;
      }
      return false;
    } catch (e) {
      console.error("Login failed", e);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('guthmi_token');
    localStorage.removeItem('guthmi_user');
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true; 
    return user.permissions?.includes(permission) || false;
  };

  // Stubs for team management
  const addUser = (u: Partial<User>) => console.log('Add user', u);
  const updateUser = (u: User) => {
    if (user?.id === u.id) {
      setUser(u);
      localStorage.setItem('guthmi_user', JSON.stringify(u));
    }
  };
  const deleteUser = (id: string) => console.log('Delete user', id);

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ 
      user, users, login, logout, isAuthenticated: !!user, hasPermission,
      addUser, updateUser, deleteUser
    }}>
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
