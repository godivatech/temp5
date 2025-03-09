import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  FirebaseUser, 
  onAuthStateChange, 
  getCurrentUserData, 
  UserData, 
  UserRole,
  registerUser,
  loginUser,
  logoutUser,
  updateUserRole,
  initializeMasterAdmin
} from '@/lib/firebase';
import { toast } from 'sonner';

type AuthContextType = {
  currentUser: FirebaseUser | null;
  userData: UserData | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  role: UserRole | null;
  login: (email: string, password: string) => Promise<UserData>;
  register: (email: string, password: string, name: string, phone: string) => Promise<UserData>;
  logout: () => Promise<boolean>;
  updateRole: (userId: string, newRole: UserRole) => Promise<boolean>;
  createMasterAdmin: (email: string, password: string, name: string, phone: string) => Promise<UserData | null>;
  hasRole: (roles: UserRole[]) => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          const data = await getCurrentUserData();
          setUserData(data);
        } catch (error) {
          console.error('Error fetching user data:', error);
          
          // Only show toast if it's not an offline error
          if (!(error instanceof Error && error.message.includes('offline'))) {
            toast.error('Failed to fetch user data');
          }
        }
      } else {
        setUserData(null);
      }
      
      setIsLoading(false);
    });
    
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Check if we're online before attempting to login
      if (!navigator.onLine) {
        throw new Error('You are currently offline. Please check your internet connection and try again.');
      }
      
      const data = await loginUser(email, password);
      return data;
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, phone: string) => {
    try {
      setIsLoading(true);
      const data = await registerUser(email, password, name, phone);
      return data;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await logoutUser();
      return true;
    } catch (error: any) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateRole = async (userId: string, newRole: UserRole) => {
    try {
      await updateUserRole(userId, newRole);
      return true;
    } catch (error: any) {
      console.error('Update role error:', error);
      throw error;
    }
  };

  const createMasterAdmin = async (email: string, password: string, name: string, phone: string) => {
    try {
      const data = await initializeMasterAdmin(email, password, name, phone);
      return data;
    } catch (error: any) {
      console.error('Master admin creation error:', error);
      throw error;
    }
  };

  const hasRole = (roles: UserRole[]) => {
    if (!userData) return false;
    return roles.includes(userData.role);
  };

  const value = {
    currentUser,
    userData,
    isLoading,
    isAuthenticated: !!currentUser,
    role: userData?.role || null,
    login,
    register,
    logout,
    updateRole,
    createMasterAdmin,
    hasRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
