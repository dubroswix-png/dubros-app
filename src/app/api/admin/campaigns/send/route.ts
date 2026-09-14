import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { campaignId, templateId, recipientEmail, recipientName, customKey } = body;

    if (!templateId?.trim()) {
      return NextResponse.json(
        { error: 'El Template ID de SendGrid es obligatorio.' },
        { status: 400 }
      );
    }

    if (!recipientEmail?.trim()) {
      return NextResponse.json(
        { error: 'El correo electrónico del destinatario es obligatorio.' },
        { status: 400 }
      );
    }

    const apiKey = customKey?.trim() || process.env.SENDGRID_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'No se ha detectado una clave de API de SendGrid (SENDGRID_API_KEY). Puedes ingresarla directamente en la ventana de envío para guardarla.',
          requiresApiKey: true,
        },
        { status: 400 }
      );
    }

    // Call SendGrid v3 Mail Send
    const fromEmail = process.env.SENDGRID_FROM || 'dubroswix@gmail.com';
    const cleanEmail = recipientEmail.trim();
    const cleanName = recipientName?.trim() || 'Cliente';

    const sendgridPayload = {
      personalizations: [
        {
          to: [
            {
              email: cleanEmail,
              name: cleanName,
            },
          ],
          dynamic_template_data: {
            name: cleanName,
            client_name: cleanName,
            email: cleanEmail,
            date: new Date().toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            }),
            company: 'Dubros Eyewear',
          },
        },
      ],
      from: {
        email: fromEmail,
        name: 'Dubros Eyewear',
      },
      template_id: templateId.trim(),
    };

    const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sendgridPayload),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[SendGrid Send Error]:', res.status, errText);
      let parsedError = errText;
      try {
        const jsonErr = JSON.parse(errText);
        parsedError = jsonErr.errors?.[0]?.message || errText;
      } catch {
        // fallback
      }
      return NextResponse.json(
        {
          error: `Error de SendGrid (${res.status}): ${parsedError}`,
        },
        { status: res.status }
      );
    }

    // If campaignId was provided, update sent_at in Supabase
    if (campaignId) {
      await supabaseAdmin
        .from('campaigns')
        .update({ sent_at: new Date().toISOString() })
        .eq('id', campaignId);
    }

    return NextResponse.json({
      success: true,
      message: `¡Correo enviado exitosamente a ${cleanEmail} utilizando la plantilla de SendGrid!`,
    });
  } catch (err: any) {
    console.error('[Campaign Send API Error]:', err);
    return NextResponse.json(
      { error: err.message || 'Error inesperado al enviar el correo a través de SendGrid.' },
      { status: 500 }
    );
  }
}
