import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { name, email, password, companyName, country, whatsapp, role, erpClientCode, birthDate } = await req.json();

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
        birth_date: birthDate || null,
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

    const cleanCode = (erpClientCode || '').trim() || null;
    const numCode = cleanCode && !isNaN(Number(cleanCode)) ? Number(cleanCode) : null;

    // 2. Insert or update profile in public.profiles table
    const profileData: Record<string, any> = {
      id: userId,
      email,
      full_name: name || email.split('@')[0],
      company_name: companyName || name || 'Óptica / Cliente',
      business_type: 'Óptica',
      country_code: country || 'PA',
      whatsapp: whatsapp || '',
      role: role || 'client',
      erp_client_code: cleanCode,
      client_code: cleanCode,
      erp_client_id: numCode,
      onboarding_completed: true,
      birth_date: birthDate || null,
    };

    let { error: profileError } = await supabaseAdmin.from('profiles').upsert(profileData, { onConflict: 'id' });

    if (profileError && profileError.message.includes('birth_date')) {
      delete profileData.birth_date;
      const retry = await supabaseAdmin.from('profiles').upsert(profileData, { onConflict: 'id' });
      profileError = retry.error;
    }

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
