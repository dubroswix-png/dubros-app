'use client';

import React from 'react';
import Link from 'next/link';
import { Package, Clock, CheckCircle, ExternalLink, RefreshCw } from 'lucide-react';

export default function MyOrdersPage() {
  const mockOrders = [
    {
      id: 'ord-101',
      orderNumber: 'DB-2026-089',
      date: '2026-07-22',
      itemsCount: 42,
      subtotal: 984.00,
      status: 'Completada',
      switchOrderNumber: 'SW-98214',
      switchSynced: true,
    },
    {
      id: 'ord-102',
      orderNumber: 'DB-2026-074',
      date: '2026-06-15',
      itemsCount: 24,
      subtotal: 516.00,
      status: 'Pendiente',
      switchOrderNumber: 'SW-95102',
      switchSynced: true,
    },
    {
      id: 'ord-103',
      orderNumber: 'DB-2026-012',
      date: '2026-04-03',
      itemsCount: 120,
      subtotal: 2840.50,
      status: 'Completada',
      switchOrderNumber: 'SW-89411',
      switchSynced: true,
    },
  ];

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 5rem 1.5rem' }}>
      
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>📦 Mis Pedidos Realizados</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Historial completo de tus compras y estado de sincronización con el sistema ERP Switch.
        </p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-light)' }}>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 700 }}>Nº Pedido</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 700 }}>Fecha</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 700 }}>Artículos</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 700 }}>Subtotal</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 700 }}>Estado</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 700 }}>ERP Switch</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 700, textAlign: 'right' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {mockOrders.map((order) => (
                <tr key={order.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700, color: 'var(--blue)' }}>
                    {order.orderNumber}
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)' }}>
                    {order.date}
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>
                    {order.itemsCount} piezas
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', fontWeight: 800 }}>
                    ${order.subtotal.toFixed(2)}
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <span
                      style={{
                        padding: '0.3rem 0.75rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: order.status === 'Completada' ? '#DCFCE7' : '#FEF3C7',
                        color: order.status === 'Completada' ? '#15803D' : '#B45309',
                      }}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <RefreshCw size={14} color="#16A34A" />
                      <span>{order.switchOrderNumber}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                    <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                      Ver Detalles
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
