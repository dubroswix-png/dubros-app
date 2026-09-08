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
      const { data: fullProfile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (fullProfile?.email) {
        await supabaseAdmin.from('profiles').delete().eq('id', fullProfile.id);

        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: fullProfile.email,
          password: newPassword,
          email_confirm: true,
        });

        if (!createError && newUser?.user) {
          await supabaseAdmin.from('profiles').update({
            full_name: fullProfile.full_name,
            company_name: fullProfile.company_name,
            business_type: fullProfile.business_type,
            country_code: fullProfile.country_code,
            whatsapp: fullProfile.whatsapp,
            role: fullProfile.role || 'client',
            erp_client_id: fullProfile.erp_client_id,
            erp_client_code: fullProfile.erp_client_code,
            client_code: fullProfile.client_code,
            tax_id: fullProfile.tax_id,
            address: fullProfile.address,
            onboarding_completed: fullProfile.onboarding_completed,
          }).eq('id', newUser.user.id);

          return NextResponse.json({
            success: true,
            message: `Usuario aprovisionado y contraseña actualizada con éxito para ${fullProfile.email}.`,
          });
        } else {
          await supabaseAdmin.from('profiles').insert(fullProfile);
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
