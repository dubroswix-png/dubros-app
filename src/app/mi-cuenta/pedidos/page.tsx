'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package, Clock, CheckCircle, ExternalLink, RefreshCw, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getUserOrders, OrderRecord } from '@/lib/orders';
import { EmptyState } from '@/components/ui/EmptyState';

export default function MyOrdersPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    const loadOrders = async () => {
      setLoading(true);
      const userOrders = await getUserOrders();
      setOrders(userOrders);
      setLoading(false);
    };

    loadOrders();
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return null;

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 5rem 1.5rem' }}>
      <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>📦 Historial de Pedidos</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Consulta el estado de tus compras y la sincronización con el sistema ERP.
          </p>
        </div>

        <Link href="/catalogo" className="btn-primary" style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}>
          + Nuevo Pedido
        </Link>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-tertiary)' }}>
          Cargando pedidos...
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Aún no tienes pedidos registrados"
          description="Explora nuestro catálogo B2B y genera tu primer pedido de armazones."
          actionLabel="Ir al Catálogo"
          onAction={() => router.push('/catalogo')}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.map((order) => (
            <div
              key={order.id}
              className="card"
              style={{
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
              }}
            >
              {/* HEADER ROW */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: '1rem',
                  borderBottom: '1px solid var(--border-light)',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy)' }}>
                      #{order.order_number}
                    </span>
                    <span
                      style={{
                        padding: '0.25rem 0.65rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor:
                          order.status === 'Completada'
                            ? '#DEF7EC'
                            : order.status === 'Cancelada'
                            ? '#FEE2E2'
                            : '#FEF08A',
                        color:
                          order.status === 'Completada'
                            ? '#03543F'
                            : order.status === 'Cancelada'
                            ? '#9B1C1C'
                            : '#713F12',
                      }}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                    Realizado el {new Date(order.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Subtotal</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    ${Number(order.subtotal).toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {order.total_items} piezas
                  </div>
                </div>
              </div>

              {/* ERP SWITCH STATUS BADGE */}
              <div
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.82rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <RefreshCw size={15} color="var(--blue)" />
                  <span>
                    Integración ERP <strong>Switch</strong>:
                  </span>
                  <span style={{ fontWeight: 700, color: order.switch_synced ? 'var(--green)' : 'var(--text-secondary)' }}>
                    {order.switch_synced ? `Sincronizado (${order.switch_order_number || 'SW-OK'})` : 'En cola de sincronización'}
                  </span>
                </div>
                {order.shipping_address && (
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
                    Destino: {order.shipping_address}
                  </span>
                )}
              </div>

              {/* ITEMS BREAKDOWN */}
              {order.order_items && order.order_items.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                    Detalle de Piezas ({order.order_items.length} modelos)
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
                    {order.order_items.map((item) => (
                      <div
                        key={item.id || item.product_id}
                        style={{
                          padding: '0.65rem 0.85rem',
                          backgroundColor: 'var(--bg-primary)',
                          border: '1px solid var(--border-light)',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.82rem',
                        }}
                      >
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.reference}</div>
                        <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>
                          {item.brand} | Cód: {item.code}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.35rem', fontWeight: 600 }}>
                          <span>{item.quantity} pzs x ${Number(item.unit_price).toFixed(2)}</span>
                          <span style={{ color: 'var(--blue)' }}>${Number(item.total_price).toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
