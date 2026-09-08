'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getUserOrders, OrderRecord } from '@/lib/orders';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatPrice, formatDateSpanish, formatOrderNumber } from '@/lib/formatters';
import { resolveProductImageUrl, handleImageFallback } from '@/lib/images';
import { OrderStatusBadge } from '@/components/dashboard/orders/OrderStatusBadge';

// Helper to format item description / title (e.g. AROS OPTICOS ACETATO DUBROS CON ESTUCHE)
function getItemTitle(item: any): string {
  if (item.product?.description && item.product.description.trim()) {
    return item.product.description.toUpperCase();
  }
  const mat = (item.material || item.product?.material || 'ACETATO').toUpperCase();
  const brand = (item.brand || item.product?.brands?.name || 'DUBROS').toUpperCase();
  return `AROS OPTICOS ${mat} ${brand} CON ESTUCHE`;
}

// Helper to format eye size (e.g. 53, 54)
function getItemEyeSize(item: any): string {
  if (item.product?.eye_size && item.product.eye_size !== 0) {
    return String(item.product.eye_size);
  }
  const desc = item.product?.description || '';
  const match = desc.match(/\b(4[4-9]|5[0-9]|6[0-2])\b/);
  if (match) return match[1];
  return '53';
}

export default function MyOrdersPage() {
  const router = useRouter();
  const { isLoggedIn, isLoading } = useAuth();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    setLoading(true);
    const userOrders = await getUserOrders();
    setOrders(userOrders);
    setLoading(false);
  };

  useEffect(() => {
    if (!isLoading) {
      if (!isLoggedIn) {
        router.push('/login');
        return;
      }
      loadOrders();
    }
  }, [isLoggedIn, isLoading, router]);

  if (!isLoggedIn) return null;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1.5rem 5rem 1.5rem' }}>
      {/* BREADCRUMB */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', marginBottom: '2rem' }}>
        <Link href="/mi-cuenta" style={{ color: '#475569', textDecoration: 'none' }}>
          Mi cuenta
        </Link>
        <span style={{ color: '#94a3b8' }}>&gt;</span>
        <span style={{ fontWeight: 700, color: '#0f172a' }}>Mis pedidos</span>
      </div>

      {/* HEADER */}
      <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
            Mis pedidos
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Consulta tus pedidos recientes y su estado.
          </p>
        </div>

        <Link
          href="/catalogo"
          className="btn-primary"
          style={{ padding: '0.6rem 1.25rem', fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <ShoppingBag size={16} /> + Nuevo Pedido
        </Link>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748b' }}>
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
        <div>
          {/* COUNTER */}
          <div style={{ fontSize: '0.92rem', color: '#475569', marginBottom: '1.25rem' }}>
            {orders.length} encontrados
          </div>

          {/* ORDERS LIST */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {orders.map((order) => {
              const orderNumberDisplay = formatOrderNumber(order.order_number);

              return (
                <div
                  key={order.id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #f1f5f9',
                    borderRadius: '16px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    overflow: 'hidden',
                  }}
                >
                  {/* CARD HEADER ROW */}
                  <div
                    style={{
                      padding: '1.25rem 1.75rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1.25rem',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.2rem' }}>
                          Fecha del pedido:
                        </div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#1e293b' }}>
                          {formatDateSpanish(order.created_at, 'bubble')}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.2rem' }}>
                          Número de pedido:
                        </div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#1e293b' }}>
                          {orderNumberDisplay}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.2rem' }}>
                          Subtotal:
                        </div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#1e293b' }}>
                          {formatPrice(order.subtotal, true)}
                        </div>
                      </div>
                    </div>

                    <div>
                      <OrderStatusBadge status={order.status} size="md" />
                    </div>
                  </div>

                  {/* ITEMS IN ORDER */}
                  {order.order_items && order.order_items.length > 0 ? (
                    <div>
                      {order.order_items.map((item, idx) => {
                        const imageUrl = resolveProductImageUrl(item);
                        const title = getItemTitle(item);
                        const model = item.reference || item.code || item.product?.reference || 'N/A';
                        const eyeSize = getItemEyeSize(item);
                        const material = item.material || item.product?.material || 'Acetato';
                        const saleType = item.product?.sale_type || 'PIEZA';
                        const quantity = item.quantity || 1;

                        return (
                          <div
                            key={item.id || `${order.id}-${idx}`}
                            style={{
                              padding: '1.5rem 1.75rem',
                              borderTop: '1px solid #f1f5f9',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '1.75rem',
                              flexWrap: 'wrap',
                            }}
                          >
                            {/* THUMBNAIL IMAGE */}
                            <div
                              style={{
                                width: '130px',
                                height: '90px',
                                flexShrink: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#ffffff',
                                borderRadius: '8px',
                                overflow: 'hidden',
                              }}
                            >
                              <img
                                src={imageUrl}
                                alt={model}
                                onError={handleImageFallback}
                                style={{
                                  maxWidth: '100%',
                                  maxHeight: '100%',
                                  objectFit: 'contain',
                                }}
                              />
                            </div>

                            {/* ITEM INFO */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1, minWidth: '220px' }}>
                              <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1e293b', letterSpacing: '0.01em' }}>
                                {title}
                              </span>

                              <span style={{ fontSize: '0.84rem', color: '#475569' }}>
                                Modelo: {model}
                              </span>

                              {/* PILLS ROW */}
                              <div style={{ display: 'flex', gap: '0.45rem', margin: '0.15rem 0' }}>
                                <span
                                  style={{
                                    backgroundColor: '#f1f5f9',
                                    color: '#475569',
                                    padding: '0.2rem 0.65rem',
                                    borderRadius: '6px',
                                    fontSize: '0.76rem',
                                    fontWeight: 500,
                                  }}
                                >
                                  {eyeSize}
                                </span>
                                <span
                                  style={{
                                    backgroundColor: '#f1f5f9',
                                    color: '#475569',
                                    padding: '0.2rem 0.65rem',
                                    borderRadius: '6px',
                                    fontSize: '0.76rem',
                                    fontWeight: 500,
                                  }}
                                >
                                  {material}
                                </span>
                              </div>

                              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                                Tipo de venta: {saleType}
                              </span>

                              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                                Cantidad: {quantity}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ padding: '1.25rem 1.75rem', borderTop: '1px solid #f1f5f9', color: '#94a3b8', fontSize: '0.85rem' }}>
                      {order.total_items} piezas registradas
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
