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
  taxId?: string;
  address?: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  userProfile: UserProfile | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (
    email: string,
    password: string,
    metadata?: { name?: string; companyName?: string; businessType?: string; country?: string; whatsapp?: string }
  ) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  completeOnboarding: (data: Partial<UserProfile>) => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
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
      const isAdminEmail = data.email === 'dubroswix@gmail.com';
      const profile: UserProfile = {
        email: data.email,
        role: isAdminEmail ? 'admin' : (data.role as UserRole),
        name: data.name || undefined,
        phone: data.phone || undefined,
        country: data.country || undefined,
        companyName: data.company_name || undefined,
        businessType: data.business_type || undefined,
        taxId: data.tax_id || undefined,
        address: data.address || undefined,
      };
      setUserProfile(profile);
      setIsLoggedIn(true);
    } else {
      // Profile not found yet (maybe trigger hasn't fired), create a minimal one
      const isAdminEmail = user.email === 'dubroswix@gmail.com';
      const profile: UserProfile = {
        email: user.email || '',
        role: isAdminEmail ? 'admin' : 'pending',
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

  const register = async (
    email: string,
    password: string,
    metadata?: { name?: string; companyName?: string; businessType?: string; country?: string; whatsapp?: string }
  ): Promise<{ success: boolean; error?: string }> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: metadata?.name,
          company_name: metadata?.companyName,
          business_type: metadata?.businessType,
          country_code: metadata?.country,
          whatsapp: metadata?.whatsapp,
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.user) {
      // Upsert profile in public.profiles table
      try {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email: data.user.email,
          full_name: metadata?.name,
          company_name: metadata?.companyName,
          business_type: metadata?.businessType || 'Óptica',
          country_code: metadata?.country || 'PA',
          whatsapp: metadata?.whatsapp,
          role: email.toLowerCase() === 'dubroswix@gmail.com' ? 'admin' : 'client',
          onboarding_completed: true,
        });
      } catch (e) {
        console.error('Error creating profile on register:', e);
      }

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

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!userProfile) return { success: false, error: 'No hay usuario activo' };

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'No autenticado' };

    const payload: any = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.phone !== undefined) payload.phone = data.phone;
    if (data.country !== undefined) payload.country = data.country;
    if (data.companyName !== undefined) payload.company_name = data.companyName;
    if (data.businessType !== undefined) payload.business_type = data.businessType;
    if (data.taxId !== undefined) payload.tax_id = data.taxId;
    if (data.address !== undefined) payload.address = data.address;

    const { error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', user.id);

    if (error) {
      console.error('Error updating profile in Supabase:', error);
      return { success: false, error: error.message };
    }

    setUserProfile({
      ...userProfile,
      ...data,
    });
    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userProfile, login, register, loginWithGoogle, completeOnboarding, updateProfile, logout }}>
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
