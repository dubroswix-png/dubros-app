// =============================================================================
// API Route: Contact Form → Supabase + ERP CRM Lead
// =============================================================================
// Saves the contact submission to Supabase AND creates a lead in the ERP CRM.
// The ERP lead creation is non-blocking: if it fails, the submission is still
// saved to Supabase and can be retried later.
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { erpCreateLead } from '@/lib/erp';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  return createClient(url, serviceKey);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, company, country, whatsapp, message } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !company || !whatsapp || !message) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios.' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const fullName = `${firstName} ${lastName}`;

    // 1. Save to Supabase (contact_submissions)
    const { data: submission, error: dbError } = await supabase
      .from('contact_submissions')
      .insert({
        first_name: firstName,
        last_name: lastName,
        email,
        company_name: company,
        country_name: country || 'Panamá',
        whatsapp,
        message,
        account_created: false,
        erp_synced: false,
      })
      .select('id')
      .single();

    if (dbError) {
      console.error('[Contact] Supabase error:', dbError);
      return NextResponse.json(
        { error: 'Error al guardar el mensaje. Intenta de nuevo.' },
        { status: 500 }
      );
    }

    // 2. Create Lead in ERP CRM (non-blocking — don't fail if ERP is down)
    let erpLeadId: number | null = null;
    try {
      const erpResponse = await erpCreateLead({
        nombre: fullName,
        celular: whatsapp,
        email,
        asunto: `[Web] ${company} - ${message.substring(0, 100)}`,
      });

      erpLeadId = erpResponse.response?.data?.Id || null;

      // Update Supabase record with ERP lead ID
      if (erpLeadId && submission?.id) {
        await supabase
          .from('contact_submissions')
          .update({ erp_lead_id: erpLeadId, erp_synced: true })
          .eq('id', submission.id);
      }
    } catch (erpError) {
      // Log but don't fail — the submission is already saved in Supabase
      console.warn('[Contact] ERP CRM lead creation failed (non-critical):', erpError);
    }

    return NextResponse.json({
      success: true,
      message: '¡Mensaje enviado exitosamente!',
      submissionId: submission?.id,
      erpLeadId,
    });
  } catch (error) {
    console.error('[Contact] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error inesperado. Intenta de nuevo.' },
      { status: 500 }
    );
  }
}
