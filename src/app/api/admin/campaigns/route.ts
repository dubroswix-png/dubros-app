import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface CampaignMeta {
  templateId: string;
  author: string;
  date?: string;
}

// GET: Fetch all campaigns from Supabase
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[API /campaigns GET] Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const campaigns = (data || []).map((row) => {
      let meta: CampaignMeta = { templateId: '', author: 'admin@dubros.com' };
      if (row.content) {
        try {
          meta = JSON.parse(row.content);
        } catch {
          meta = { templateId: row.content, author: 'admin@dubros.com' };
        }
      }

      return {
        id: row.id,
        name: (row.name || row.subject || 'PLANTILLA').toUpperCase().trim(),
        subject: row.subject || row.name || 'Sin Asunto',
        templateId: meta.templateId || '',
        author: meta.author || 'dubroswix@gmail.com',
        date: meta.date || (row.created_at ? new Date(row.created_at).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Reciente'),
        sent_at: row.sent_at,
        created_at: row.created_at,
      };
    });

    return NextResponse.json({ campaigns });
  } catch (err: any) {
    console.error('[API /campaigns GET] Unexpected error:', err);
    return NextResponse.json({ error: err.message || 'Error interno al cargar campañas' }, { status: 500 });
  }
}

// POST: Create a new template / campaign
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, subject, templateId, author } = body;

    if (!templateId?.trim()) {
      return NextResponse.json({ error: 'El Template ID de SendGrid es obligatorio (ej. d-xxxx).' }, { status: 400 });
    }

    const cleanName = (name || subject || 'NUEVA PLANTILLA').trim().toUpperCase();
    const cleanSubject = (subject || name || cleanName).trim();
    const cleanTemplateId = templateId.trim();
    const cleanAuthor = (author || 'dubroswix@gmail.com').trim();
    const nowFormatted = new Date().toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const contentPayload = JSON.stringify({
      templateId: cleanTemplateId,
      author: cleanAuthor,
      date: nowFormatted,
    });

    const { data, error } = await supabaseAdmin
      .from('campaigns')
      .insert({
        name: cleanName,
        subject: cleanSubject,
        content: contentPayload,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('[API /campaigns POST] Supabase insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      campaign: {
        id: data.id,
        name: data.name,
        subject: data.subject,
        templateId: cleanTemplateId,
        author: cleanAuthor,
        date: nowFormatted,
        sent_at: null,
        created_at: data.created_at,
      },
    });
  } catch (err: any) {
    console.error('[API /campaigns POST] Unexpected error:', err);
    return NextResponse.json({ error: err.message || 'Error al crear la plantilla' }, { status: 500 });
  }
}

// PUT: Update an existing campaign
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, subject, templateId, author } = body;

    if (!id) {
      return NextResponse.json({ error: 'El ID de la plantilla es obligatorio.' }, { status: 400 });
    }

    const cleanName = (name || subject || 'PLANTILLA').trim().toUpperCase();
    const cleanSubject = (subject || name || cleanName).trim();
    const cleanTemplateId = (templateId || '').trim();
    const cleanAuthor = (author || 'dubroswix@gmail.com').trim();

    const contentPayload = JSON.stringify({
      templateId: cleanTemplateId,
      author: cleanAuthor,
    });

    const { data, error } = await supabaseAdmin
      .from('campaigns')
      .update({
        name: cleanName,
        subject: cleanSubject,
        content: contentPayload,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[API /campaigns PUT] Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      campaign: {
        id: data.id,
        name: data.name,
        subject: data.subject,
        templateId: cleanTemplateId,
        author: cleanAuthor,
        sent_at: data.sent_at,
        created_at: data.created_at,
      },
    });
  } catch (err: any) {
    console.error('[API /campaigns PUT] Unexpected error:', err);
    return NextResponse.json({ error: err.message || 'Error al actualizar la plantilla' }, { status: 500 });
  }
}

// DELETE: Remove a campaign
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID de plantilla requerido en la URL (?id=...)' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('campaigns').delete().eq('id', id);

    if (error) {
      console.error('[API /campaigns DELETE] Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: any) {
    console.error('[API /campaigns DELETE] Unexpected error:', err);
    return NextResponse.json({ error: err.message || 'Error al eliminar plantilla' }, { status: 500 });
  }
}
