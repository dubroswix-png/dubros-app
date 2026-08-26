'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/data/mock';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { isLoggedIn, userProfile } = useAuth();
  const { t } = useLanguage();

  const isFav = isFavorite(product.id);
  const isAdmin = userProfile?.role === 'admin';

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '180px',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          marginBottom: '1rem',
          backgroundColor: '#F3F4F6',
        }}
      >
        <Link href={`/catalogo/${product.id}`} style={{ display: 'block', width: '100%', height: '100%' }}>
          <img
            src={product.thumbnailUrl}
            alt={product.reference}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { (e.target as HTMLImageElement).src = '/images/product-placeholder.png'; }}
          />
        </Link>

        {isAdmin && product.quantity > 0 && (
          <span
            style={{
              position: 'absolute',
              bottom: '8px',
              right: '8px',
              backgroundColor: 'rgba(7, 29, 58, 0.85)',
              backdropFilter: 'blur(3px)',
              color: '#93C5FD',
              fontSize: '0.62rem',
              fontWeight: 700,
              padding: '0.18rem 0.45rem',
              borderRadius: '4px',
              letterSpacing: '0.02em',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)',
              zIndex: 2,
            }}
          >
            Stock: {product.quantity}
          </span>
        )}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--blue)' }}>{product.brand}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{product.material}</span>
          </div>
          <Link href={`/catalogo/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <h3
              style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem', transition: 'color 0.2s' }}
              onMouseOver={(e) => (e.currentTarget.style.color = 'var(--blue)')}
              onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            >
              {product.reference}
            </h3>
          </Link>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>
            Cód: {product.code}
          </div>
          <p
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              marginBottom: '1rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {product.description}
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border-light)',
          }}
        >
          {isLoggedIn ? (
            <>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                  Precio PIEZA
                </span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  ${product.price.toFixed(2)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFavorite(product.id);
                  }}
                  style={{
                    backgroundColor: isFav ? '#FEE2E2' : 'var(--bg-secondary)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-md)',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: isFav ? '#EF4444' : 'var(--text-secondary)',
                    transition: 'all 0.2s ease',
                  }}
                  aria-label="Guardar en Favoritos"
                >
                  <Heart size={18} fill={isFav ? '#EF4444' : 'none'} />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addToCart(product);
                  }}
                  className="btn-primary"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                >
                  <ShoppingBag size={16} /> {t('common.addCart' as any)}
                </button>
              </div>
            </>
          ) : (
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)' }}>
                {t('common.price.locked' as any)}
              </span>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFavorite(product.id);
                  }}
                  style={{
                    backgroundColor: isFav ? '#FEE2E2' : 'var(--bg-secondary)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-md)',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: isFav ? '#EF4444' : 'var(--text-secondary)',
                    transition: 'all 0.2s ease',
                  }}
                  aria-label="Guardar en Favoritos"
                >
                  <Heart size={18} fill={isFav ? '#EF4444' : 'none'} />
                </button>
                <Link href={`/catalogo/${product.id}`} style={{ textDecoration: 'none' }}>
                  <span className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                    <Eye size={16} /> {t('common.view' as any)}
                  </span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
