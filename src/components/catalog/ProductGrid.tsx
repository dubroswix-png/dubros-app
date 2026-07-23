'use client';

import React from 'react';
import { Product } from '@/data/mock';
import { Heart, ShoppingCart, Search } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';

interface ProductGridProps {
  products: Product[];
  resetFilters: () => void;
}

export function ProductGrid({ products, resetFilters }: ProductGridProps) {
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();

  if (products.length === 0) {
    return (
      <div
        className="card"
        style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          color: 'var(--text-secondary)',
        }}
      >
        <Search size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          No se encontraron productos
        </h3>
        <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Intenta cambiando los términos de búsqueda o limpiando los filtros.
        </p>
        <button onClick={resetFilters} className="btn-secondary">
          Restablecer Filtros
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
              <img
                src={product.thumbnailUrl}
                alt={product.reference}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
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
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>{product.reference}</h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>
                  Cód: {product.code}
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {product.description}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Precio PIEZA</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>${product.price.toFixed(2)}</div>
                </div>
                <button
                  onClick={() => addToCart(product, 1)}
                  className="btn-primary"
                  style={{ padding: '0.45rem 0.8rem', fontSize: '0.85rem' }}
                >
                  <ShoppingCart size={16} /> Agregar
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
