// =============================================================================
// API Route: Validate Order Products Stock with Switch-Soft ERP Live
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { erpAuth } from '@/lib/erp';

export const dynamic = 'force-dynamic';
export const maxDuration = 45;

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  return createClient(url, serviceKey);
}

export interface ProductValidationResult {
  itemId: string;
  reference: string;
  code: string;
  requestedQuantity: number;
  stock: number;
  existsInERP: boolean;
  codigoBarraId?: number;
  status: 'available' | 'partial' | 'unavailable';
  badgeColor: 'green' | 'yellow' | 'red';
  label: string;
  description?: string;
  unitPrice?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, items: requestItems } = body;

    if (!orderId && (!requestItems || !Array.isArray(requestItems) || requestItems.length === 0)) {
      return NextResponse.json(
        { error: 'Se requiere orderId o lista de artículos para validar.' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // 1. Fetch order items if not fully provided
    let itemsToValidate: any[] = requestItems || [];
    if (orderId && itemsToValidate.length === 0) {
      const { data: dbItems, error: itemsErr } = await supabase
        .from('order_items')
        .select('*, product:products(id, reference, code, description, price, quantity)')
        .eq('order_id', orderId);

      if (itemsErr || !dbItems || dbItems.length === 0) {
        return NextResponse.json(
          { error: 'No se encontraron artículos en la orden especificada.' },
          { status: 404 }
        );
      }
      itemsToValidate = dbItems;
    }

    // 2. Authenticate against Switch ERP
    let erpToken: string | null = null;
    let erpBaseUrl = process.env.ERP_BASE_URL || 'https://dubros.switch-soft.com';
    let erpAuthApp = process.env.ERP_AUTH_APP || 'TRUE';
    let erpTipoApp = process.env.ERP_TIPO_APP || 'ZonaLibre';

    try {
      erpToken = await erpAuth();
    } catch (authError) {
      console.warn('[validate-products] ERP Auth failed, will fallback to Supabase:', authError);
    }

    // 3. Validate each item in parallel
    const validationResults: ProductValidationResult[] = await Promise.all(
      itemsToValidate.map(async (item: any) => {
        const itemId = String(item.id || item.product_id || item.reference);
        const itemRef = (item.reference || item.product?.reference || '').trim();
        const itemCode = (item.code || item.product?.code || itemRef).trim();
        const requestedQty = Number(item.quantity || 1);

        let existsInERP = false;
        let stock = 0;
        let codigoBarraId: number | undefined = undefined;
        let erpDescription: string | undefined = undefined;
        let erpPrice: number | undefined = undefined;

        // A. Attempt ERP Live Lookup
        if (erpToken) {
          const codesToTry = [itemCode];
          if (itemRef && itemRef.toLowerCase() !== itemCode.toLowerCase()) {
            codesToTry.push(itemRef);
          }

          for (const searchCode of codesToTry) {
            try {
              const res = await fetch(
                `${erpBaseUrl}/apiarticulos/info?codigoBarra=${encodeURIComponent(searchCode)}`,
                {
                  headers: {
                    Authorization: erpToken,
                    AuthorizationApp: erpAuthApp,
                    TipoApp: erpTipoApp,
                  },
                }
              );

              if (res.ok) {
                const json = await res.json();
                const art = json.data?.articulo;
                if (art && !Array.isArray(art) && art.codigo) {
                  existsInERP = true;
                  stock = Math.floor(Number(art.disponible ?? art.saldo ?? 0));
                  codigoBarraId = art.codigoBarraId ? Number(art.codigoBarraId) : undefined;
                  erpDescription = art.descripcion;
                  erpPrice = art.precio ? Number(art.precio) : undefined;
                  break;
                }
              }
            } catch (fetchErr) {
              console.warn(`[validate-products] Error fetching code ${searchCode} from ERP:`, fetchErr);
            }
          }
        }

        // B. Fallback to Supabase products table if not found in ERP
        if (!existsInERP) {
          try {
            const { data: sbProduct } = await supabase
              .from('products')
              .select('id, reference, code, description, price, quantity')
              .or(`reference.ilike.${itemRef || itemCode},code.ilike.${itemCode || itemRef}`)
              .limit(1)
              .maybeSingle();

            if (sbProduct) {
              stock = Math.floor(Number(sbProduct.quantity ?? 0));
              erpDescription = sbProduct.description || erpDescription;
              erpPrice = sbProduct.price ? Number(sbProduct.price) : erpPrice;
            }
          } catch (sbErr) {
            console.warn('[validate-products] Supabase fallback query error:', sbErr);
          }
        }

        // C. Calculate Status & Badge
        let status: 'available' | 'partial' | 'unavailable';
        let badgeColor: 'green' | 'yellow' | 'red';
        let label = '';

        if (!existsInERP && stock <= 0) {
          status = 'unavailable';
          badgeColor = 'red';
          label = '✕ No existe en Switch ERP';
        } else if (stock <= 0) {
          status = 'unavailable';
          badgeColor = 'red';
          label = '✕ Sin Stock / Agotado (0 piezas)';
        } else if (stock < requestedQty) {
          status = 'partial';
          badgeColor = 'yellow';
          const missing = requestedQty - stock;
          label = `⚠ Stock Parcial: ${stock} de ${requestedQty} (Falta ${missing === 1 ? '1 pieza' : `${missing} piezas`})`;
        } else {
          status = 'available';
          badgeColor = 'green';
          label = `✓ Stock Disponible (${stock} en ERP)`;
        }

        return {
          itemId,
          reference: itemRef || itemCode,
          code: itemCode,
          requestedQuantity: requestedQty,
          stock,
          existsInERP,
          codigoBarraId,
          status,
          badgeColor,
          label,
          description: erpDescription,
          unitPrice: erpPrice,
        };
      })
    );

    // 4. Summarize order-level status
    const allAvailable = validationResults.every((r) => r.status === 'available');
    const hasUnavailable = validationResults.some((r) => r.status === 'unavailable');
    const hasPartial = validationResults.some((r) => r.status === 'partial');

    return NextResponse.json({
      success: true,
      allAvailable,
      hasUnavailable,
      hasPartial,
      totalItems: validationResults.length,
      items: validationResults,
    });
  } catch (error: any) {
    console.error('[validate-products] Unexpected error:', error);
    return NextResponse.json(
      { error: error?.message || 'Error inesperado al validar productos con Switch ERP.' },
      { status: 500 }
    );
  }
}
