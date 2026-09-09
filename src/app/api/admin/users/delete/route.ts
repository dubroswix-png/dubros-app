import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ADMIN_EMAILS } from '@/context/AuthContext';

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

    // Security check: Only Admin can delete users (Managers cannot delete users)
    const isAdmin = requesterEmail && ADMIN_EMAILS.includes(requesterEmail.toLowerCase().trim());
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Permiso denegado. Solo el Administrador principal puede eliminar usuarios.' },
        { status: 403 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    // 1. Delete from public.profiles
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      console.warn('[AdminDeleteUser] Warning deleting profile:', profileError);
    }

    // 2. Delete from auth.users
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authError && !authError.message?.toLowerCase().includes('not found')) {
      console.error('[AdminDeleteUser] Error deleting auth user:', authError);
      return NextResponse.json(
        { error: authError.message || 'Error al eliminar usuario de autenticación.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Usuario eliminado permanentemente del sistema.',
    });
  } catch (err: any) {
    console.error('[AdminDeleteUser] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Error del servidor al eliminar usuario.' },
      { status: 500 }
    );
  }
}
