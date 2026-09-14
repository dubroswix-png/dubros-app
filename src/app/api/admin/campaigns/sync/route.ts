import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET: Fetch templates from SendGrid account
export async function GET(req: NextRequest) {
  try {
    const customKey = req.headers.get('x-sendgrid-key') || req.nextUrl.searchParams.get('apiKey');
    const apiKey = customKey?.trim() || process.env.SENDGRID_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Ingresa tu clave de API de SendGrid para consultar las plantillas en vivo.' },
        { status: 400 }
      );
    }

    const res = await fetch('https://api.sendgrid.com/v3/templates?generations=dynamic', {
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: `SendGrid respondió con error (${res.status}): ${errText}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    const templates = (data.templates || []).map((tpl: any) => {
      const activeVersion = tpl.versions?.find((v: any) => v.active === 1) || tpl.versions?.[0];
      return {
        id: tpl.id,
        name: (tpl.name || 'Sin nombre').toUpperCase(),
        subject: activeVersion?.subject || tpl.name || 'Sin Asunto',
        updated_at: activeVersion?.updated_at || tpl.updated_at,
      };
    });

    return NextResponse.json({ templates });
  } catch (err: any) {
    console.error('[SendGrid Templates Sync Error]:', err);
    return NextResponse.json(
      { error: err.message || 'Error al conectar con la API de SendGrid.' },
      { status: 500 }
    );
  }
}

// POST: Import template from SendGrid into Supabase
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { templateId, name, subject, author } = body;

    if (!templateId?.trim()) {
      return NextResponse.json({ error: 'El Template ID es obligatorio.' }, { status: 400 });
    }

    const cleanName = (name || subject || 'PLANTILLA').toUpperCase().trim();
    const cleanSubject = (subject || name || cleanName).trim();
    const cleanAuthor = (author || 'dubroswix@gmail.com').trim();
    const dateFormatted = new Date().toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const { data, error } = await supabaseAdmin
      .from('campaigns')
      .insert({
        name: cleanName,
        subject: cleanSubject,
        content: JSON.stringify({
          templateId: templateId.trim(),
          author: cleanAuthor,
          date: dateFormatted,
        }),
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      campaign: {
        id: data.id,
        name: data.name,
        subject: data.subject,
        templateId: templateId.trim(),
        author: cleanAuthor,
        date: dateFormatted,
        sent_at: null,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error al importar plantilla.' }, { status: 500 });
  }
}
