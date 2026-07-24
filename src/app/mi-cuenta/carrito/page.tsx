'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Trash2, ArrowRight, CheckCircle2, ShieldCheck, MapPin, FileText, MessageSquare } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { createOrder } from '@/lib/orders';

export default function CartPage() {
  const router = useRouter();
  const { isLoggedIn, userProfile } = useAuth();
  const { cartItems, updateQuantity, removeFromCart, clearCart, totalArticles, subtotal } = useCart();
  
  const [shippingAddress, setShippingAddress] = useState(userProfile?.country ? `Ciudad de ${userProfile.country}` : '');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [createdOrder, setCreatedOrder] = useState<{
    orderNumber: string;
    whatsappUrl?: string;
  } | null>(null);

  React.useEffect(() => {
    if (!isLoggedIn) router.push('/login');
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return null;

  const handleSendOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    setLoading(true);
    setError(null);

    const result = await createOrder({
      cartItems,
      shippingAddress,
      notes,
    });

    setLoading(false);

    if (result.success && result.orderNumber) {
      setCreatedOrder({
        orderNumber: result.orderNumber,
        whatsappUrl: result.whatsappUrl,
      });
      clearCart();
    } else {
      setError(result.error || 'No se pudo procesar la orden.');
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 5rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>🛒 Mi Carrito de Pedido</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Revisa las piezas seleccionadas antes de enviar la orden a procesamiento.
        </p>
      </div>

      {createdOrder ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', maxWidth: '640px', margin: '0 auto' }}>
          <CheckCircle2 size={64} color="var(--green)" style={{ marginBottom: '1.25rem', marginInline: 'auto' }} />
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>¡Pedido Enviado Exitosamente!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
            Tu pedido <strong style={{ color: 'var(--blue)' }}>#{createdOrder.orderNumber}</strong> ha sido registrado. Nuestro sistema notificará al equipo comercial para la preparación del despacho.
          </p>

          {createdOrder.whatsappUrl && (
            <div style={{ marginBottom: '2rem' }}>
              <a
                href={createdOrder.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{
                  backgroundColor: '#25D366',
                  color: '#FFFFFF',
                  padding: '0.9rem 1.75rem',
                  fontSize: '1rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  boxShadow: '0 4px 14px rgba(37, 211, 102, 0.4)',
                  textDecoration: 'none',
                }}
              >
                <MessageSquare size={20} /> Enviar Confirmación por WhatsApp
              </a>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/mi-cuenta/pedidos" className="btn-secondary">
              Ver Mis Pedidos
            </Link>
            <Link href="/catalogo" className="btn-secondary">
              Seguir Comprando
            </Link>
          </div>
        </div>
      ) : cartItems.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <ShoppingCart size={48} style={{ opacity: 0.3, marginBottom: '1rem', marginInline: 'auto' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>Tu carrito está vacío</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Agrega productos desde el catálogo para generar un nuevo pedido.</p>
          <Link href="/catalogo" className="btn-primary">
            Ir al Catálogo
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSendOrder} style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem' }}>
          
          {/* ITEMS LIST */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {error && (
              <div style={{ padding: '0.9rem', backgroundColor: '#FEE2E2', color: '#EF4444', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.9rem' }}>
                {error}
              </div>
            )}

            {cartItems.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="card"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '90px 1fr auto auto',
                  gap: '1.25rem',
                  alignItems: 'center',
                }}
              >
                <img
                  src={product.thumbnailUrl}
                  alt={product.reference}
                  style={{ width: '90px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                />

                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--blue)' }}>{product.brand}</span>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{product.reference}</h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                    Cód: {product.code} | Talla {product.eyeSize} | {product.material}
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                    ${product.price.toFixed(2)} por pieza
                  </div>
                </div>

                {/* QUANTITY CONTROLS */}
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  <button
                    type="button"
                    onClick={() => updateQuantity(product.id, -1)}
                    style={{ padding: '0.4rem 0.8rem', background: 'var(--bg-secondary)', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                  >
                    -
                  </button>
                  <span style={{ padding: '0.4rem 0.9rem', fontSize: '0.9rem', fontWeight: 700 }}>{quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(product.id, 1)}
                    style={{ padding: '0.4rem 0.8rem', background: 'var(--bg-secondary)', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                  >
                    +
                  </button>
                </div>

                {/* ITEM TOTAL & DELETE */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                    ${(product.price * quantity).toFixed(2)}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(product.id)}
                    style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', marginTop: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem' }}
                  >
                    <Trash2 size={14} /> Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* SUMMARY & CHECKOUT FORM PANEL */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="card" style={{ padding: '1.75rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
                Datos de Entrega
              </h2>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={14} color="var(--blue)" /> Dirección / Destino de Entrega
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Zona Libre Colón, Manzana 5, Panamá"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.9rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--input-border)',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <FileText size={14} color="var(--blue)" /> Notas Especiales / Instrucciones
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej: Despachar antes del viernes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.9rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--input-border)',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Total de Piezas:</span>
                  <strong style={{ fontWeight: 700 }}>{totalArticles} piezas</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Subtotal Estimado:</span>
                  <strong style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    ${subtotal.toFixed(2)}
                  </strong>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  padding: '0.8rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                }}
              >
                <ShieldCheck size={16} color="var(--blue)" style={{ flexShrink: 0 }} />
                <span>Despacho directo desde Zona Libre de Colón. Precios B2B sin impuestos adicionales.</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Procesando...' : 'Enviar Pedido'} {!loading && <ArrowRight size={18} />}
              </button>
            </div>
          </div>

        </form>
      )}
    </div>
  );
}
