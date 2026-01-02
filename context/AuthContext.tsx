import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
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

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  /* ======================
     Restore Session
  ====================== */
  useEffect(() => {
    const initAuth = async () => {
      const saved = localStorage.getItem('guthmi_user');

      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setUser(parsed);

          // load team (optional – fake now)
          const teamData = await whatsappService.getUsers();
          setUsers(teamData);
        } catch (e) {
          console.error('Failed to restore auth session', e);
          localStorage.removeItem('guthmi_user');
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  /* ======================
     Login
  ====================== */
const login = async (email: string): Promise<boolean> => {
  try {
    const data = await whatsappService.login(email);

    if (!data) return false;

    setUser(data); // ✅ الصح
    localStorage.setItem('guthmi_user', JSON.stringify(data));

    const teamData = await whatsappService.getUsers();
    setUsers(teamData);

    return true;
  } catch (e) {
    console.error('Login failed', e);
    return false;
  }
};

  /* ======================
     Logout
  ====================== */
  const logout = () => {
    setUser(null);
    setUsers([]);
    localStorage.removeItem('guthmi_user');
  };

  /* ======================
     Permissions
  ====================== */
  const hasPermission = (permission: Permission): boolean => {
    if (!user || !user.permissions) return false;

    // 👑 SUPER ADMIN
    if (user.permissions.includes('*')) return true;

    return user.permissions.includes(permission);
  };

  /* ======================
     Team Management (Mock)
  ====================== */
  const addUser = async (newUser: Partial<User>) => {
    const createdUser = await whatsappService.saveUser(newUser);
    setUsers((prev) => [...prev, createdUser]);
  };

 const updateUser = async (updatedUser: User) => {
  const savedUser = await whatsappService.saveUser(updatedUser);

  setUsers((prev) =>
    prev.map((u) => (u.id === savedUser.id ? savedUser : u))
  );

  if (user?.id === savedUser.id) {
    setUser(savedUser);
    localStorage.setItem(
      'guthmi_user',
      JSON.stringify({
        token: 'dev-token-123',
        user: savedUser,
      })
    );
  }
};

  const deleteUser = async (id: string) => {
    await whatsappService.deleteUser(id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  if (loading) return null;

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        login,
        logout,
        isAuthenticated: !!user,
        hasPermission,
        addUser,
        updateUser,
        deleteUser,
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
