import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      campaignId,
      templateId,
      audience, // 'specific' | 'clients' | 'crm' | 'all'
      specificEmail,
      specificName,
      customKey,
    } = body;

    if (!templateId?.trim()) {
      return NextResponse.json(
        { error: 'El Template ID de SendGrid es obligatorio.' },
        { status: 400 }
      );
    }

    const customHeaderKey = req.headers.get('x-sendgrid-key');
    const apiKey = customKey?.trim() || customHeaderKey?.trim() || process.env.SENDGRID_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'No se ha detectado una clave de API de SendGrid (SENDGRID_API_KEY). Configúrala en el servidor o ingrésala en la ventana.',
        },
        { status: 400 }
      );
    }

    const fromEmail = process.env.SENDGRID_FROM || 'ventas@dubros.com';
    const recipients: Array<{ email: string; name: string }> = [];

    // 1. Build recipient list based on audience
    if (audience === 'specific') {
      if (!specificEmail?.trim()) {
        return NextResponse.json(
          { error: 'Por favor ingresa un correo electrónico de destino válido.' },
          { status: 400 }
        );
      }
      recipients.push({
        email: specificEmail.trim().toLowerCase(),
        name: specificName?.trim() || 'Cliente',
      });
    } else {
      // Fetch audience from database
      const [profsRes, crmRes] = await Promise.all([
        supabaseAdmin.from('profiles').select('email, full_name, company_name'),
        supabaseAdmin.from('contact_submissions').select('email, first_name, last_name, company_name'),
      ]);

      const clients = (profsRes.data || [])
        .filter((p) => p.email && p.email.includes('@') && !p.email.includes('test'))
        .map((p) => ({
          email: p.email.toLowerCase().trim(),
          name: p.full_name || p.company_name || 'Cliente',
        }));

      const crmLeads = (crmRes.data || [])
        .filter((c) => c.email && c.email.includes('@'))
        .map((c) => ({
          email: c.email.toLowerCase().trim(),
          name: `${c.first_name || ''} ${c.last_name || ''}`.trim() || c.company_name || 'Cliente',
        }));

      if (audience === 'clients') {
        recipients.push(...clients);
      } else if (audience === 'crm') {
        recipients.push(...crmLeads);
      } else {
        // 'all': combine and deduplicate
        const emailMap = new Map<string, { email: string; name: string }>();
        clients.forEach((c) => emailMap.set(c.email, c));
        crmLeads.forEach((c) => {
          if (!emailMap.has(c.email)) emailMap.set(c.email, c);
        });
        recipients.push(...emailMap.values());
      }
    }

    if (recipients.length === 0) {
      return NextResponse.json(
        { error: 'No se encontraron destinatarios válidos para esta audiencia.' },
        { status: 400 }
      );
    }

    // 2. Batch dispatch in chunks of up to 1000 personalizations (SendGrid v3 limit)
    const BATCH_SIZE = 1000;
    let totalSent = 0;
    const errors: string[] = [];

    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      const chunk = recipients.slice(i, i + BATCH_SIZE);

      const personalizations = chunk.map((r) => ({
        to: [{ email: r.email, name: r.name }],
        dynamic_template_data: {
          name: r.name,
          client_name: r.name,
          email: r.email,
          date: new Date().toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }),
          company: 'Dubros Eyewear',
        },
      }));

      const sendgridPayload = {
        personalizations,
        from: {
          email: fromEmail,
          name: 'Dubros Eyewear',
        },
        template_id: templateId.trim(),
      };

      try {
        const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey.trim()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(sendgridPayload),
        });

        if (res.ok || res.status === 202) {
          totalSent += chunk.length;
        } else {
          const errText = await res.text();
          console.error('[SendGrid Batch Error]:', res.status, errText);
          let friendlyMsg = errText;
          try {
            const parsed = JSON.parse(errText);
            const rawMsg = parsed.errors?.[0]?.message || '';
            if (rawMsg.toLowerCase().includes('authorization grant is invalid') || res.status === 401) {
              friendlyMsg = 'La clave API de SendGrid no es válida, expiró o fue revocada. Por favor ingresa una API Key activa de SendGrid en el Dashboard o actualízala en Vercel.';
            } else if (rawMsg) {
              friendlyMsg = rawMsg;
            }
          } catch {
            if (errText.toLowerCase().includes('authorization grant is invalid') || res.status === 401) {
              friendlyMsg = 'La clave API de SendGrid no es válida, expiró o fue revocada. Por favor ingresa una API Key activa de SendGrid en el Dashboard o actualízala en Vercel.';
            }
          }
          errors.push(`Error en lote ${Math.floor(i / BATCH_SIZE) + 1}: ${friendlyMsg}`);
        }
      } catch (err: any) {
        console.error('[SendGrid Batch Network Error]:', err);
        errors.push(`Error de conexión en lote ${Math.floor(i / BATCH_SIZE) + 1}: ${err.message}`);
      }
    }

    // 3. If campaignId was provided and at least one email sent, update sent_at in Supabase
    if (campaignId && totalSent > 0) {
      await supabaseAdmin
        .from('campaigns')
        .update({ sent_at: new Date().toISOString() })
        .eq('id', campaignId);
    }

    if (totalSent === 0 && errors.length > 0) {
      return NextResponse.json(
        { error: `No se pudo enviar la campaña: ${errors.join(', ')}` },
        { status: 500 }
      );
    }

    const audienceLabel =
      audience === 'specific'
        ? `a ${recipients[0].email}`
        : audience === 'clients'
        ? `a los Clientes Registrados (${totalSent} enviados)`
        : audience === 'crm'
        ? `a los Contactos del CRM (${totalSent} enviados)`
        : `a Todos los usuarios y CRM (${totalSent} enviados)`;

    return NextResponse.json({
      success: true,
      sentCount: totalSent,
      totalRecipients: recipients.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `¡Campaña enviada exitosamente ${audienceLabel}!`,
    });
  } catch (err: any) {
    console.error('[Campaign Send Bulk API Error]:', err);
    return NextResponse.json(
      { error: err.message || 'Error inesperado al despachar la campaña.' },
      { status: 500 }
    );
  }
}
