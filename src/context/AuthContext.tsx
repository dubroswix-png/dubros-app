'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

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
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  completeOnboarding: (data: Partial<UserProfile>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Fetch profile from Supabase
  const fetchProfile = async (user: User) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data && !error) {
      const profile: UserProfile = {
        email: data.email,
        role: data.role as UserRole,
        name: data.name || undefined,
        phone: data.phone || undefined,
        country: data.country || undefined,
        companyName: data.company_name || undefined,
        businessType: data.business_type || undefined,
      };
      setUserProfile(profile);
      setIsLoggedIn(true);
    } else {
      // Profile not found yet (maybe trigger hasn't fired), create a minimal one
      const profile: UserProfile = {
        email: user.email || '',
        role: 'pending',
      };
      setUserProfile(profile);
      setIsLoggedIn(true);
    }
  };

  useEffect(() => {
    // Check current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user);
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          await fetchProfile(session.user);
        } else {
          setIsLoggedIn(false);
          setUserProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.user) {
      await fetchProfile(data.user);
    }
    return { success: true };
  };

  const register = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.user) {
      await fetchProfile(data.user);
    }
    return { success: true };
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/catalogo`,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  };

  const completeOnboarding = async (data: Partial<UserProfile>) => {
    if (!userProfile) return;

    // Get current user id
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        role: 'client',
        name: data.name,
        phone: data.phone,
        country: data.country,
        company_name: data.companyName,
        business_type: data.businessType,
      })
      .eq('id', user.id);

    if (!error) {
      setUserProfile({
        ...userProfile,
        ...data,
        role: 'client',
      });
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userProfile, login, register, loginWithGoogle, completeOnboarding, logout }}>
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
