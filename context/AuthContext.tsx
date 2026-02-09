import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse } from '../types';
import { mockBackend } from '../services/mockBackend';
import { auth, googleProvider } from '../services/firebaseConfig';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { userService } from '../services/supabaseService';
import { isSupabaseConfigured } from '../services/supabaseClient';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper: Convert Firebase user to app User
  const firebaseUserToAppUser = async (firebaseUser: FirebaseUser): Promise<User> => {
    if (isSupabaseConfigured()) {
      // Use Supabase - get or create user
      try {
        const nameParts = firebaseUser.displayName?.split(' ') || ['', ''];
        const appUser = await userService.getOrCreateUser(
          firebaseUser.uid,
          firebaseUser.email || '',
          nameParts[0],
          nameParts.slice(1).join(' ')
        );
        return appUser;
      } catch (error) {
        console.error('Error syncing user with Supabase:', error);
        // Fallback to basic user object
        return {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          firstName: firebaseUser.displayName?.split(' ')[0] || '',
          lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
          isEmailVerified: firebaseUser.emailVerified,
          isOnboardingComplete: false
        };
      }
    } else {
      // Use mock backend
      return {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        firstName: firebaseUser.displayName?.split(' ')[0] || '',
        lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
        isEmailVerified: firebaseUser.emailVerified,
        isOnboardingComplete: false
      };
    }
  };

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      try {
        if (firebaseUser) {
          const appUser = await firebaseUserToAppUser(firebaseUser);
          setUser(appUser);
          localStorage.setItem('shethrive_current_user', JSON.stringify(appUser));
        } else {
          // No Firebase user - check localStorage for mock backend session
          const storedUser = localStorage.getItem('shethrive_current_user');
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              // If using Supabase, verify user exists
              if (isSupabaseConfigured()) {
                const freshUser = await userService.getUser(parsedUser.id);
                if (freshUser) {
                  setUser(freshUser);
                } else {
                  localStorage.removeItem('shethrive_current_user');
                  setUser(null);
                }
              } else {
                // Mock backend verification
                try {
                  const freshProfile = await mockBackend.user.getProfile(parsedUser.id);
                  setUser(freshProfile);
                } catch {
                  localStorage.removeItem('shethrive_current_user');
                  setUser(null);
                }
              }
            } catch {
              localStorage.removeItem('shethrive_current_user');
              setUser(null);
            }
          } else {
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Try Firebase email/password auth first
      try {
        await signInWithEmailAndPassword(auth, email, password);
        // onAuthStateChanged will handle the rest
      } catch (firebaseError: any) {
        // If Firebase fails, fall back to mock backend
        console.log("Firebase login failed, trying mock backend:", firebaseError.message);
        const response = await mockBackend.auth.login(email, password);
        handleAuthSuccess(response);
      }
    } catch (err: any) {
      setIsLoading(false);
      throw new Error(err.message || 'Login failed');
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    setIsLoading(true);
    try {
      // Try Firebase registration first
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Create user in Supabase if configured
        if (isSupabaseConfigured()) {
          await userService.createUser(userCredential.user.uid, email, firstName, lastName);
        }
        // onAuthStateChanged will handle the rest
      } catch (firebaseError: any) {
        // If Firebase fails, fall back to mock backend
        console.log("Firebase registration failed, trying mock backend:", firebaseError.message);
        const response = await mockBackend.auth.register(email, password, firstName, lastName);
        handleAuthSuccess(response);
      }
    } catch (err: any) {
      setIsLoading(false);
      throw new Error(err.message || 'Registration failed');
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // User will be handled by onAuthStateChanged
      console.log("Google sign-in successful:", result.user.email);
    } catch (err: any) {
      setIsLoading(false);
      console.error("Google sign-in error:", err);
      throw new Error(err.message || 'Google sign-in failed');
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.log("Firebase signout error (might not be signed in with Firebase):", e);
    }
    await mockBackend.auth.logout();
    localStorage.removeItem('shethrive_current_user');
    localStorage.removeItem('shethrive_token');
    setUser(null);
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    try {
      let updatedUser: User;
      if (isSupabaseConfigured()) {
        updatedUser = await userService.updateUser(user.id, updates);
      } else {
        updatedUser = await mockBackend.user.updateProfile(user.id, updates);
      }
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
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading, 
      login, 
      register,
      loginWithGoogle,
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