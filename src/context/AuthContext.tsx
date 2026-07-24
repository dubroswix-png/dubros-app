'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'admin' | 'client' | 'pending';

export interface UserProfile {
  email: string;
  role: UserRole;
  name?: string;
  phone?: string;
  country?: string;
  companyName?: string;
  businessType?: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  userProfile: UserProfile | null;
  login: (email: string, password?: string) => Promise<boolean>;
  register: (email: string, password?: string) => Promise<boolean>;
  completeOnboarding: (data: Partial<UserProfile>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simulated database
const MOCK_USERS: Record<string, UserProfile> = {
  'dubroswix@gmail.com': { email: 'dubroswix@gmail.com', role: 'admin', name: 'Super Admin' },
  'duque.jdavid@gmail.com': { email: 'duque.jdavid@gmail.com', role: 'client', name: 'Juan David' },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Check localStorage on mount
    const savedAuth = localStorage.getItem('dubros_auth_v2');
    if (savedAuth) {
      try {
        const parsed = JSON.parse(savedAuth);
        if (parsed.isLoggedIn && parsed.profile) {
          setIsLoggedIn(true);
          setUserProfile(parsed.profile);
        }
      } catch (e) {
        console.error('Error parsing auth state', e);
      }
    }
  }, []);

  const persistAuth = (status: boolean, profile: UserProfile | null) => {
    setIsLoggedIn(status);
    setUserProfile(profile);
    if (status && profile) {
      localStorage.setItem('dubros_auth_v2', JSON.stringify({ isLoggedIn: true, profile }));
    } else {
      localStorage.removeItem('dubros_auth_v2');
    }
  };

  const login = async (email: string, password?: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check local storage for newly registered users, fallback to MOCK_USERS
    const localUsersStr = localStorage.getItem('dubros_users_db');
    const localUsers = localUsersStr ? JSON.parse(localUsersStr) : {};
    const db = { ...MOCK_USERS, ...localUsers };

    const user = db[email];
    if (user) {
      // Valid user found (ignoring password validation for mock simplicity)
      persistAuth(true, user);
      return true;
    }
    return false; // User not found
  };

  const register = async (email: string, password?: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const localUsersStr = localStorage.getItem('dubros_users_db');
    const localUsers = localUsersStr ? JSON.parse(localUsersStr) : {};
    const db = { ...MOCK_USERS, ...localUsers };

    if (db[email]) {
      return false; // Already exists
    }

    const newUser: UserProfile = { email, role: 'pending' };
    localUsers[email] = newUser;
    localStorage.setItem('dubros_users_db', JSON.stringify(localUsers));
    
    // Automatically log them in as pending
    persistAuth(true, newUser);
    return true;
  };

  const completeOnboarding = (data: Partial<UserProfile>) => {
    if (!userProfile) return;

    const updatedProfile = { ...userProfile, ...data, role: 'client' as UserRole };
    
    // Update local DB
    const localUsersStr = localStorage.getItem('dubros_users_db');
    const localUsers = localUsersStr ? JSON.parse(localUsersStr) : {};
    localUsers[updatedProfile.email] = updatedProfile;
    localStorage.setItem('dubros_users_db', JSON.stringify(localUsers));

    // Update current session
    persistAuth(true, updatedProfile);
  };

  const logout = () => {
    persistAuth(false, null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userProfile, login, register, completeOnboarding, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
