// =============================================================================
// API Route: Create Order in ERP + Get SwitchPay Payment URL
// =============================================================================
// Synchronizes a local Supabase order with the Switch-Soft ERP and returns
// the SwitchPay payment gateway link for checkout.
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { erpCreateOrder, erpFindClient } from '@/lib/erp';
import type { ErpOrderArticle } from '@/lib/erp-types';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  return createClient(url, serviceKey);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Se requiere el orderId para sincronizar con el ERP.' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // 1. Fetch order header
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'No se encontró el pedido solicitado en la base de datos local.' },
        { status: 404 }
      );
    }

    // 2. Fetch order items
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*, product:products(id, reference, code)')
      .eq('order_id', orderId);

    if (itemsError || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'El pedido no tiene artículos asociados.' },
        { status: 400 }
      );
    }

    // 3. Get customer ERP Linkage from profiles
    let erpClientId: number | null = null;
    let erpVendorId: number = 1; // default seller ID

    if (order.user_id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('erp_client_id, erp_vendor_id, email, tax_id')
        .eq('id', order.user_id)
        .single();

      if (profile?.erp_client_id) {
        erpClientId = profile.erp_client_id;
        if (profile.erp_vendor_id) erpVendorId = profile.erp_vendor_id;
      } else if (profile?.email || order.customer_email) {
        // Auto-attempt to find client in ERP by email
        const found = await erpFindClient({
          email: profile?.email || order.customer_email,
          identificacion: profile?.tax_id || undefined,
        });

        if (found) {
          erpClientId = found.id;
          erpVendorId = found.vendedorId || 1;
          // Save linkage for future orders
          await supabase
            .from('profiles')
            .update({
              erp_client_id: found.id,
              erp_client_code: found.codigo,
              erp_vendor_id: found.vendedorId,
            })
            .eq('id', order.user_id);
        }
      }
    }

    if (!erpClientId) {
      return NextResponse.json(
        {
          error: 'El cliente no está vinculado con una cuenta en el ERP Switch-Soft. Pídele al administrador validar la cuenta en /dashboard/usuarios.',
        },
        { status: 400 }
      );
    }

    // 4. Build ERP articles payload
    const articulos: ErpOrderArticle[] = items.map((item) => {
      // Parse numeric code as the ERP article ID
      const articuloId =
        parseInt(item.product?.code || '0', 10) ||
        parseInt(item.product?.reference || '0', 10);

      return {
        articuloId: articuloId,
        cantidad: item.quantity,
        precio: Number(item.unit_price),
      };
    });

    // Validate that all articles have a valid numeric ID (> 0)
    const invalidArticles = articulos.filter((a) => !a.articuloId || isNaN(a.articuloId));
    if (invalidArticles.length > 0) {
      return NextResponse.json(
        {
          error: 'Algunos artículos de la orden no tienen un ID de artículo de ERP sincronizado.',
        },
        { status: 400 }
      );
    }

    // 5. Call ERP create order API
    const erpResponse = await erpCreateOrder({
      clienteId: erpClientId,
      vendedorId: erpVendorId,
      articulos: articulos,
    });

    if (!erpResponse?.data?.numeroInterno) {
      return NextResponse.json(
        {
          error: 'El ERP no devolvió un número de pedido válido. Revisa la conexión o las credenciales.',
        },
        { status: 502 }
      );
    }

    const { numeroInterno, pedidoId, urlswitchpay } = erpResponse.data;

    // 6. Update local Supabase order
    await supabase
      .from('orders')
      .update({
        switch_order_number: numeroInterno,
        erp_order_id: pedidoId,
        payment_url: urlswitchpay,
        switch_synced: true,
        status: 'En Proceso',
      })
      .eq('id', orderId);

    return NextResponse.json({
      success: true,
      message: `¡Pedido sincronizado en ERP con éxito! Nº ${numeroInterno}`,
      switchOrderNumber: numeroInterno,
      erpOrderId: pedidoId,
      paymentUrl: urlswitchpay,
    });
  } catch (error) {
    console.error('[ERP Order Checkout] Unexpected error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Error inesperado al generar pedido en el ERP.',
      },
      { status: 500 }
    );
  }
}
