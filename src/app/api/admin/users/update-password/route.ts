import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  return createClient(url, serviceKey);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, newPassword } = body;

    if (!userId || !newPassword) {
      return NextResponse.json(
        { error: 'El ID de usuario y la nueva contraseña son obligatorios.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres.' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword,
    });

    if (error) {
      console.warn('[AdminUpdatePassword] updateUserById error, attempting to create auth user:', error.message);
      // If user exists in public.profiles but not yet in auth.users, provision them now
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id, email')
        .eq('id', userId)
        .maybeSingle();

      if (profile?.email) {
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          id: profile.id,
          email: profile.email,
          password: newPassword,
          email_confirm: true,
        });

        if (!createError && newUser?.user) {
          return NextResponse.json({
            success: true,
            message: `Usuario aprovisionado y contraseña actualizada con éxito para ${profile.email}.`,
          });
        }
      }

      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Contraseña actualizada con éxito para ${data.user?.email || 'el usuario'}.`,
    });
  } catch (err: any) {
    console.error('[AdminUpdatePassword] Unexpected error:', err);
    return NextResponse.json({ error: 'Error del servidor al actualizar contraseña.' }, { status: 500 });
  }
}
