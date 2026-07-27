// =============================================================================
// API Route: Validate & Link Client with ERP (Switch-Soft)
// =============================================================================
// Admin endpoint that searches for a B2B client in the ERP by email or tax ID.
// If found, saves the ERP client ID, code, and vendor ID to the Supabase profile.
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { erpFindClient } from '@/lib/erp';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  return createClient(url, serviceKey);
}

// Verify admin authorization
async function isAdmin(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return false;

  const token = authHeader.replace('Bearer ', '');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return false;

  const adminSupabase = getSupabaseAdmin();
  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return profile?.role === 'admin';
}

export async function POST(request: NextRequest) {
  try {
    const admin = await isAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores pueden validar clientes.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, email, taxId } = body;

    if (!userId || (!email && !taxId)) {
      return NextResponse.json(
        { error: 'Se requiere userId y al menos un email o RUC/tax_id para buscar en el ERP.' },
        { status: 400 }
      );
    }

    // 1. Search for client in Switch-Soft ERP
    const erpClient = await erpFindClient({
      email: email || undefined,
      identificacion: taxId || undefined,
    });

    if (!erpClient) {
      return NextResponse.json({
        success: true,
        matched: false,
        message: 'No se encontró un cliente en el ERP que coincida con ese correo o identificación fiscal.',
      });
    }

    // 2. Client matched! Update Supabase profile with ERP linkage
    const supabase = getSupabaseAdmin();
    const { error: dbError } = await supabase
      .from('profiles')
      .update({
        erp_client_id: erpClient.id,
        erp_client_code: erpClient.codigo,
        erp_vendor_id: erpClient.vendedorId,
      })
      .eq('id', userId);

    if (dbError) {
      console.error('[Validate Client] DB update error:', dbError);
      return NextResponse.json(
        { error: 'El cliente se encontró en el ERP pero hubo un error actualizando la base de datos local.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      matched: true,
      message: `Cliente vinculado exitosamente con ERP: Código ${erpClient.codigo} (${erpClient.nombre})`,
      erpClient: {
        id: erpClient.id,
        codigo: erpClient.codigo,
        nombre: erpClient.nombre,
        email: erpClient.email,
        identificacion: erpClient.identificacion,
        vendedorId: erpClient.vendedorId,
        vendedor: erpClient.vendedor,
      },
    });
  } catch (error) {
    console.error('[Validate Client] Unexpected error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al validar cliente contra ERP.' },
      { status: 500 }
    );
  }
}
