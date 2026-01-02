
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, Permission } from '../types';
import { whatsappService } from '../services/whatsappService';

interface AuthContextType {
  user: User | null;
  users: User[]; 
  login: (email: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  hasPermission: (permission: Permission) => boolean;
  addUser: (user: Partial<User>) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Restore session and fetch team
  useEffect(() => {
    const initAuth = async () => {
      const savedUser = localStorage.getItem('guthmi_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      
      // If logged in, fetch team members
      if (savedUser) {
        try {
          const teamData = await whatsappService.getUsers();
          setUsers(teamData);
        } catch (e) {
          console.error("Failed to load team data", e);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string): Promise<boolean> => {
    try {
      const foundUser = await whatsappService.login(email);
      if (foundUser) {
        setUser(foundUser);
        localStorage.setItem('guthmi_user', JSON.stringify(foundUser));
        
        // Load team after login
        const teamData = await whatsappService.getUsers();
        setUsers(teamData);
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
    localStorage.removeItem('guthmi_user');
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    return user.permissions?.includes(permission) || false;
  };

  // --- Team Management (Live) ---
  const addUser = async (newUser: Partial<User>) => {
    const createdUser = await whatsappService.saveUser(newUser);
    setUsers([...users, createdUser]);
  };

  const updateUser = async (updatedUser: User) => {
    const savedUser = await whatsappService.saveUser(updatedUser);
    setUsers(users.map(u => u.id === savedUser.id ? savedUser : u));
    // Update current session if self-edit
    if (user?.id === savedUser.id) {
       setUser(savedUser);
       localStorage.setItem('guthmi_user', JSON.stringify(savedUser));
    }
  };

  const deleteUser = async (id: string) => {
    await whatsappService.deleteUser(id);
    setUsers(users.filter(u => u.id !== id));
  };

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
