'use client';

import React from 'react';
import { ArrowLeft, FileSpreadsheet, Printer, Loader2, CheckCircle2, User, Calendar } from 'lucide-react';
import { OrderRecord } from '@/lib/orders';
import { resolveProductImageUrl, handleImageFallback } from '@/lib/images';
import { formatPrice, formatDateSpanish } from '@/lib/formatters';
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

  const totalPieces = order.total_items || (order.order_items || []).reduce((acc, i) => acc + (i.quantity || 1), 0);
  const clientName = order.company_name || order.customer_name || 'Cliente';

  return (
    <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)' }}>
      {/* TOP NAV BAR */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--border-light)',
        }}
      >
        {/* Left: Back button + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={onBack}
            className="btn-secondary"
            style={{
              padding: '0.45rem 0.8rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.85rem',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <ArrowLeft size={16} /> Volver
          </button>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy)', margin: 0 }}>
              Pedido {order.order_number}
            </h2>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Cliente: <strong>{clientName}</strong> ({order.customer_email})
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={(e) => downloadSwitchXLSX(order, e)}
            className="btn-primary"
            style={{
              backgroundColor: '#059669',
              padding: '0.5rem 0.9rem',
              fontSize: '0.84rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontWeight: 700,
            }}
            title="Descargar plantilla Switch (.xlsx)"
          >
            <FileSpreadsheet size={15} /> Plantilla Switch (.xlsx)
          </button>

          <button
            onClick={handlePrint}
            className="btn-secondary"
            style={{
              padding: '0.5rem 0.9rem',
              fontSize: '0.84rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontWeight: 600,
            }}
          >
            <Printer size={15} /> Imprimir
          </button>
        </div>
      </div>

      {/* 3-STEP VALIDATION BAR */}
      <div
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          marginBottom: '1.75rem',
        }}
      >
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
          Flujo de Creación y Sincronización Switch ERP
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* STEP 1: VALIDAR PRODUCTOS */}
          <button
            onClick={onValidateProducts}
            disabled={validatingProducts || isProductsValid}
            style={{
              flex: '1 1 180px',
              padding: '0.65rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: isProductsValid ? '1px solid #047857' : '1px solid #1864F6',
              backgroundColor: isProductsValid ? '#047857' : '#1864F6',
              color: '#FFFFFF',
              fontSize: '0.86rem',
              fontWeight: 700,
              cursor: isProductsValid ? 'default' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              boxShadow: isProductsValid ? '0 2px 6px rgba(4, 120, 87, 0.3)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            {validatingProducts ? (
              <Loader2 size={16} className="animate-spin" />
            ) : isProductsValid ? (
              <>
                <CheckCircle2 size={16} color="#FFFFFF" /> 1. Productos Validados
              </>
            ) : (
              '1. Validar Productos'
            )}
          </button>

          {/* STEP 2: VALIDAR CLIENTE */}
          {isClientValid ? (
            <button
              disabled
              style={{
                flex: '1 1 180px',
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #047857',
                backgroundColor: '#047857',
                color: '#FFFFFF',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'default',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                boxShadow: '0 2px 6px rgba(4, 120, 87, 0.3)',
                transition: 'all 0.2s ease',
              }}
            >
              <CheckCircle2 size={16} color="#FFFFFF" /> 2. Cliente Validado
            </button>
          ) : (
            <button
              onClick={onValidateClient}
              disabled={validatingClient}
              style={{
                flex: '1 1 180px',
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #1864F6',
                backgroundColor: '#1864F6',
                color: '#FFFFFF',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s ease',
              }}
            >
              {validatingClient ? <Loader2 size={16} className="animate-spin" /> : '2. Validar Cliente'}
            </button>
          )}

          {/* STEP 3: CREAR PEDIDO EN SWITCH */}
          {isOrderCreated ? (
            <button
              disabled
              style={{
                flex: '1 1 180px',
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #047857',
                backgroundColor: '#10B981',
                color: '#FFFFFF',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'default',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
              }}
            >
              ✓ 3. Pedido Creado en Switch
            </button>
          ) : (
            <button
              onClick={onCreateOrder}
              disabled={!isClientValid || syncingOrder}
              style={{
                flex: '1 1 180px',
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                backgroundColor: isClientValid ? '#0B1A2F' : '#94A3B8',
                color: '#FFFFFF',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: isClientValid ? 'pointer' : 'not-allowed',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
              }}
              title={!isClientValid ? 'Valida primero el cliente antes de crear el pedido' : ''}
            >
              {syncingOrder ? <Loader2 size={16} className="animate-spin" /> : '3. Crear Pedido en Switch'}
            </button>
          )}
        </div>
      </div>

      {/* METADATA SUMMARY GRID */}
      <div
        className="order-meta-grid"
        style={{
          padding: '1.25rem',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          marginBottom: '2rem',
        }}
      >
        <div>
          <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
            Fecha del pedido
          </span>
          <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {formatDateSpanish(order.created_at, 'bubble')}
          </span>
        </div>

        <div>
          <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
            Subtotal
          </span>
          <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {formatPrice(order.subtotal, false)}
          </span>
        </div>

        <div>
          <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
            Total piezas
          </span>
          <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {totalPieces} piezas
          </span>
        </div>

        <div>
          <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.2rem' }}>
            Estado
          </span>
          <OrderStatusBadge status={order.status} size="sm" />
        </div>

        {order.switch_order_number && (
          <div style={{ gridColumn: 'span 2' }}>
            <span style={{ display: 'block', fontSize: '0.72rem', color: '#047857', textTransform: 'uppercase', fontWeight: 700 }}>
              ✓ Switch ERP Orden
            </span>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#065F46' }}>
              #{order.switch_order_number}
            </span>
          </div>
        )}
      </div>

      {/* ITEMS LIST */}
      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '1rem' }}>
          Artículos en la Orden ({order.order_items?.length || 0})
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {(order.order_items || []).map((item, idx) => {
            const itemRef = (item.reference || item.product?.reference || '').trim();
            const itemCode = (item.code || item.product?.code || itemRef).trim();

            const invMatch = (erpInventory as any[]).find(
              (inv) =>
                (inv.code && inv.code.toLowerCase() === itemCode.toLowerCase()) ||
                (inv.reference && inv.reference.toLowerCase() === itemRef.toLowerCase()) ||
                (inv.code && inv.code.toLowerCase() === itemRef.toLowerCase())
            );

            const currentStock = invMatch ? Number(invMatch.quantity || 0) : (item.product?.quantity ?? 10);
            const isAvailable = currentStock >= item.quantity;
            const missingQty = Math.max(0, item.quantity - currentStock);
            const imageUrl = resolveProductImageUrl(item);
            const brand = item.brand || item.product?.brands?.name || 'Dubros';

            return (
              <div
                key={item.id || idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.25rem',
                  padding: '1.25rem',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-lg)',
                  flexWrap: 'wrap',
                }}
              >
                {/* Thumbnail */}
                <div
                  style={{
                    width: '110px',
                    height: '85px',
                    flexShrink: 0,
                    backgroundColor: '#FFFFFF',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    padding: '0.25rem',
                  }}
                >
                  <img
                    src={imageUrl}
                    alt={itemRef}
                    onError={handleImageFallback}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: '220px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        backgroundColor: 'var(--navy)',
                        color: '#FFFFFF',
                        padding: '0.15rem 0.45rem',
                        borderRadius: 'var(--radius-sm)',
                        textTransform: 'uppercase',
                      }}
                    >
                      {brand}
                    </span>
                    <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--blue)' }}>
                      {itemRef}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    {item.product?.description || `Montura ${brand} ${itemRef}`}
                  </div>

                  {/* Pills */}
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ backgroundColor: 'var(--bg-tertiary)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.74rem', fontWeight: 600 }}>
                      Talla: {item.product?.eye_size || '52'}
                    </span>
                    <span style={{ backgroundColor: 'var(--bg-tertiary)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.74rem', fontWeight: 600 }}>
                      {item.material || item.product?.material || 'Acetato'}
                    </span>

                    {/* ERP Stock Pill */}
                    {isAvailable ? (
                      <span
                        style={{
                          backgroundColor: '#DEF7EC',
                          color: '#03543F',
                          padding: '0.2rem 0.6rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                        }}
                      >
                        ✓ Stock Disponible ({currentStock})
                      </span>
                    ) : (
                      <span
                        style={{
                          backgroundColor: '#FEF3C7',
                          color: '#92400E',
                          padding: '0.2rem 0.6rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                        }}
                      >
                        Stock {currentStock} (Faltan: {missingQty})
                      </span>
                    )}
                  </div>
                </div>

                {/* Price column */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {item.quantity} {item.quantity === 1 ? 'pieza' : 'piezas'} × {formatPrice(item.unit_price, false)}
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {formatPrice(Number(item.unit_price) * Number(item.quantity), false)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
