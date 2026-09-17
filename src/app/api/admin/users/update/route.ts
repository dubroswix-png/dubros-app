import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  return createClient(url, serviceKey);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      userId,
      name,
      email,
      companyName,
      country,
      whatsapp,
      role,
      erpClientCode,
      businessType,
      taxId,
      address,
      birthDate,
    } = body;

    if (!userId) {
      return NextResponse.json({ error: 'El ID de usuario es obligatorio.' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const cleanEmail = email ? email.trim().toLowerCase() : null;

    // Check email uniqueness if email provided
    if (cleanEmail) {
      const { data: existingUser } = await supabaseAdmin
        .from('profiles')
        .select('id, email')
        .eq('email', cleanEmail)
        .neq('id', userId)
        .maybeSingle();

      if (existingUser) {
        return NextResponse.json(
          { error: `El correo electrónico "${cleanEmail}" ya está registrado por otro usuario.` },
          { status: 400 }
        );
 }
 }

 // Canonical ERP code unification
 const cleanCode = (erpClientCode || '').trim() || null;
 const numCode = cleanCode && !isNaN(Number(cleanCode)) ? Number(cleanCode) : null;

 // 1. Try updating auth user if user exists in auth.users
 try {
 const authPayload: {
 email?: string;
 email_confirm?: boolean;
 user_metadata?: Record<string, any>;
 } = {
 user_metadata: {
 full_name: name?.trim() || '',
 company_name: companyName?.trim() || '',
 whatsapp: whatsapp?.trim() || '',
 ...(birthDate !== undefined ? { birth_date: birthDate || null } : {}),
 },
 };

 if (cleanEmail) {
 authPayload.email = cleanEmail;
 authPayload.email_confirm = true;
 }

 const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, authPayload);
 if (authError) {
 console.warn('[AdminUpdateUser] auth.admin.updateUserById warning:', authError.message);
 if (
 authError.message.toLowerCase().includes('already registered') ||
 authError.message.toLowerCase().includes('already in use')
 ) {
 return NextResponse.json(
 { error: 'El correo electrónico ya está registrado en el sistema de autenticación.' },
 { status: 400 }
 );
 }
 }
 } catch (authErr: any) {
 console.warn('[AdminUpdateUser] auth update error:', authErr);
 }

 // 2. Update profiles table
 const profilePayload: Record<string, any> = {
 full_name: name?.trim() || null,
 company_name: companyName?.trim() || null,
 country_code: country?.trim() || 'PA',
 whatsapp: whatsapp?.trim() || '',
 role: role || 'client',
 erp_client_code: cleanCode,
 client_code: cleanCode,
 erp_client_id: numCode,
 business_type: businessType?.trim() || 'Óptica',
 tax_id: taxId?.trim() || null,
 address: address?.trim() || null,
 };

 if (birthDate !== undefined) {
 profilePayload.birth_date = birthDate || null;
 }

 if (cleanEmail) {
 profilePayload.email = cleanEmail;
 }

 let { data: updatedProfile, error: profileError } = await supabaseAdmin
 .from('profiles')
 .update(profilePayload)
 .eq('id', userId)
 .select()
 .maybeSingle();

 if (profileError && profileError.message.includes('birth_date')) {
 delete profilePayload.birth_date;
 const retry = await supabaseAdmin
 .from('profiles')
 .update(profilePayload)
 .eq('id', userId)
 .select()
 .maybeSingle();
 updatedProfile = retry.data;
 profileError = retry.error;
 }

 if (profileError) {
 console.error('[AdminUpdateUser] profiles update error:', profileError);
 return NextResponse.json(
 { error: profileError.message || 'Error al actualizar el perfil en la base de datos.' },
 { status: 400 }
 );
 }

 return NextResponse.json({
 success: true,
 message: 'Cliente actualizado exitosamente.',
 user: updatedProfile,
 });
 } catch (err: any) {
 console.error('[AdminUpdateUser] Unexpected error:', err);
 return NextResponse.json(
 { error: err.message || 'Error interno del servidor al actualizar cliente.' },
 { status: 500 }
 );
 }
}
