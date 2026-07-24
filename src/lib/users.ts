import { supabase } from '@/lib/supabase';
import { UserRole } from '@/context/AuthContext';

export interface UserProfileRecord {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  phone?: string;
  country?: string;
  company_name?: string;
  business_type?: string;
  created_at?: string;
}

export const MOCK_ADMIN_USERS: UserProfileRecord[] = [
  {
    id: 'mock-u1',
    name: 'Dubros SuperAdmin',
    email: 'dubroswix@gmail.com',
    company_name: 'Dubros Optical Corp',
    country: 'Panamá 🇵🇦',
    business_type: 'Distribuidor Principal',
    role: 'admin',
    phone: '+507 6000-0000',
    created_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'mock-u2',
    name: 'Juan David Duque',
    email: 'duque.jdavid@gmail.com',
    company_name: 'Óptica Visión del Istmo',
    country: 'Panamá 🇵🇦',
    business_type: 'Óptica Independiente',
    role: 'pending',
    phone: '+507 6234-5678',
    created_at: '2026-07-23T14:30:00Z',
  },
  {
    id: 'mock-u3',
    name: 'Ana Sophia Hernández',
    email: 'anasophia7@hotmail.com',
    company_name: 'Leroptic Óptica Boutique',
    country: 'Ecuador 🇪🇨',
    business_type: 'Óptica Independiente',
    role: 'client',
    phone: '+593 984930134',
    created_at: '2026-06-10T12:00:00Z',
  },
  {
    id: 'mock-u4',
    name: 'María Ramon',
    email: 'ramonmin2@gmail.com',
    company_name: 'Megavision Óptica',
    country: 'Guatemala 🇬🇹',
    business_type: 'Cadena de Ópticas',
    role: 'client',
    phone: '+502 42973711',
    created_at: '2026-05-20T09:15:00Z',
  },
  {
    id: 'mock-u5',
    name: 'Erika Maria Serrano',
    email: 'erikamas2018@gmail.com',
    company_name: 'Centro Óptico Cartagena',
    country: 'Colombia 🇨🇴',
    business_type: 'Distribuidor Óptico',
    role: 'client',
    phone: '+57 3157039704',
    created_at: '2026-04-12T16:45:00Z',
  },
];

export async function fetchAllProfiles(): Promise<UserProfileRecord[]> {
  try {
    const { data: dbProfiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !dbProfiles || dbProfiles.length === 0) {
      return MOCK_ADMIN_USERS;
    }

    // Merge mock profiles with database profiles (avoiding duplicates by email)
    const dbEmails = new Set(dbProfiles.map((p) => p.email.toLowerCase()));
    const missingMocks = MOCK_ADMIN_USERS.filter((m) => !dbEmails.has(m.email.toLowerCase()));

    return [...dbProfiles, ...missingMocks] as UserProfileRecord[];
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
