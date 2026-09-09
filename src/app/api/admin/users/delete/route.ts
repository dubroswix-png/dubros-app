import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const ADMIN_EMAILS = [
  'dubroswix@gmail.com',
  'dfduqu01@gmail.com',
];

const MANAGER_EMAILS = [
  'yorgelis.t7@hotmail.com',
  'ventas@dubros.com',
  'ventasfrancisco@dubros.com',
];

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  return createClient(url, serviceKey);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, requesterEmail } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'El ID de usuario es obligatorio.' },
        { status: 400 }
      );
    }

    const cleanRequester = (requesterEmail || '').toLowerCase().trim();
    const supabaseAdmin = getSupabaseAdmin();

    // 1. Check permissions (Admins and Managers can delete clients)
    let isAuthorized = ADMIN_EMAILS.includes(cleanRequester) || MANAGER_EMAILS.includes(cleanRequester);

    if (!isAuthorized && cleanRequester) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .ilike('email', cleanRequester)
        .maybeSingle();

      if (profile && (profile.role === 'admin' || profile.role === 'manager' || profile.role === 'gerente')) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Permiso denegado. Se requieren permisos de Administrador o Gerente para eliminar usuarios.' },
        { status: 403 }
      );
    }

    // 2. Handle Mock/Bubble users that are not real UUIDs
    const isUuid = UUID_REGEX.test(userId);
    if (!isUuid) {
      // Mock users live in bubble_users.json on the frontend, removing from state is enough
      return NextResponse.json({
        success: true,
        message: 'Usuario simulado eliminado del listado.',
      });
    }

    // 3. Security check: Protect main admin accounts from deletion
    const { data: targetProfile } = await supabaseAdmin
      .from('profiles')
      .select('email, role')
      .eq('id', userId)
      .maybeSingle();

    if (targetProfile?.email && ADMIN_EMAILS.includes(targetProfile.email.toLowerCase().trim())) {
      return NextResponse.json(
        { error: 'No está permitido eliminar las cuentas principales de Administrador.' },
        { status: 400 }
      );
    }

    // 4. Safe foreign key unlinking (orders, etc.)
    try {
      await supabaseAdmin
        .from('orders')
        .update({ user_id: null })
        .eq('user_id', userId);
    } catch (orderErr) {
      console.warn('[AdminDeleteUser] Could not unlink orders:', orderErr);
    }

    // 5. Delete from public.profiles
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      console.warn('[AdminDeleteUser] Warning deleting profile:', profileError);
    }

    // 6. Delete from auth.users (Supabase Auth)
    try {
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (authError && !authError.message?.toLowerCase().includes('not found')) {
        console.warn('[AdminDeleteUser] Warning deleting auth user:', authError);
      }
    } catch (authCatchErr: any) {
      console.warn('[AdminDeleteUser] Catch deleting auth user:', authCatchErr?.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Usuario eliminado permanentemente del sistema.',
    });
  } catch (err: any) {
    console.error('[AdminDeleteUser] Unexpected error:', err);
    return NextResponse.json(
      { error: err?.message || 'Error del servidor al eliminar usuario.' },
      { status: 500 }
    );
  }
}
