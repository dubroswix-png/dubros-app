import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const audienceType = searchParams.get('type') || 'all'; // 'clients' | 'crm' | 'all'
    const search = (searchParams.get('search') || '').toLowerCase().trim();
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '20', 10));

    // 1. Query registered clients from profiles
    const { data: profs } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, company_name');

    interface RecipientItem {
      id: string;
      email: string;
      name: string;
      company: string;
      type: 'client' | 'crm';
    }

    const clients: RecipientItem[] = (profs || [])
      .filter((p) => p.email && p.email.includes('@') && !p.email.includes('test'))
      .map((p) => ({
        id: p.id,
        email: p.email.toLowerCase().trim(),
        name: p.full_name || p.company_name || 'Cliente Registrado',
        company: p.company_name || '',
        type: 'client',
      }));

    // 2. Query CRM leads from contact_submissions
    const { data: crm } = await supabaseAdmin
      .from('contact_submissions')
      .select('id, email, first_name, last_name, company_name');

    const crmLeads: RecipientItem[] = (crm || [])
      .filter((c) => c.email && c.email.includes('@'))
      .map((c) => ({
        id: c.id,
        email: c.email.toLowerCase().trim(),
        name: `${c.first_name || ''} ${c.last_name || ''}`.trim() || c.company_name || 'Contacto CRM',
        company: c.company_name || '',
        type: 'crm',
      }));

    // 3. Combine and deduplicate for 'all'
    const emailMap = new Map<string, RecipientItem>();
    clients.forEach((c) => emailMap.set(c.email, c));
    crmLeads.forEach((c) => {
      if (!emailMap.has(c.email)) {
        emailMap.set(c.email, c);
      }
    });

    const allRecipients: RecipientItem[] = Array.from(emailMap.values());

    const counts = {
      clients: clients.length,
      crm: crmLeads.length,
      all: allRecipients.length,
    };

    // 4. Select base list according to audienceType
    let baseList: RecipientItem[] = allRecipients;
    if (audienceType === 'clients') {
      baseList = clients;
    } else if (audienceType === 'crm') {
      baseList = crmLeads;
    }

    // 5. Filter by search if present
    if (search) {
      baseList = baseList.filter(
        (r) =>
          r.email.includes(search) ||
          r.name.toLowerCase().includes(search) ||
          r.company.toLowerCase().includes(search)
      );
    }

    // Sort alphabetically by email
    baseList.sort((a, b) => a.email.localeCompare(b.email));

    // 6. Paginate
    const totalFiltered = baseList.length;
    const totalPages = Math.ceil(totalFiltered / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginated = baseList.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      recipients: paginated,
      counts,
      pagination: {
        page,
        limit,
        totalPages,
        totalFiltered,
      },
    });
  } catch (err: any) {
    console.error('[Campaign Recipients API Error]:', err);
    return NextResponse.json(
      { error: err.message || 'Error al obtener lista de destinatarios' },
      { status: 500 }
    );
  }
}
