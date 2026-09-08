'use client';

import React from 'react';
import { ArrowLeft, FileSpreadsheet, Printer, Loader2 } from 'lucide-react';
import { OrderRecord } from '@/lib/orders';
import { resolveProductImageUrl, handleImageFallback } from '@/lib/images';
import { formatPrice } from '@/lib/formatters';
import { downloadSwitchXLSX } from '@/lib/export-excel';
import { OrderStatusBadge } from './OrderStatusBadge';
import erpInventory from '@/data/erp_inventory.json';

export interface OrderDetailViewProps {
  order: OrderRecord;
  onBack: () => void;
  isProductsValid: boolean;
  isClientValid: boolean;
  isOrderCreated: boolean;
  validatingProducts: boolean;
  validatingClient: boolean;
  syncingOrder: boolean;
  onValidateProducts: () => void;
  onValidateClient: () => void;
  onCreateOrder: () => void;
}

export const OrderDetailView: React.FC<OrderDetailViewProps> = ({
  order,
  onBack,
  isProductsValid,
  isClientValid,
  isOrderCreated,
  validatingProducts,
  validatingClient,
  syncingOrder,
  onValidateProducts,
  onValidateClient,
  onCreateOrder,
}) => {
  const handlePrint = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.print();
  };

  return (
    <div style={{ backgroundColor: '#FFF', padding: '1.75rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '1.5rem', textAlign: 'center', color: '#1E293B' }}>
        Listado de pedidos:
      </h1>

      {/* TOP HEADER BAR */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        {/* Left: Back button + Customer summary */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <button
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              color: '#1864F6',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '0.2rem',
            }}
            title="Volver al listado"
          >
            <ArrowLeft size={32} strokeWidth={2.8} />
          </button>
          <div style={{ lineHeight: 1.35 }}>
            <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#334155' }}>
              Orden de: <strong>{order.company_name || order.customer_name || 'Cliente'}</strong>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
              email: {order.customer_email}
            </div>
          </div>
        </div>

        {/* Right: Actions row */}
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={(e) => downloadSwitchXLSX(order, e)}
            style={{
              backgroundColor: '#1864F6',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              padding: '0.65rem 1.15rem',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
            title="Descargar plantilla Switch (.xlsx)"
          >
            <FileSpreadsheet size={16} /> Plantilla Switch (.xlsx)
          </button>

          <button
            onClick={handlePrint}
            style={{
              backgroundColor: '#1864F6',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              padding: '0.65rem 1.15rem',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Printer size={16} /> Imprimir
          </button>

          {/* Validar productos */}
          <button
            onClick={onValidateProducts}
            disabled={validatingProducts}
            style={{
              backgroundColor: isProductsValid ? '#059669' : '#1864F6',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              padding: '0.65rem 1.15rem',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            {validatingProducts ? (
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
            ) : isProductsValid ? (
              '✓ Producto validado'
            ) : (
              'Validar productos'
            )}
          </button>

          {/* Validar cliente */}
          {isClientValid ? (
            <button
              disabled
              style={{
                backgroundColor: '#C7D2FE',
                color: '#312E81',
                border: 'none',
                borderRadius: '6px',
                padding: '0.65rem 1.15rem',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'default',
              }}
            >
              Cliente validado
            </button>
          ) : (
            <button
              onClick={onValidateClient}
              disabled={validatingClient}
              style={{
                backgroundColor: '#1864F6',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                padding: '0.65rem 1.15rem',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              {validatingClient ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Validar cliente'}
            </button>
          )}

          {/* Crear pedido */}
          {isOrderCreated ? (
            <button
              disabled
              style={{
                backgroundColor: '#C7D2FE',
                color: '#312E81',
                border: 'none',
                borderRadius: '6px',
                padding: '0.65rem 1.15rem',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'default',
              }}
            >
              Pedido creado
            </button>
          ) : (
            <button
              onClick={onCreateOrder}
              disabled={!isClientValid || syncingOrder}
              style={{
                backgroundColor: isClientValid ? '#1864F6' : '#94A3B8',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                padding: '0.65rem 1.15rem',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: isClientValid ? 'pointer' : 'not-allowed',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
              title={!isClientValid ? 'Valida primero el cliente antes de crear el pedido' : ''}
            >
              {syncingOrder ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Crear pedido'}
            </button>
          )}
        </div>
      </div>

      {/* METADATA SUMMARY BAR */}
      <div
        style={{
          backgroundColor: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: '8px',
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        {order.switch_order_number && (
          <div>
            <div style={{ color: '#0CA5A5', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem' }}>
              Este pedido ya se encuentra ordenado en switch
            </div>
            <div style={{ color: '#0CA5A5', fontSize: '0.85rem' }}>
              Número de pedido switch:
            </div>
            <div style={{ color: '#0CA5A5', fontWeight: 700, fontSize: '0.95rem' }}>
              {order.switch_order_number}
            </div>
          </div>
        )}

        <div>
          <span style={{ display: 'block', fontSize: '0.8rem', color: '#64748B', fontWeight: 600, marginBottom: '0.2rem' }}>
            Ordenado en:
          </span>
          <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1E293B' }}>
            {new Date(order.created_at).toLocaleDateString('es-ES', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        <div>
          <span style={{ display: 'block', fontSize: '0.8rem', color: '#64748B', fontWeight: 600, marginBottom: '0.2rem' }}>
            Subtotal:
          </span>
          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E293B' }}>
            {formatPrice(order.subtotal, true)}
          </span>
        </div>

        <div>
          <span style={{ display: 'block', fontSize: '0.8rem', color: '#64748B', fontWeight: 600, marginBottom: '0.2rem' }}>
            Número de articulos:
          </span>
          <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1E293B' }}>
            {order.total_items || (order.order_items || []).reduce((acc, i) => acc + (i.quantity || 1), 0)}
          </span>
        </div>

        <div>
          <span style={{ display: 'block', fontSize: '0.8rem', color: '#64748B', fontWeight: 600, marginBottom: '0.2rem' }}>
            Estado:
          </span>
          <OrderStatusBadge status={order.status} size="md" />
        </div>

        <div>
          <span style={{ display: 'block', fontSize: '0.8rem', color: '#64748B', fontWeight: 600, marginBottom: '0.2rem' }}>
            Número de orden:
          </span>
          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E293B' }}>
            {order.order_number}
          </span>
        </div>
      </div>

      {/* ITEMS LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {(order.order_items || []).map((item, idx) => {
          const itemRef = (item.product?.reference || item.reference || '').trim();
          const itemCode = (item.product?.code || item.code || itemRef).trim();

          const invMatch = (erpInventory as any[]).find(
            (inv) =>
              (inv.code && inv.code.toLowerCase() === itemCode.toLowerCase()) ||
              (inv.referencia && inv.referencia.toLowerCase() === itemRef.toLowerCase()) ||
              (inv.code && inv.code.toLowerCase() === itemRef.toLowerCase())
          );

          const currentStock = invMatch ? Number(invMatch.quantity || 0) : (item.product?.quantity ?? 10);
          const isAvailable = currentStock >= item.quantity;
          const missingQty = Math.max(0, item.quantity - currentStock);
          const imageUrl = resolveProductImageUrl(item);

          return (
            <div
              key={item.id || idx}
              style={{
                display: 'flex',
                gap: '1.5rem',
                padding: '1.25rem 0',
                borderBottom: '1px solid #E2E8F0',
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              {/* Product Thumbnail */}
              <div style={{ width: '130px', height: '90px', flexShrink: 0, position: 'relative' }}>
                <span style={{ position: 'absolute', top: -14, left: 0, fontSize: '0.62rem', color: '#94A3B8' }}>
                  Model: {itemRef}
                </span>
                <img
                  src={imageUrl}
                  alt={itemRef}
                  onError={handleImageFallback}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>

              {/* Product Details & Pills */}
              <div style={{ flex: 1, minWidth: '260px' }}>
                <div style={{ fontSize: '0.78rem', color: '#2563EB', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                  {itemRef}
                </div>
                <h3 style={{ fontSize: '1.1rem', color: '#2563EB', margin: '0 0 0.85rem 0', fontWeight: 700, textTransform: 'uppercase' }}>
                  {item.product?.description || item.product?.title || itemRef}
                </h3>

                {/* Pills Row */}
                <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', marginBottom: '0.25rem' }}>Precio</span>
                    <span style={{ display: 'inline-block', backgroundColor: '#0B2347', color: '#FFF', padding: '0.25rem 0.85rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700 }}>
                      $ {Number(item.unit_price).toFixed(2).replace('.', ',')} USD.
                    </span>
                  </div>

                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', marginBottom: '0.25rem' }}>Tamaño:</span>
                    <span style={{ display: 'inline-block', backgroundColor: '#0B2347', color: '#FFF', padding: '0.25rem 0.85rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700 }}>
                      {item.product?.eye_size || item.product?.size || '52'}
                    </span>
                  </div>

                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', marginBottom: '0.25rem' }}>Material:</span>
                    <span style={{ display: 'inline-block', backgroundColor: '#0B2347', color: '#FFF', padding: '0.25rem 0.85rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700 }}>
                      {item.product?.material || item.material || 'Acetato'}
                    </span>
                  </div>

                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', marginBottom: '0.25rem' }}>Venta por:</span>
                    <span style={{ display: 'inline-block', backgroundColor: '#0B2347', color: '#FFF', padding: '0.25rem 0.85rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700 }}>
                      {item.product?.sale_type || 'PIEZA'}
                    </span>
                  </div>

                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', marginBottom: '0.25rem' }}>Requerido por el cliente:</span>
                    <span style={{ display: 'inline-block', backgroundColor: '#0B2347', color: '#FFF', padding: '0.25rem 0.85rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700 }}>
                      {item.quantity}
                    </span>
                  </div>

                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', marginBottom: '0.25rem' }}>Estado Inventario ERP:</span>
                    {isAvailable ? (
                      <span style={{ display: 'inline-block', backgroundColor: '#0B2347', color: '#FFF', padding: '0.25rem 0.95rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700 }}>
                        Disponible
                      </span>
                    ) : (
                      <span style={{ display: 'inline-block', backgroundColor: '#FBBF24', color: '#FFF', padding: '0.25rem 0.95rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700 }}>
                        Disponibilidad {currentStock} (Faltan: {missingQty})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
