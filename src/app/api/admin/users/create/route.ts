import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { name, email, password, companyName, country, whatsapp, role, erpClientCode } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña son obligatorios.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres.' }, { status: 400 });
    }

    // 1. Create auth user with confirmed email so they can log in immediately
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: name,
        company_name: companyName,
        whatsapp,
      },
    });

    if (authError) {
      let msg = authError.message;
      if (msg.includes('already registered') || msg.includes('already exists')) {
        msg = 'Este correo electrónico ya se encuentra registrado.';
      }
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const userId = authData.user.id;

    // 2. Insert or update profile in public.profiles table
    const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
      id: userId,
      email,
      full_name: name || email.split('@')[0],
      company_name: companyName || name || 'Óptica / Cliente',
      business_type: 'Óptica',
      country_code: country || 'PA',
      whatsapp: whatsapp || '',
      role: role || 'client',
      erp_client_code: erpClientCode || null,
      onboarding_completed: true,
    }, { onConflict: 'id' });

    if (profileError) {
      console.error('Profile upsert warning:', profileError);
    }

    return NextResponse.json({
      success: true,
      message: `Usuario ${email} creado exitosamente.`,
      user: { id: userId, email, role },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno del servidor.' }, { status: 500 });
  }
}
