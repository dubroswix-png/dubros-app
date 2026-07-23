'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MOCK_PRODUCTS } from '@/data/mock';
import { ShoppingCart, Trash2, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function CartPage() {
  const [orderCreated, setOrderCreated] = useState(false);
  const [cartItems, setCartItems] = useState([
    { product: MOCK_PRODUCTS[0], quantity: 12 },
    { product: MOCK_PRODUCTS[1], quantity: 6 },
    { product: MOCK_PRODUCTS[2], quantity: 24 },
  ]);

  const updateQuantity = (productId: string, delta: number) => {
    setCartItems(
      cartItems
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as { product: (typeof MOCK_PRODUCTS)[0]; quantity: number }[]
    );
  };

  const removeItem = (productId: string) => {
    setCartItems(cartItems.filter((item) => item.product.id !== productId));
  };

  const totalArticles = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const handleSendOrder = () => {
    setOrderCreated(true);
  };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 5rem 1.5rem' }}>
      
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>🛒 Mi Carrito de Pedido</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Revisa las piezas seleccionadas antes de enviar la orden a procesamiento.
        </p>
      </div>

      {orderCreated ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', maxWidth: '600px', margin: '0 auto' }}>
          <CheckCircle2 size={64} color="var(--green)" style={{ marginBottom: '1.25rem' }} />
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>¡Pedido Enviado Exitosamente!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
            Tu pedido #DB-2026-089 ha sido registrado. Nuestro sistema notificará al ERP <strong>Switch</strong> para la preparación del despacho.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link href="/mi-cuenta/pedidos" className="btn-primary">
              Ver Mis Pedidos
            </Link>
            <Link href="/catalogo" className="btn-secondary">
              Seguir Comprando
            </Link>
          </div>
        </div>
      ) : cartItems.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <ShoppingCart size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>Tu carrito está vacío</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Agrega productos desde el catálogo para generar un nuevo pedido.</p>
          <Link href="/catalogo" className="btn-primary">
            Ir al Catálogo
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
          
          {/* ITEMS LIST */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                    onClick={() => updateQuantity(product.id, -1)}
                    style={{ padding: '0.4rem 0.8rem', background: 'var(--bg-secondary)', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                  >
                    -
                  </button>
                  <span style={{ padding: '0.4rem 0.9rem', fontSize: '0.9rem', fontWeight: 700 }}>{quantity}</span>
                  <button
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
                    onClick={() => removeItem(product.id)}
                    style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', marginTop: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem' }}
                  >
                    <Trash2 size={14} /> Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* SUMMARY PANEL */}
          <div className="card" style={{ height: 'fit-content', padding: '1.75rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
              Resumen del Pedido
            </h2>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Total de Piezas:</span>
              <strong style={{ fontWeight: 700 }}>{totalArticles} piezas</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', fontSize: '0.95rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Subtotal Estimado:</span>
              <strong style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                ${subtotal.toFixed(2)}
              </strong>
            </div>

            <div
              style={{
                backgroundColor: 'var(--bg-secondary)',
                padding: '0.9rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
              }}
            >
              <ShieldCheck size={18} color="var(--blue)" style={{ flexShrink: 0 }} />
              <span>Despacho directo desde Zona Libre de Colón. Precios sin impuestos adicionales.</span>
            </div>

            <button
              onClick={handleSendOrder}
              className="btn-primary"
              style={{ width: '100%', padding: '0.9rem', fontSize: '1rem' }}
            >
              Enviar Pedido <ArrowRight size={18} />
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
