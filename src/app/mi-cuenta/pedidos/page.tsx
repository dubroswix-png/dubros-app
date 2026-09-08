'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package, ShoppingBag, ChevronRight, Calendar, Layers, ExternalLink, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getUserOrders, OrderRecord } from '@/lib/orders';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatPrice, formatDateSpanish, formatOrderNumber } from '@/lib/formatters';
import { resolveProductImageUrl, handleImageFallback } from '@/lib/images';
import { OrderStatusBadge } from '@/components/dashboard/orders/OrderStatusBadge';

// Helper to format item description / title (e.g. AROS OPTICOS ACETATO DUBROS CON ESTUCHE)
function getItemTitle(item: any): string {
  if (item.product?.description && item.product.description.trim()) {
    return item.product.description;
  }
  const mat = (item.material || item.product?.material || 'Acetato').trim();
  const brand = (item.brand || item.product?.brands?.name || 'Dubros').trim();
  return `Montura ${brand} ${mat} ${item.reference || ''}`;
}

// Helper to format eye size (e.g. 53, 54)
function getItemEyeSize(item: any): string {
  if (item.product?.eye_size && item.product.eye_size !== 0) {
    return String(item.product.eye_size);
  }
  const desc = item.product?.description || '';
  const match = desc.match(/\b(4[4-9]|5[0-9]|6[0-2])\b/);
  if (match) return match[1];
  return '52';
}

export default function MyOrdersPage() {
  const router = useRouter();
  const { isLoggedIn, isLoading } = useAuth();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    const userOrders = await getUserOrders();
    setOrders(userOrders);
    setLoading(false);
  };

  useEffect(() => {
    if (!isLoading) {
      if (!isLoggedIn) {
        router.push('/login?redirect=/mi-cuenta/pedidos');
        return;
      }
      loadOrders();
    }
  }, [isLoggedIn, isLoading, router]);

  if (!isLoggedIn) return null;

  return (
    <div style={{ maxWidth: '1160px', margin: '0 auto', padding: '2rem 1.25rem 5rem 1.25rem' }}>
      {/* BREADCRUMB */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.85rem',
          marginBottom: '1.75rem',
          color: 'var(--text-tertiary)',
        }}
      >
        <Link href="/mi-cuenta" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500 }}>
          Mi cuenta
        </Link>
        <ChevronRight size={14} />
        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Mis pedidos</span>
      </div>

      {/* PAGE HEADER */}
      <div
        style={{
          marginBottom: '2.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: '1.25rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Mis Pedidos
            </h1>
            <span
              style={{
                backgroundColor: 'var(--blue-light)',
                color: 'var(--blue)',
                padding: '0.2rem 0.65rem',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: 700,
              }}
            >
              {orders.length} órdenes
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', margin: 0 }}>
            Historial de compras mayoristas, seguimiento de pedidos y estados de despacho.
          </p>
        </div>

        <Link
          href="/catalogo"
          className="btn-primary"
          style={{
            padding: '0.65rem 1.25rem',
            fontSize: '0.9rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <ShoppingBag size={16} /> + Nuevo Pedido
        </Link>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-tertiary)' }}>
          <div style={{ display: 'inline-block', marginBottom: '1rem' }}>
            <Package size={40} className="animate-pulse" color="var(--blue)" />
          </div>
          <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>Cargando tus pedidos...</p>
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Aún no tienes pedidos registrados"
          description="Explora nuestro catálogo B2B de monturas y genera tu primer pedido mayorista con precios exclusivos."
          actionLabel="Explorar Catálogo"
          onAction={() => router.push('/catalogo')}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {orders.map((order) => {
            const orderNumberDisplay = formatOrderNumber(order.order_number, true);
            const totalPieces = order.total_items || (order.order_items || []).reduce((acc, i) => acc + (i.quantity || 1), 0);

            return (
              <div key={order.id} className="order-card-modern">
                {/* CARD HEADER */}
                <div
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    padding: '1.25rem 1.5rem',
                    borderBottom: '1px solid var(--border-light)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  {/* Left: Order ID & Date */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span
                        style={{
                          fontSize: '1.15rem',
                          fontWeight: 800,
                          color: 'var(--navy)',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {orderNumberDisplay}
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.84rem',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <Calendar size={15} color="var(--text-tertiary)" />
                      <span>{formatDateSpanish(order.created_at, 'bubble')}</span>
                    </div>
                  </div>

                  {/* Right: Subtotal & Status */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
                        Subtotal ({totalPieces} pzs)
                      </span>
                      <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {formatPrice(order.subtotal, false)}
                      </span>
                    </div>

                    <OrderStatusBadge status={order.status} size="md" />
                  </div>
                </div>

                {/* ITEMS LIST */}
                {order.order_items && order.order_items.length > 0 ? (
                  <div>
                    {order.order_items.map((item, idx) => {
                      const imageUrl = resolveProductImageUrl(item);
                      const title = getItemTitle(item);
                      const model = item.reference || item.code || item.product?.reference || 'N/A';
                      const eyeSize = getItemEyeSize(item);
                      const material = item.material || item.product?.material || 'Acetato';
                      const brand = item.brand || item.product?.brands?.name || 'Dubros';
                      const quantity = item.quantity || 1;
                      const unitPrice = Number(item.unit_price || item.product?.price || 0);
                      const lineTotal = Number(item.total_price || unitPrice * quantity);

                      return (
                        <div key={item.id || `${order.id}-${idx}`} className="order-item-responsive">
                          {/* PRODUCT THUMBNAIL (CLICK TO ENLARGE) */}
                          <div
                            onClick={() => setPreviewImage({ url: imageUrl, title: `${brand} ${model}` })}
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
                              cursor: 'pointer',
                              overflow: 'hidden',
                              padding: '0.25rem',
                              position: 'relative',
                              transition: 'transform 0.2s ease',
                            }}
                            title="Haz clic para ampliar"
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
                            <div
                              style={{
                                position: 'absolute',
                                bottom: '2px',
                                right: '2px',
                                backgroundColor: 'rgba(15, 23, 42, 0.65)',
                                color: '#FFF',
                                borderRadius: '3px',
                                padding: '2px 4px',
                                fontSize: '0.62rem',
                                lineHeight: 1,
                              }}
                            >
                              <ExternalLink size={10} />
                            </div>
                          </div>

                          {/* PRODUCT INFO */}
                          <div style={{ flex: 1, minWidth: '180px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  fontWeight: 800,
                                  backgroundColor: 'var(--navy)',
                                  color: '#FFFFFF',
                                  padding: '0.15rem 0.5rem',
                                  borderRadius: 'var(--radius-sm)',
                                  letterSpacing: '0.04em',
                                  textTransform: 'uppercase',
                                }}
                              >
                                {brand}
                              </span>
                              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--blue)' }}>
                                {model}
                              </span>
                            </div>

                            <h3
                              style={{
                                fontSize: '0.96rem',
                                fontWeight: 600,
                                color: 'var(--text-primary)',
                                margin: '0 0 0.5rem 0',
                                lineHeight: 1.35,
                              }}
                            >
                              {title}
                            </h3>

                            {/* PILLS ROW */}
                            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                              <span
                                style={{
                                  backgroundColor: 'var(--bg-tertiary)',
                                  color: 'var(--text-secondary)',
                                  padding: '0.2rem 0.55rem',
                                  borderRadius: 'var(--radius-sm)',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                }}
                              >
                                Talla: {eyeSize}
                              </span>

                              <span
                                style={{
                                  backgroundColor: 'var(--bg-tertiary)',
                                  color: 'var(--text-secondary)',
                                  padding: '0.2rem 0.55rem',
                                  borderRadius: 'var(--radius-sm)',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                }}
                              >
                                {material}
                              </span>

                              <span
                                style={{
                                  backgroundColor: 'var(--bg-tertiary)',
                                  color: 'var(--text-secondary)',
                                  padding: '0.2rem 0.55rem',
                                  borderRadius: 'var(--radius-sm)',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                }}
                              >
                                PIEZA
                              </span>
                            </div>
                          </div>

                          {/* PRICING & QUANTITY COLUMN */}
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
                              {quantity} {quantity === 1 ? 'pieza' : 'piezas'} × {formatPrice(unitPrice, false)}
                            </div>
                            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                              {formatPrice(lineTotal, false)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ padding: '1.25rem', borderTop: '1px solid var(--border-light)', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                    {order.total_items} piezas en este pedido
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* IMAGE PREVIEW LIGHTBOX MODAL */}
      {previewImage && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            backdropFilter: 'blur(5px)',
          }}
          onClick={() => setPreviewImage(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '560px',
              width: '100%',
              padding: '1.5rem',
              position: 'relative',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewImage(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
              }}
            >
              <X size={22} />
            </button>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1rem 0', color: 'var(--text-primary)' }}>
              {previewImage.title}
            </h3>
            <div style={{ width: '100%', height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
              <img
                src={previewImage.url}
                alt={previewImage.title}
                onError={handleImageFallback}
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
