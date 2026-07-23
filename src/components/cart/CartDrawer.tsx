'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { X, Trash2, Plus, Minus, ShoppingCart, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';

export function CartDrawer() {
  const { isCartOpen, closeCart, cartItems: items, updateQuantity, removeFromCart, subtotal, totalArticles } = useCart();
  const { t } = useLanguage();

  // Prevent scrolling on body when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeCart}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 9998,
          opacity: isCartOpen ? 1 : 0,
          visibility: isCartOpen ? 'visible' : 'hidden',
          transition: 'opacity 0.3s ease, visibility 0.3s ease',
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '100%',
          maxWidth: '400px',
          height: '100%',
          backgroundColor: '#FFF',
          boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.1)',
          zIndex: 9999,
          transform: isCartOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingCart size={20} /> {t('cart.title' as any)}
          </h2>
          <button
            onClick={closeCart}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-tertiary)',
              padding: '0.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content (Scrollable) */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', paddingTop: '3rem' }}>
              <ShoppingCart size={48} style={{ opacity: 0.3, margin: '0 auto 1rem auto' }} />
              <p>{t('cart.empty' as any)}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {items.map((item) => (
                <div key={item.product.id} style={{ display: 'flex', gap: '1rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-light)' }}>
                  
                  {/* Image */}
                  <div style={{ width: '80px', height: '80px', backgroundColor: '#F9FAFB', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <img src={item.product.thumbnailUrl} alt={item.product.name} style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }} />
                  </div>

                  {/* Details */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-tertiary)' }}>{item.product.brand}</span>
                        <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.product.reference}</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t('cart.perPiece' as any)}: ${item.product.price.toFixed(2)}</span>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '0.2rem' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Quantity Controls */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' }}>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                        <button
                          onClick={() => updateQuantity(item.product.id, -1)}
                          style={{ background: 'none', border: 'none', padding: '0.3rem 0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        >
                          <Minus size={14} />
                        </button>
                        <span style={{ padding: '0 0.5rem', fontSize: '0.85rem', fontWeight: 600, minWidth: '30px', textAlign: 'center' }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, 1)}
                          style={{ background: 'none', border: 'none', padding: '0.3rem 0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.05rem' }}>
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer (Total and Checkout) */}
        {items.length > 0 && (
          <div style={{ padding: '1.5rem', backgroundColor: '#F9FAFB', borderTop: '1px solid var(--border-medium)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t('cart.references' as any)}:</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{totalArticles}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.1rem' }}>{t('cart.subtotal' as any)}:</span>
              <span style={{ fontWeight: 800, color: 'var(--blue)', fontSize: '1.4rem' }}>${subtotal.toFixed(2)}</span>
            </div>
            
            <Link href="/mi-cuenta/carrito" onClick={closeCart} style={{ textDecoration: 'none' }}>
              <button
                className="btn-primary"
                style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', marginBottom: '0.75rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
              >
                {t('cart.checkout' as any)} <ArrowRight size={18} />
              </button>
            </Link>
            
            <button
              onClick={closeCart}
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
                textDecoration: 'underline',
                cursor: 'pointer',
                padding: '0.5rem',
              }}
            >
              Ocultar
            </button>
          </div>
        )}
      </div>
    </>
  );
}
