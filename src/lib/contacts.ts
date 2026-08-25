import { supabase } from '@/lib/supabase';
import bubbleContacts from '@/data/bubble_contacts.json';

export interface ContactSubmission {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  company: string;
  email: string;
  phone: string;
  message: string;
  accountCreated: boolean;
  status: string;
  createdAt?: string;
}

export const FALLBACK_CONTACTS: ContactSubmission[] = bubbleContacts as ContactSubmission[];

export async function getContactSubmissions(): Promise<ContactSubmission[]> {
  try {
    const { data, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return FALLBACK_CONTACTS;
    }

    return data.map((c) => ({
      id: c.id,
      firstName: c.first_name || '',
      lastName: c.last_name || '',
      fullName: `${c.first_name || ''} ${c.last_name || ''}`.trim() || c.email || 'Contacto B2B',
      company: c.company_name || 'N/A',
      email: c.email || '',
      phone: c.whatsapp || '',
      message: c.message || '',
      accountCreated: c.account_created || false,
      status: c.account_created ? 'aprobado' : 'pendiente',
      createdAt: c.created_at,
    }));
  } catch (e) {
    console.error('[getContactSubmissions] Error:', e);
    return FALLBACK_CONTACTS;
  }
}
