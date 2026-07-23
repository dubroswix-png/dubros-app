'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/data/mock';
import { Heart, ShoppingBag, Eye, Search } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

interface ProductGridProps {
  products: Product[];
  resetFilters: () => void;
}

export function ProductGrid({ products, resetFilters }: ProductGridProps) {
  const { addItem } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { user } = useAuth();
  const { t } = useLanguage();

  if (products.length === 0) {
    return (
      <div
        className="card"
        style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <Search size={48} style={{ opacity: 0.3, marginBottom: '1rem', marginInline: 'auto' }} />
        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          {t('catalog.empty' as any)}
        </h3>
        <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
          {t('catalog.emptyDesc' as any)}
        </p>
        <button onClick={resetFilters} className="btn-secondary" style={{ padding: '0.6rem 1.25rem' }}>
          {t('catalog.resetFilters' as any)}
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '1.5rem',
      }}
    >
      {products.map((product) => {
        const isFav = isFavorite(product.id);
        return (
          <div key={product.id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
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
                />
              </Link>
              <button
                onClick={() => toggleFavorite(product.id)}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  backgroundColor: isFav ? '#FEE2E2' : 'rgba(255, 255, 255, 0.9)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '34px',
                  height: '34px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: isFav ? '#EF4444' : 'var(--text-tertiary)',
                  transition: 'all 0.2s ease',
                }}
                aria-label="Guardar en Favoritos"
              >
                <Heart size={18} fill={isFav ? '#EF4444' : 'none'} />
              </button>

              <span
                style={{
                  position: 'absolute',
                  bottom: '10px',
                  left: '10px',
                  backgroundColor: 'rgba(0, 0, 0, 0.75)',
                  color: '#FFFFFF',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '0.25rem 0.5rem',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                Talla {product.eyeSize}
              </span>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--blue)' }}>{product.brand}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{product.material}</span>
                </div>
                <Link href={`/catalogo/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem', transition: 'color 0.2s' }}
                      onMouseOver={(e) => (e.currentTarget.style.color = 'var(--blue)')}
                      onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}>
                    {product.reference}
                  </h3>
                </Link>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>
                  Cód: {product.code}
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {product.description}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)' }}>
                {user ? (
                  <>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Precio PIEZA</span>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>${product.price.toFixed(2)}</div>
                    </div>
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); addItem(product); }}
                      className="btn-primary"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                    >
                      <ShoppingBag size={16} /> {t('common.addCart' as any)}
                    </button>
                  </>
                ) : (
                  <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)' }}>
                      {t('common.price.locked' as any)}
                    </span>
                    <span className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                      <Eye size={16} /> {t('common.view' as any)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
