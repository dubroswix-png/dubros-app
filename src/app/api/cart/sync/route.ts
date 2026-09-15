// =============================================================================
// API Route: Sync Active Cart to Supabase Orders Table (Status: Carrito)
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isDocena } from '@/lib/products';

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
    const adminSupabase = getSupabaseAdmin();
    const body = await request.json().catch(() => ({}));
    const { cartItems, userId, userEmail } = body;

    if (!userId || !userEmail) {
      return NextResponse.json({ success: false, message: 'Usuario no especificado' }, { status: 200 });
    }

    // If cart is empty, clean up any existing Carrito order for this user
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      await adminSupabase
        .from('orders')
        .delete()
        .eq('user_id', userId)
        .eq('status', 'Carrito');

      return NextResponse.json({ success: true, cleared: true });
    }

    // 1. Fetch user profile
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    // 2. Validate and calculate cart items
    let calculatedSubtotal = 0;
    let totalOrderUnits = 0;
    let totalPhysicalPieces = 0;

    const validatedItems = await Promise.all(
      cartItems.map(async (item: any) => {
        const qty = Math.max(1, parseInt(item.quantity || 1, 10));
        const pId = item.product?.id;
        let basePrice = Number(item.product?.price || 0);
        let saleType = item.product?.saleType || 'PIEZA';

        if (isValidUUID(pId)) {
          const { data: dbProd } = await adminSupabase
            .from('products')
            .select('id, price, reference, code, material, sale_type')
            .eq('id', pId)
            .maybeSingle();

          if (dbProd && dbProd.price !== null && dbProd.price !== undefined) {
            basePrice = Number(dbProd.price);
            if (dbProd.sale_type) {
              saleType = dbProd.sale_type;
            }
          }
        }

        const isDoc = isDocena(saleType);
        const effectiveUnitPrice = isDoc ? basePrice * 12 : basePrice;
        const physicalPieces = isDoc ? qty * 12 : qty;
        const lineTotal = effectiveUnitPrice * qty;

        calculatedSubtotal += lineTotal;
        totalOrderUnits += qty;
        totalPhysicalPieces += physicalPieces;

        return {
          productId: isValidUUID(pId) ? pId : null,
          reference: (item.product?.reference || item.reference || '').trim(),
          code: (item.product?.code || item.code || '').trim(),
          brand: (item.product?.brand || item.brand || '').trim(),
          material: (item.product?.material || item.material || '').trim(),
          unitPrice: effectiveUnitPrice,
          quantity: qty,
          totalPrice: lineTotal,
        };
      })
    );

    // 3. Find if user already has an active Carrito order
    const { data: existingCartOrder } = await adminSupabase
      .from('orders')
      .select('id, order_number')
      .eq('user_id', userId)
      .eq('status', 'Carrito')
      .maybeSingle();

    let orderId = existingCartOrder?.id;

    if (orderId) {
      // Update existing Carrito order
      await adminSupabase
        .from('orders')
        .update({
          subtotal: calculatedSubtotal,
          total_amount: calculatedSubtotal,
          total_items: totalOrderUnits,
          total_pieces: totalPhysicalPieces,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      // Clean old order items and insert current ones
      await adminSupabase.from('order_items').delete().eq('order_id', orderId);
    } else {
      // Create new Carrito order
      const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, '');
      const randPart = Math.floor(1000 + Math.random() * 9000);
      const cartOrderNumber = `CART-${datePart}-${randPart}`;

      const { data: newOrder, error: orderErr } = await adminSupabase
        .from('orders')
        .insert({
          order_number: cartOrderNumber,
          user_id: userId,
          customer_email: userEmail,
          customer_name: profile?.full_name || profile?.name || userEmail.split('@')[0],
          company_name: profile?.company_name || '',
          phone: profile?.whatsapp || profile?.phone || '',
          shipping_address: 'En armado por el cliente',
          notes: 'Carrito activo (pendiente de completar)',
          status: 'Carrito',
          total_items: totalOrderUnits,
          total_pieces: totalPhysicalPieces,
          subtotal: calculatedSubtotal,
          total_amount: calculatedSubtotal,
        })
        .select('id')
        .single();

      if (orderErr || !newOrder) {
        console.error('[cart/sync] Error creating Carrito order:', orderErr);
        return NextResponse.json({ error: orderErr?.message }, { status: 500 });
      }

      orderId = newOrder.id;
    }

    // 4. Insert order items
    const itemsToInsert = validatedItems.map((item) => ({
      order_id: orderId,
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

    await adminSupabase.from('order_items').insert(itemsToInsert);

    return NextResponse.json({ success: true, orderId });
  } catch (error: any) {
    console.error('[cart/sync] Unexpected error:', error);
    return NextResponse.json({ error: error?.message || 'Error syncing cart' }, { status: 500 });
  }
}
