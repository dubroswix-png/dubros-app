'use client';

import React from 'react';
import { Package, FileSpreadsheet, Calendar, User, ChevronRight } from 'lucide-react';
import { OrderRecord } from '@/lib/orders';
import { formatPrice, formatDateSpanish } from '@/lib/formatters';
import { downloadSwitchXLSX } from '@/lib/export-excel';
import { OrderStatusBadge } from './OrderStatusBadge';

export interface OrderListItemProps {
  order: OrderRecord;
  onClick: () => void;
}

export const OrderListItem: React.FC<OrderListItemProps> = ({ order, onClick }) => {
  const totalPieces = order.total_items || (order.order_items || []).reduce((acc, i) => acc + (i.quantity || 1), 0);
  const clientName = order.company_name || order.customer_name || 'Cliente';

  return (
    <div
      onClick={onClick}
      className="order-card-modern"
      style={{
        padding: '1.25rem 1.5rem',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      {/* Top Header Row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: order.switch_order_number ? '#ECFDF5' : 'var(--blue-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Package size={22} color={order.switch_order_number ? '#10B981' : 'var(--blue)'} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy)' }}>
                {order.order_number}
              </span>
              {order.switch_order_number && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#065F46',
                    backgroundColor: '#D1FAE5',
                    padding: '0.15rem 0.55rem',
                    borderRadius: '9999px',
                  }}
                >
                  ✓ Switch: #{order.switch_order_number}
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Calendar size={13} color="var(--text-tertiary)" />
              {formatDateSpanish(order.created_at, 'bubble')}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <OrderStatusBadge status={order.status} size="md" />
          <ChevronRight size={18} color="var(--text-tertiary)" />
        </div>
      </div>

      {/* Middle Responsive Stats Grid */}
      <div
        className="order-meta-grid"
        style={{
          padding: '0.85rem 1rem',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-light)',
        }}
      >
        <div>
          <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
            Subtotal
          </span>
          <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {formatPrice(order.subtotal, false)}
          </span>
        </div>

        <div>
          <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
            Artículos
          </span>
          <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {totalPieces} {totalPieces === 1 ? 'pieza' : 'piezas'}
          </span>
        </div>

        <div style={{ gridColumn: 'span 2' }}>
          <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
            Cliente / Empresa
          </span>
          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <User size={13} color="var(--blue)" />
            {clientName}
            {order.customer_email && (
              <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 400 }}>
                ({order.customer_email})
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Bottom Actions Row */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          className="btn-primary"
          style={{
            padding: '0.45rem 0.9rem',
            fontSize: '0.8rem',
            backgroundColor: '#059669',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontWeight: 700,
            borderRadius: 'var(--radius-sm)',
          }}
          onClick={(e) => downloadSwitchXLSX(order, e)}
          title="Descargar archivo Excel .xlsx para Switch ERP"
        >
          <FileSpreadsheet size={14} /> Excel Switch (.xlsx)
        </button>
      </div>
    </div>
  );
};
