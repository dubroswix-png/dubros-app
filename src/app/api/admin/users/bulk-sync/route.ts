import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { users } = await req.json();

    if (!users || !Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        { error: 'Se requiere una lista de usuarios con email y contraseña.' },
        { status: 400 }
      );
    }

    let createdCount = 0;
    let updatedCount = 0;
    const errors: Array<{ email: string; error: string }> = [];

    for (const item of users) {
      const email = (item.email || item.correo || '').toLowerCase().trim();
      const password = String(item.password || item.contraseña || item.clave || '').trim();
      const name = (item.name || item.nombre || item.fullName || email.split('@')[0] || '').trim();
      const company = (item.company || item.empresa || item.companyName || name || 'Óptica / Cliente').trim();
      const country = (item.country || item.pais || 'PA').trim().toUpperCase();
      const whatsapp = (item.whatsapp || item.telefono || item.phone || '').trim();
      const erpCode = (item.erpCode || item.codigo || item.erpClientCode || null);
      const role = (item.role || item.rol || 'client');

      if (!email || !password) {
        errors.push({ email: email || 'Desconocido', error: 'Falta correo o contraseña.' });
        continue;
      }

      if (password.length < 6) {
        errors.push({ email, error: 'La contraseña debe tener al menos 6 caracteres.' });
        continue;
      }

      try {
        // Step 1: Try creating new user in Supabase Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            full_name: name,
            company_name: company,
            whatsapp,
          },
        });

        let userId = authData?.user?.id;

        // Step 2: If user already exists in auth, update their password and confirm their email
        if (authError) {
          if (authError.message.includes('already') || authError.message.includes('exists')) {
            const { data: existingProfile } = await supabaseAdmin
              .from('profiles')
              .select('id')
              .eq('email', email)
              .maybeSingle();

            if (existingProfile?.id) {
              userId = existingProfile.id;
            } else {
              const { data: userList } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
              const found = userList?.users?.find((u) => u.email?.toLowerCase() === email);
              if (found) {
                userId = found.id;
              }
            }

            if (userId) {
              const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
                password,
                email_confirm: true,
                user_metadata: {
                  full_name: name,
                  company_name: company,
                  whatsapp,
                },
              });

              if (updateError) {
                errors.push({ email, error: `Error al actualizar contraseña: ${updateError.message}` });
                continue;
              }
              updatedCount++;
            } else {
              errors.push({ email, error: 'Usuario existe en Auth pero no se pudo localizar su ID.' });
              continue;
            }
          } else {
            errors.push({ email, error: authError.message });
            continue;
          }
        } else {
          createdCount++;
        }

        // Step 3: Upsert profile metadata
        if (userId) {
          await supabaseAdmin.from('profiles').upsert(
            {
              id: userId,
              email,
              full_name: name,
              company_name: company,
              business_type: 'Óptica',
              country_code: country,
              whatsapp,
              role,
              erp_client_code: erpCode,
              onboarding_completed: true,
            },
            { onConflict: 'id' }
          );
        }
      } catch (userErr: any) {
        errors.push({ email, error: userErr.message || 'Error inesperado.' });
      }
    }

    return NextResponse.json({
      success: true,
      total: users.length,
      createdCount,
      updatedCount,
      errorsCount: errors.length,
      errors,
      message: `Procesamiento completado: ${createdCount} creados, ${updatedCount} actualizados, ${errors.length} con advertencias.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno del servidor.' }, { status: 500 });
  }
}
