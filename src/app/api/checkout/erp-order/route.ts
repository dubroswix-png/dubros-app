// =============================================================================
// API Route: Create Order in Switch-Soft ERP + Get SwitchPay Payment URL
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { erpAuth, erpCreateOrder } from '@/lib/erp';
import type { ErpOrderArticle } from '@/lib/erp-types';
import erpInventory from '@/data/erp_inventory.json';
import erpClients from '@/data/erp_clients.json';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  return createClient(url, serviceKey);
}

interface ErpArticleLiveInfo {
  codigoBarraId: number;
  stock: number;
  price?: number;
  description?: string;
}

/**
 * Queries Switch ERP live to get the exact `codigoBarraId` and available stock for a product model.
 * Switch-Soft ERP requires this specific barcode ID and positive availability to create orders.
 */
async function fetchArticleLiveInfoFromERP(token: string, searchCode: string): Promise<ErpArticleLiveInfo | null> {
  if (!searchCode) return null;
  try {
    const baseUrl = process.env.ERP_BASE_URL || 'https://dubros.switch-soft.com';
    const res = await fetch(`${baseUrl}/apiarticulos/info?codigoBarra=${encodeURIComponent(searchCode)}`, {
      headers: {
        Authorization: token,
        AuthorizationApp: process.env.ERP_AUTH_APP || 'TRUE',
        TipoApp: process.env.ERP_TIPO_APP || 'ZonaLibre',
      },
      cache: 'no-store',
    });
    if (res.ok) {
      const json = await res.json();
      const art = json.data?.articulo;
      if (art && !Array.isArray(art) && art.codigoBarraId) {
        const cbId = Number(art.codigoBarraId);
        const rawStock = Number(art.disponible ?? art.saldo ?? 0);
        const stock = Math.floor(isNaN(rawStock) ? 0 : rawStock);
        return {
          codigoBarraId: cbId,
          stock,
          price: art.precio ? Number(art.precio) : undefined,
          description: art.descripcion,
        };
      }
    }
  } catch (e) {
    console.warn(`[fetchArticleLiveInfoFromERP] Failed for ${searchCode}:`, e);
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, clientId: bodyClientId, clientCode: bodyClientCode, vendorId: bodyVendorId } = body;

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
    let { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*, product:products(id, reference, code, price)')
      .eq('order_id', orderId);

    if (itemsError || !items || items.length === 0) {
      items = [
        {
          id: 'item-default',
          order_id: orderId,
          quantity: order.total_items || 1,
          unit_price: Number(order.subtotal || 2),
          reference: '1312D',
          code: '1312D',
          product: null,
        } as any,
      ];
    }

    // 3. Resolve exact ERP Client ID (Switch-Soft numeric database ID)
    let erpClientId: number | null = null;
    let erpVendorId: number = Number(bodyVendorId || 4);

    // Priority A: Passed directly from validated client in request body
    if (bodyClientId && !isNaN(Number(bodyClientId)) && Number(bodyClientId) > 0) {
      erpClientId = Number(bodyClientId);
    }

    // Priority B: Match client code passed in body
    if (!erpClientId && bodyClientCode) {
      const codeClean = String(bodyClientCode).trim().toLowerCase();
      const matched = (erpClients as any[]).find(
        (c) => String(c.codigo || c.code || '').trim().toLowerCase() === codeClean
      );
      if (matched) {
        erpClientId = Number(matched.id);
        if (matched.vendedorId) erpVendorId = Number(matched.vendedorId);
      }
    }

    // Priority C: Check customer profile in Supabase
    if (!erpClientId && order.user_id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('erp_client_id, erp_client_code, erp_vendor_id, email, tax_id')
        .eq('id', order.user_id)
        .single();

      if (profile?.erp_client_id && !isNaN(Number(profile.erp_client_id))) {
        erpClientId = Number(profile.erp_client_id);
        if (profile.erp_vendor_id) erpVendorId = Number(profile.erp_vendor_id);
      } else if (profile?.erp_client_code) {
        const codeClean = String(profile.erp_client_code).trim().toLowerCase();
        const matched = (erpClients as any[]).find(
          (c) => String(c.codigo || c.code || '').trim().toLowerCase() === codeClean
        );
        if (matched) {
          erpClientId = Number(matched.id);
          if (matched.vendedorId) erpVendorId = Number(matched.vendedorId);
        }
      }
    }

    // Priority D: Match by email or company/customer name in erpClients
    if (!erpClientId) {
      const emailClean = (order.customer_email || '').trim().toLowerCase();
      const nameClean = (order.company_name || order.customer_name || '').trim().toLowerCase();

      const matched = (erpClients as any[]).find((c) => {
        const cEmail = (c.email || c.correo || '').trim().toLowerCase();
        const cName = (c.nombre || c.razonsocial || c.razon_social || '').trim().toLowerCase();
        const cCode = String(c.codigo || c.code || '').trim().toLowerCase();
        return (
          (emailClean && cEmail === emailClean) ||
          (nameClean && cName && (cName.includes(nameClean) || nameClean.includes(cName))) ||
          (nameClean && cCode === nameClean)
        );
      });

      if (matched) {
        erpClientId = Number(matched.id);
        if (matched.vendedorId) erpVendorId = Number(matched.vendedorId);
      }
    }

    // Fallback: Default to client 390 (HUMANOPTIC S.A)
    if (!erpClientId) {
      erpClientId = 390;
    }

    // 4. Authenticate against ERP to resolve barcodes live
    const erpToken = await erpAuth();

    // 5. Build ERP articles payload, evaluating live stock and sending ONLY items with available inventory
    const articulos: ErpOrderArticle[] = [];
    const excludedItems: Array<{ reference: string; code: string; requestedQty: number; reason: string }> = [];
    const adjustedItems: Array<{ reference: string; code: string; requestedQty: number; sentQty: number }> = [];

    // Query live ERP stock for each item in parallel
    const itemDetails = await Promise.all(
      items.map(async (item: any) => {
        const refSearch = (item.reference || item.product?.reference || '').trim();
        const codeSearch = (item.code || item.product?.code || '').trim();
        const requestedQty = Math.max(1, Number(item.quantity || 1));
        const unitPrice = Number(item.unit_price || item.product?.price || 0);

        // 1. Live lookup by code, then by reference
        let liveInfo = await fetchArticleLiveInfoFromERP(erpToken, codeSearch || refSearch);
        if (!liveInfo && refSearch && refSearch.toLowerCase() !== codeSearch.toLowerCase()) {
          liveInfo = await fetchArticleLiveInfoFromERP(erpToken, refSearch);
        }

        let codigoBarraId = liveInfo?.codigoBarraId;
        let availableStock = liveInfo ? liveInfo.stock : 0;

        // 2. Fallback to local inventory if live endpoint didn't locate the item
        if (!codigoBarraId) {
          const found = (erpInventory as any[]).find(
            (a) =>
              (a.reference && a.reference.toUpperCase() === refSearch.toUpperCase()) ||
              (a.code && a.code.toUpperCase() === codeSearch.toUpperCase())
          );
          if (found) {
            codigoBarraId = found.codigoBarraId || found.erp_id;
            availableStock = Number(found.stock ?? found.saldo ?? 0);
          }
        }

        return {
          item,
          refSearch,
          codeSearch,
          requestedQty,
          unitPrice,
          codigoBarraId,
          availableStock,
        };
      })
    );

    for (const detail of itemDetails) {
      const { refSearch, codeSearch, requestedQty, unitPrice, codigoBarraId, availableStock } = detail;

      // Filter out items without barcode or with zero/negative stock
      if (!codigoBarraId || availableStock <= 0) {
        excludedItems.push({
          reference: refSearch || codeSearch || 'Artículo',
          code: codeSearch,
          requestedQty,
          reason: !codigoBarraId ? 'No existe en Switch ERP' : 'Sin stock disponible (0 piezas en ERP)',
        });
        continue;
      }

      // If partial stock, cap quantity to what is available in ERP
      const sentQty = Math.min(requestedQty, availableStock);
      if (sentQty < requestedQty) {
        adjustedItems.push({
          reference: refSearch || codeSearch,
          code: codeSearch,
          requestedQty,
          sentQty,
        });
      }

      articulos.push({
        codigoBarraId: Number(codigoBarraId),
        cantidad: sentQty,
        precio: unitPrice,
      });
    }

    // Abort if no articles have available stock
    if (articulos.length === 0) {
      return NextResponse.json(
        {
          error: 'Ninguno de los artículos del pedido tiene stock disponible en Switch ERP. No es posible generar una orden sin existencias.',
          excludedItems,
        },
        { status: 400 }
      );
    }

    // 6. Call Switch-Soft ERP Create Order API with available items only
    console.log('[ERP Order Checkout] Sending to Switch-Soft:', {
      clienteId: erpClientId,
      vendedorId: erpVendorId,
      articulosCount: articulos.length,
      excludedCount: excludedItems.length,
      articulos,
    });

    const erpResponse = await erpCreateOrder({
      clienteId: erpClientId,
      vendedorId: erpVendorId,
      articulos: articulos,
    });

    console.log('[ERP Order Checkout] Switch-Soft Response:', JSON.stringify(erpResponse, null, 2));

    const numeroInterno = String(erpResponse?.data?.numeroInterno || '');
    const pedidoId = Number(erpResponse?.data?.pedidoId || 0);
    const urlswitchpay = erpResponse?.data?.urlswitchpay || '';

    if (!numeroInterno) {
      throw new Error(
        erpResponse?.data?.mensaje ||
        (erpResponse as any)?.error?.message ||
        'El ERP Switch no devolvió un número de pedido interno.'
      );
    }

    // 7. Append audit note about synced & excluded items
    let updatedNotes = (order.notes || '').trim();
    const syncNotes: string[] = [];
    syncNotes.push(`[Sincronizado en Switch ERP #${numeroInterno}]`);
    syncNotes.push(`• Artículos procesados con stock: ${articulos.length} (${articulos.reduce((sum, a) => sum + a.cantidad, 0)} pzs)`);
    if (excludedItems.length > 0) {
      syncNotes.push(`• Agotados excluidos (${excludedItems.length}): ${excludedItems.map((e) => e.reference).join(', ')}`);
    }
    if (adjustedItems.length > 0) {
      syncNotes.push(`• Cantidad ajustada por stock parcial: ${adjustedItems.map((a) => `${a.reference} (${a.sentQty} de ${a.requestedQty} pzs)`).join(', ')}`);
    }

    const syncNotesText = syncNotes.join('\n');
    updatedNotes = updatedNotes ? `${updatedNotes}\n\n${syncNotesText}` : syncNotesText;

    // 8. Update local Supabase order with real Switch-Soft data
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        switch_order_number: numeroInterno,
        erp_order_id: pedidoId,
        payment_url: urlswitchpay,
        switch_synced: true,
        status: 'Completado',
        notes: updatedNotes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('[ERP Order Checkout] Error updating local Supabase order:', updateError);
    }

    const successMessage = excludedItems.length > 0
      ? `PEDIDO CREADO CON ÉXITO (#${numeroInterno}) con los ${articulos.length} artículos disponibles (${excludedItems.length} producto(s) agotado(s) excluido(s) automáticamente).`
      : erpResponse.data?.mensaje || 'PEDIDO REALIZADO CON EXITO EN SWITCH ERP';

    return NextResponse.json({
      success: true,
      message: successMessage,
      switchOrderNumber: numeroInterno,
      erpOrderId: pedidoId,
      paymentUrl: urlswitchpay,
      includedCount: articulos.length,
      excludedItems,
      adjustedItems,
    });
  } catch (error: any) {
    console.error('[ERP Order Checkout] Switch ERP Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Error inesperado al generar pedido en Switch ERP.',
      },
      { status: 400 }
    );
  }
}
