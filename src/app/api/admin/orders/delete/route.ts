import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const ADMIN_EMAILS = [
  'dubroswix@gmail.com',
  'dfduqu01@gmail.com',
];

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  return createClient(url, serviceKey);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, requesterEmail } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'El ID de pedido es obligatorio.' },
        { status: 400 }
      );
    }

    const cleanRequester = (requesterEmail || '').toLowerCase().trim();
    const supabaseAdmin = getSupabaseAdmin();

    // Security check: Only Admins can delete orders
    let isAuthorized = ADMIN_EMAILS.includes(cleanRequester);

    if (!isAuthorized && cleanRequester) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .ilike('email', cleanRequester)
        .maybeSingle();

      if (profile && profile.role === 'admin') {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Permiso denegado. Solo los administradores pueden eliminar pedidos.' },
        { status: 403 }
      );
    }

    // 1. Delete items from order_items
    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .delete()
      .eq('order_id', orderId);

    if (itemsError) {
      console.warn('[AdminDeleteOrder] Warning deleting order items:', itemsError);
    }

    // 2. Delete order from orders
    const { error: orderError } = await supabaseAdmin
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (orderError) {
      console.error('[AdminDeleteOrder] Error deleting order:', orderError);
      return NextResponse.json(
        { error: orderError.message || 'Error al eliminar el pedido de la base de datos.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Pedido eliminado permanentemente.',
    });
  } catch (err: any) {
    console.error('[AdminDeleteOrder] Unexpected error:', err);
    return NextResponse.json(
      { error: err?.message || 'Error del servidor al eliminar el pedido.' },
      { status: 500 }
    );
  }
}
