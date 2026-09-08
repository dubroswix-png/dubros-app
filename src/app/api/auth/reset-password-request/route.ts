import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/mailer';

export const ADMIN_RECOVERY_EMAIL = 'dubroswix@gmail.com';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  return createClient(url, serviceKey);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const targetEmail = body.email?.trim().toLowerCase();

    if (!targetEmail || !targetEmail.includes('@')) {
      return NextResponse.json(
        { error: 'Por favor ingresa un correo electrónico válido.' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    const origin = req.nextUrl.origin || 'https://dubros-app.vercel.app';

    // 1. Generate secure password recovery link for targetEmail
    let { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: targetEmail,
      options: {
        redirectTo: `${origin}/reset-password`,
      },
    });

    if (linkError || !linkData?.properties?.action_link) {
      console.warn('[ResetPasswordRequest] Initial link generation failed, checking profiles:', linkError?.message);
      // Check if user exists in public.profiles table
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id, email')
        .ilike('email', targetEmail)
        .maybeSingle();

      if (profile?.email) {
        // Fetch complete profile before deleting to avoid trigger duplicate email collision
        const { data: fullProfile } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('id', profile.id)
          .single();

        if (fullProfile) {
          await supabaseAdmin.from('profiles').delete().eq('id', fullProfile.id);

          // Provision user in auth.users
          const { data: newAuthUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
            email: fullProfile.email,
            email_confirm: true,
            password: 'DubrosRecoveryTemp2026!',
          });

          if (!createErr && newAuthUser?.user) {
            // Restore complete profile data under the new authenticated ID
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
            }).eq('id', newAuthUser.user.id);

            // Retry generating recovery link
            const retry = await supabaseAdmin.auth.admin.generateLink({
              type: 'recovery',
              email: fullProfile.email,
              options: {
                redirectTo: `${origin}/reset-password`,
              },
            });
            linkData = retry.data;
            linkError = retry.error;
          } else {
            // If createUser failed, restore original profile
            await supabaseAdmin.from('profiles').insert(fullProfile);
          }
        }
      }
    }

    if (linkError || !linkData?.properties?.action_link) {
      console.error('[ResetPasswordRequest] Supabase link generation error:', linkError);
      return NextResponse.json(
        { error: linkError?.message || 'No se encontró un usuario registrado con este correo electrónico.' },
        { status: 404 }
      );
    }

    const actionLink = linkData.properties.action_link;

    // 2. Build email template specifically addressed to dubroswix@gmail.com
    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #F8FAFC; border-radius: 12px; color: #1E293B;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="font-size: 24px; font-weight: 800; color: #0F172A; margin: 0;">DUBROS B2B</h1>
          <p style="font-size: 13px; color: #64748B; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.05em;">Solicitud de Actualización de Contraseña</p>
        </div>

        <div style="background-color: #FFFFFF; border-radius: 10px; padding: 24px; border: 1px solid #E2E8F0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <p style="font-size: 15px; line-height: 1.6; margin-top: 0;">
            Hola <strong>Equipo Dubros</strong>,
          </p>
          <p style="font-size: 15px; line-height: 1.6;">
            Se ha solicitado actualizar la contraseña de acceso para la cuenta del cliente:
          </p>
          <div style="background-color: #EFF6FF; border-left: 4px solid #1864F6; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
            <span style="font-size: 13px; color: #1E40AF; display: block; font-weight: 600;">Cuenta solicitante:</span>
            <strong style="font-size: 16px; color: #0F172A;">${targetEmail}</strong>
          </div>

          <p style="font-size: 14px; line-height: 1.6; color: #475569;">
            Haz clic en el siguiente botón para abrir la pantalla de restablecimiento y definir la nueva contraseña para este usuario:
          </p>

          <div style="text-align: center; margin: 28px 0;">
            <a href="${actionLink}" style="background-color: #1864F6; color: #FFFFFF; padding: 14px 28px; font-size: 15px; font-weight: 700; text-decoration: none; border-radius: 8px; display: inline-block; box-shadow: 0 4px 12px rgba(24, 100, 246, 0.35);">
              🔑 Actualizar Contraseña para ${targetEmail}
            </a>
          </div>

          <p style="font-size: 12px; color: #94A3B8; margin-bottom: 6px;">
            Si el botón no funciona, copia y pega este enlace directo en tu navegador:
          </p>
          <p style="font-size: 11px; word-break: break-all; color: #64748B; background-color: #F1F5F9; padding: 10px; border-radius: 6px; margin-top: 0;">
            ${actionLink}
          </p>
        </div>

        <div style="text-align: center; margin-top: 24px; font-size: 12px; color: #94A3B8;">
          © ${new Date().getFullYear()} Dubros B2B Panamá • Este enlace es de un solo uso y caduca automáticamente.
        </div>
      </div>
    `;

    // 3. Send email to dubroswix@gmail.com
    const emailResult = await sendEmail({
      to: ADMIN_RECOVERY_EMAIL,
      subject: `🔑 Actualizar Contraseña: ${targetEmail} | Dubros B2B`,
      html: emailHtml,
      text: `Solicitud de actualización de contraseña para: ${targetEmail}. Enlace: ${actionLink}`,
    });

    console.log(`[ResetPasswordRequest] Recovery link for ${targetEmail} dispatched to ${ADMIN_RECOVERY_EMAIL}. Result:`, emailResult);

    return NextResponse.json({
      success: true,
      email: targetEmail,
      sentTo: ADMIN_RECOVERY_EMAIL,
      provider: emailResult.provider || 'system',
      actionLink, // Accessible for admin dashboard quick copy
      message: `El enlace de actualización para "${targetEmail}" ha sido generado y enviado a ${ADMIN_RECOVERY_EMAIL}.`,
    });
  } catch (err: any) {
    console.error('[ResetPasswordRequest] Unexpected error:', err);
    return NextResponse.json(
      { error: err.message || 'Error al procesar la solicitud de contraseña.' },
      { status: 500 }
    );
  }
}
