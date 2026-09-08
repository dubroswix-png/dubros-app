'use client';

import React from 'react';
import { Package, FileSpreadsheet } from 'lucide-react';
import { OrderRecord } from '@/lib/orders';
import { formatPrice } from '@/lib/formatters';
import { downloadSwitchXLSX } from '@/lib/export-excel';
import { OrderStatusBadge } from './OrderStatusBadge';

export interface OrderListItemProps {
  order: OrderRecord;
  onClick: () => void;
}

export const OrderListItem: React.FC<OrderListItemProps> = ({ order, onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        border: '1px solid #E2E8F0',
        borderRadius: '10px',
        padding: '1.5rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        backgroundColor: '#FFFFFF',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)';
        e.currentTarget.style.borderColor = '#CBD5E1';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = '#E2E8F0';
      }}
    >
      {/* Top Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
          <Package size={34} color={order.switch_order_number ? '#10B981' : '#1864F6'} />
          <div>
            {order.switch_order_number ? (
              <span
                style={{
                  display: 'inline-block',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#047857',
                  backgroundColor: '#ECFDF5',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '4px',
                }}
              >
                ✓ Switch ERP: #{order.switch_order_number}
              </span>
            ) : (
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748B' }}>
                Pedido Dubros
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <div>
            <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748B' }}>Fecha</span>
            <span style={{ fontSize: '0.86rem', fontWeight: 600, color: '#1E293B' }}>
              {new Date(order.created_at).toLocaleDateString('es-ES')}
            </span>
          </div>

          <div>
            <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748B' }}>Subtotal</span>
            <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#1E293B' }}>
              {formatPrice(order.subtotal, true)}
            </span>
          </div>

          <div>
            <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', marginBottom: '0.2rem' }}>Estado</span>
            <OrderStatusBadge status={order.status} size="sm" />
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748B' }}>No. de Orden</span>
          <span style={{ display: 'block', fontSize: '1rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.4rem' }}>
            {order.order_number}
          </span>
          <button
            className="btn-primary"
            style={{
              padding: '0.35rem 0.75rem',
              fontSize: '0.76rem',
              backgroundColor: '#059669',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontWeight: 700,
            }}
            onClick={(e) => downloadSwitchXLSX(order, e)}
            title="Descargar archivo Excel .xlsx para Switch ERP"
          >
            <FileSpreadsheet size={13} /> Excel Switch (.xlsx)
          </button>
        </div>
      </div>

      {/* Bottom Metadata */}
      <div style={{ display: 'flex', gap: '3rem', paddingTop: '0.85rem', borderTop: '1px solid #F1F5F9', fontSize: '0.84rem' }}>
        <div>
          <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748B' }}>Artículos</span>
          <span style={{ fontWeight: 600, color: '#1E293B' }}>
            {order.total_items || (order.order_items || []).reduce((acc, i) => acc + (i.quantity || 1), 0)} piezas
          </span>
        </div>

        <div>
          <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748B' }}>Email</span>
          <span style={{ fontWeight: 600, color: '#1E293B' }}>{order.customer_email}</span>
        </div>

        <div>
          <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748B' }}>Cliente / Empresa</span>
          <span style={{ fontWeight: 600, color: '#1E293B' }}>{order.company_name || order.customer_name || 'N/A'}</span>
        </div>
      </div>
    </div>
  );
};
