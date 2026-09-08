'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { OrderRecord } from '@/lib/orders';
import { formatPrice } from '@/lib/formatters';

export interface OrderValidationStepsProps {
  order: OrderRecord;
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

export const OrderValidationSteps: React.FC<OrderValidationStepsProps> = ({
  order,
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
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
      {/* 3-STEP BUTTONS BAR */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '0.75rem',
          flexWrap: 'wrap',
        }}
      >
        {/* STEP 1: VALIDAR PRODUCTOS */}
        {isProductsValid ? (
          <button
            disabled
            style={{
              backgroundColor: '#DEF7EC',
              color: '#03543F',
              border: 'none',
              borderRadius: '6px',
              padding: '0.65rem 1.15rem',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'default',
            }}
          >
            Producto validado
          </button>
        ) : (
          <button
            onClick={onValidateProducts}
            disabled={validatingProducts}
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
            {validatingProducts ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Validar productos'}
          </button>
        )}

        {/* STEP 2: VALIDAR CLIENTE */}
        {isClientValid ? (
          <button
            disabled
            style={{
              backgroundColor: '#DEF7EC',
              color: '#03543F',
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

        {/* STEP 3: CREAR PEDIDO EN SWITCH */}
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

      {/* SUMMARY BOX */}
      <div
        style={{
          backgroundColor: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: '8px',
          padding: '1.25rem 1.5rem',
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
      </div>
    </div>
  );
};
