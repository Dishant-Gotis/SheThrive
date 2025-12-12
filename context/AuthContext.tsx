import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse } from '../types';
import { mockBackend } from '../services/mockBackend';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from LocalStorage
  useEffect(() => {
    const checkSession = async () => {
      try {
        const storedUser = localStorage.getItem('shethrive_current_user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          // Verify user still exists in "database" (mock backend)
          try {
             const freshProfile = await mockBackend.user.getProfile(parsedUser.id);
             setUser(freshProfile);
          } catch (e) {
             console.warn("Stored user not found in backend, clearing session");
             localStorage.removeItem('shethrive_current_user');
             setUser(null);
          }
        }
      } catch (e) {
        console.error("Failed to parse stored user", e);
        localStorage.removeItem('shethrive_current_user');
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
        console.log("Logging in via Mock Backend");
        const response = await mockBackend.auth.login(email, password);
        handleAuthSuccess(response);
    } catch (err: any) {
        setIsLoading(false);
        throw new Error(err.message || 'Login failed');
    }
    setIsLoading(false);
  };

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    setIsLoading(true);
    try {
        console.log("Registering via Mock Backend");
        const response = await mockBackend.auth.register(email, password, firstName, lastName);
        handleAuthSuccess(response);
    } catch (err: any) {
        setIsLoading(false);
        throw new Error(err.message || 'Registration failed');
    }
    setIsLoading(false);
  };

  const logout = async () => {
    await mockBackend.auth.logout();
    localStorage.removeItem('shethrive_current_user');
    localStorage.removeItem('shethrive_token');
    setUser(null);
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    try {
      const updatedUser = await mockBackend.user.updateProfile(user.id, updates);
      setUser(updatedUser);
      localStorage.setItem('shethrive_current_user', JSON.stringify(updatedUser));
    } catch (e) {
      console.error("Failed to update profile", e);
      throw e;
    }
  };

  const handleAuthSuccess = (response: AuthResponse) => {
    setUser(response.user);
    localStorage.setItem('shethrive_current_user', JSON.stringify(response.user));
    localStorage.setItem('shethrive_token', response.accessToken);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading, 
      login, 
      register, 
      logout,
      updateUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};