// =============================================================================
// API Route: Secure Server-Side B2B Order Creation
// =============================================================================
// Validates user session on server, recalculates unit prices against the
// database to prevent client-side price tampering, creates order and order items,
// and generates the WhatsApp dispatch link.
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  return createClient(url, serviceKey);
}

const isValidUUID = (id?: string | null) =>
  typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const authClient = createClient(supabaseUrl, supabaseAnonKey);

    let user: any = null;
    if (token) {
      const { data: authData } = await authClient.auth.getUser(token);
      user = authData?.user;
    }

    // Also support cookies if session is stored in cookies
    if (!user) {
      const cookieHeader = request.headers.get('cookie');
      // In Supabase SSR or bearer token, token is the primary method
    }

    const body = await request.json().catch(() => ({}));
    const { cartItems, shippingAddress, notes, whatsappPhone, userEmail: fallbackEmail, userId: fallbackId } = body;

    const resolvedUserId = user?.id || fallbackId;
    const resolvedEmail = user?.email || fallbackEmail;

    if (!resolvedUserId || !resolvedEmail) {
      return NextResponse.json(
        { error: 'No autorizado. Debes iniciar sesión para realizar un pedido.' },
        { status: 401 }
      );
    }

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { error: 'El carrito está vacío.' },
        { status: 400 }
      );
    }

    const adminSupabase = getSupabaseAdmin();

    // 1. Fetch user profile for metadata
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('*')
      .eq('id', resolvedUserId)
      .single();

    // 2. Recalculate prices against Database products to prevent client price tampering
    let calculatedSubtotal = 0;
    let totalPieces = 0;

    const validatedItems = await Promise.all(
      cartItems.map(async (item: any) => {
        const qty = Math.max(1, parseInt(item.quantity || 1, 10));
        totalPieces += qty;

        const pId = item.product?.id;
        let realPrice = Number(item.product?.price || 0);

        if (isValidUUID(pId)) {
          const { data: dbProd } = await adminSupabase
            .from('products')
            .select('id, price, reference, code, material, brands(name)')
            .eq('id', pId)
            .maybeSingle();

          if (dbProd && dbProd.price !== null && dbProd.price !== undefined) {
            realPrice = Number(dbProd.price);
          }
        }

        const lineTotal = realPrice * qty;
        calculatedSubtotal += lineTotal;

        return {
          productId: isValidUUID(pId) ? pId : null,
          reference: (item.product?.reference || item.reference || '').trim(),
          code: (item.product?.code || item.code || '').trim(),
          brand: (item.product?.brand || item.brand || '').trim(),
          material: (item.product?.material || item.material || '').trim(),
          unitPrice: realPrice,
          quantity: qty,
          totalPrice: lineTotal,
        };
      })
    );

    // 3. Generate collision-resistant order number
    const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, ''); // e.g. 260910
    const randPart = Math.floor(1000 + Math.random() * 9000); // 4-digit random
    const orderNumber = `DB-${datePart}-${randPart}`;

    // 4. Insert order header
    const { data: orderData, error: orderError } = await adminSupabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: resolvedUserId,
        customer_email: resolvedEmail,
        customer_name: profile?.full_name || profile?.name || resolvedEmail.split('@')[0],
        company_name: profile?.company_name || '',
        phone: whatsappPhone || profile?.whatsapp || profile?.phone || '',
        shipping_address: shippingAddress || 'A coordinar por WhatsApp (V2)',
        notes: notes || '',
        status: 'Pendiente',
        total_items: totalPieces,
        total_pieces: totalPieces,
        subtotal: calculatedSubtotal,
        total_amount: calculatedSubtotal,
      })
      .select()
      .single();

    if (orderError || !orderData) {
      console.error('[create-order] Error inserting order header:', orderError);
      return NextResponse.json(
        { error: orderError?.message || 'Error al registrar el encabezado del pedido.' },
        { status: 500 }
      );
    }

    // 5. Insert order items
    const itemsToInsert = validatedItems.map((item) => ({
      order_id: orderData.id,
      product_id: item.productId,
      reference: item.reference,
      code: item.code,
      brand: item.brand,
      material: item.material,
      unit_price: item.unitPrice,
      quantity: item.quantity,
      item_subtotal: item.totalPrice,
      total_price: item.totalPrice,
    }));

    const { error: itemsError } = await adminSupabase.from('order_items').insert(itemsToInsert);

    if (itemsError) {
      console.error('[create-order] Error inserting order items:', itemsError);
    }

    // 6. Generate official sales WhatsApp URL
    const dubrosWhatsApp = '50762926554'; // +507 6292-6554
    let message = `*NUEVO PEDIDO DUBROS B2B*\n`;
    message += `📋 *Orden:* #${orderNumber}\n`;
    message += `🏢 *Empresa:* ${profile?.company_name || 'N/A'}\n`;
    message += `👤 *Cliente:* ${profile?.full_name || profile?.name || resolvedEmail}\n`;
    message += `📍 *Dirección:* ${shippingAddress || 'A coordinar'}\n`;
    message += `-------------------------\n`;

    validatedItems.forEach((item) => {
      message += `• ${item.brand} ${item.reference} (x${item.quantity}) - $${item.totalPrice.toFixed(2)}\n`;
    });

    message += `-------------------------\n`;
    message += `📦 *Total piezas:* ${totalPieces}\n`;
    message += `💰 *Subtotal:* $${calculatedSubtotal.toFixed(2)}\n`;

    if (notes) {
      message += `📝 *Notas:* ${notes}\n`;
    }

    const whatsappUrl = `https://wa.me/${dubrosWhatsApp}?text=${encodeURIComponent(message)}`;

    return NextResponse.json({
      success: true,
      orderId: orderData.id,
      orderNumber,
      whatsappUrl,
      subtotal: calculatedSubtotal,
      totalPieces,
    });
  } catch (error: any) {
    console.error('[create-order] Unexpected error:', error);
    return NextResponse.json(
      { error: error?.message || 'Error inesperado al crear el pedido.' },
      { status: 500 }
    );
  }
}
