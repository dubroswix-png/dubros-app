import { supabase } from '@/lib/supabase';
import { UserRole } from '@/context/AuthContext';

export interface UserProfileRecord {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  full_name?: string;
  phone?: string;
  country?: string;
  company_name?: string;
  business_type?: string;
  tax_id?: string;
  address?: string;
  created_at?: string;
  erp_client_id?: number | null;
  erp_client_code?: string | null;
  client_code?: string | null;
}

import bubbleUsers from '@/data/bubble_users.json';
import { isUserAdmin } from '@/context/AuthContext';

export const MOCK_ADMIN_USERS: UserProfileRecord[] = (bubbleUsers as any[]).map((u) => ({
  id: u.id,
  email: u.email,
  name: u.full_name || u.email.split('@')[0],
  company_name: u.company_name || (u.client_code ? `Cliente #${u.client_code}` : 'Óptica / Distribuidor'),
  country: u.country_code || 'PA',
  business_type: u.business_type || 'Óptica',
  role: isUserAdmin(u.email) ? 'admin' : 'client',
  erp_client_id: u.client_code ? Number(u.client_code) : null,
  erp_client_code: u.client_code || null,
  client_code: u.client_code || null,
  created_at: '2026-01-15T10:00:00Z',
}));

export async function fetchAllProfiles(): Promise<UserProfileRecord[]> {
  try {
    const { data: dbProfiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !dbProfiles || dbProfiles.length === 0) {
      return MOCK_ADMIN_USERS;
    }

    const dbEmails = new Set(dbProfiles.map((p) => p.email.toLowerCase()));
    const missingMocks = MOCK_ADMIN_USERS.filter((m) => !dbEmails.has(m.email.toLowerCase()));

    const all = [...dbProfiles, ...missingMocks].map((p) => ({
      ...p,
      name: p.full_name || p.name || p.email.split('@')[0],
      role: isUserAdmin(p.email) ? 'admin' : (p.role || 'client'),
    }));

    return all as UserProfileRecord[];
  } catch (e) {
    console.error('Error fetching profiles:', e);
    return MOCK_ADMIN_USERS;
  }
}

export async function updateUserRole(
  userId: string,
  newRole: UserRole
): Promise<{ success: boolean; error?: string }> {
  try {
    // If it's a mock user ID, simulate success
    if (userId.startsWith('mock-')) {
      return { success: true };
    }

    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      console.error('Error updating role in Supabase:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (e: any) {
    console.error('Error in updateUserRole:', e);
    return { success: false, error: e?.message || 'Error al actualizar el rol del usuario.' };
  }
}
