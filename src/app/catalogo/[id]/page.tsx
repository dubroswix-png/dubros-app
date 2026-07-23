'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ShoppingBag, Truck, ShieldCheck, Globe2, Award, ChevronRight, Heart } from 'lucide-react';
import { MOCK_PRODUCTS } from '@/data/mock';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { isLoggedIn } = useAuth();
  const { t } = useLanguage();
  
  const product = MOCK_PRODUCTS.find((p) => p.id === params.id);
  
  if (!product) {
    notFound();
  }

  const isFav = isFavorite(product.id);

  // Suggested products (same brand or category, excluding current)
  const suggestedProducts = useMemo(() => {
    return MOCK_PRODUCTS
      .filter((p) => p.id !== product.id && (p.brand === product.brand || p.categoryId === product.categoryId))
      .slice(0, 4);
  }, [product.id, product.brand, product.categoryId]);

  return (
    <div style={{ paddingBottom: '4rem' }}>
      {/* Breadcrumbs */}
      <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem 0', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
          <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Inicio</Link>
          <ChevronRight size={14} />
          <Link href="/catalogo" style={{ color: 'inherit', textDecoration: 'none' }}>Catálogo</Link>
          <ChevronRight size={14} />
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{product.name}</span>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start' }}>
          
          {/* Left: Product Images */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ 
              backgroundColor: '#F9FAFB', 
              borderRadius: 'var(--radius-lg)', 
              padding: '3rem', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              border: '1px solid var(--border-light)',
              minHeight: '400px'
            }}>
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                style={{ width: '100%', maxWidth: '400px', height: 'auto', objectFit: 'contain' }}
              />
            </div>
            
            {/* Thumbnails (mocked by duplicating the same image) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
              {[product.imageUrl, product.thumbnailUrl, product.imageUrl].map((img, idx) => (
                <div key={idx} style={{ 
                  backgroundColor: '#F9FAFB', 
                  borderRadius: 'var(--radius-md)', 
                  padding: '1rem', 
                  cursor: 'pointer',
                  border: idx === 0 ? '2px solid var(--blue)' : '1px solid var(--border-light)'
                }}>
                  <img src={img} alt={`Thumbnail ${idx}`} style={{ width: '100%', height: 'auto' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Right: Product Details */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <span style={{ backgroundColor: 'var(--text-primary)', color: '#FFF', padding: '0.2rem 0.6rem', fontSize: '0.75rem', fontWeight: 700, borderRadius: 'var(--radius-sm)' }}>
                {product.brand}
              </span>
              <button
                onClick={() => toggleFavorite(product.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: isFav ? 'var(--error)' : 'var(--text-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Heart size={24} fill={isFav ? 'currentColor' : 'none'} />
              </button>
            </div>

            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem', lineHeight: 1.2 }}>
              {product.name}
            </h1>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              {product.description}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: '0.2rem' }}>{t('pdp.model' as any)}</span>
                  <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{product.reference}</span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: '0.2rem' }}>{t('pdp.brand' as any)}</span>
                  <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{product.brand}</span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: '0.2rem' }}>{t('pdp.material' as any)}</span>
                  <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{product.material}</span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: '0.2rem' }}>{t('pdp.size' as any)}</span>
                  <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{product.eyeSize}-{product.bridgeSize}-{product.templeLength}</span>
                </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)', padding: '1.5rem 0', marginBottom: '2rem' }}>
              {isLoggedIn ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Precio PIEZA</span>
                    <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>${product.price.toFixed(2)}</span>
                  </div>
                  <button 
                    onClick={() => addToCart(product, 1)}
                    className="btn-primary" 
                    style={{ padding: '0.8rem 2rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <ShoppingBag size={20} /> Agregar al carrito
                  </button>
                </div>
              ) : (
                <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: '0.75rem' }}>
                    {t('common.price.locked.full' as any)}
                  </span>
                  <Link href="/login" className="btn-secondary" style={{ padding: '0.5rem 1.5rem', display: 'inline-block' }}>
                    {t('nav.login' as any)}
                  </Link>
                </div>
              )}
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <Globe2 size={20} color="var(--blue)" />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{t('pdp.benefit.shipping' as any)}</span>
              </li>
              <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <ShieldCheck size={20} color="var(--blue)" />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{t('pdp.benefit.warranty' as any)}</span>
              </li>
              <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <Award size={20} color="var(--blue)" />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{t('pdp.benefit.durability' as any)}</span>
              </li>
              <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <Truck size={20} color="var(--blue)" />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{t('pdp.benefit.support' as any)}</span>
              </li>
            </ul>

          </div>
        </div>
      </div>

      {/* Suggested Products Section */}
      {suggestedProducts.length > 0 && (
        <div style={{ backgroundColor: 'var(--bg-secondary)', marginTop: '5rem', padding: '4rem 0' }}>
          <div className="container">
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '2rem', color: 'var(--text-primary)', textAlign: 'center' }}>
              {t('pdp.suggested' as any)}
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
              {suggestedProducts.map((sp) => (
                <Link key={sp.id} href={`/catalogo/${sp.id}`} style={{ textDecoration: 'none' }}>
                  <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem', textAlign: 'center', height: '100%', transition: 'transform 0.2s', backgroundColor: '#FFF' }}>
                    <div style={{ width: '100%', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                      <img src={sp.thumbnailUrl} alt={sp.reference} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>{sp.brand}</span>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>{sp.reference}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Talla {sp.eyeSize}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
