'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Heart, ShoppingBag, Globe2, ShieldCheck, Award, Truck } from 'lucide-react';
import type { Product } from '@/data/mock';
import { ProductImageZoom } from '@/components/catalog/ProductImageZoom';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

interface ProductDetailClientProps {
  product: Product;
  suggestedProducts: Product[];
}

export function ProductDetailClient({ product, suggestedProducts }: ProductDetailClientProps) {
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { isLoggedIn } = useAuth();
  const { t } = useLanguage();

  const isFav = isFavorite(product.id);

  return (
    <div style={{ paddingBottom: '4rem' }}>
      <style>{`
        .pdp-main-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3.5rem;
          align-items: start;
        }
        .pdp-suggested-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }
        .pdp-specs-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.25rem;
          margin-bottom: 2rem;
        }
        .pdp-optical-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          text-align: center;
        }
        .pdp-optical-item {
          background-color: #FFFFFF;
          padding: 0.6rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-medium);
        }
        @media (max-width: 960px) {
          .pdp-main-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          .pdp-suggested-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 1rem !important;
          }
        }
        @media (max-width: 640px) {
          .pdp-container {
            padding-top: 1.25rem !important;
          }
          .pdp-title {
            font-size: 1.5rem !important;
          }
          .pdp-specs-grid {
            gap: 0.85rem !important;
            margin-bottom: 1.5rem !important;
          }
          .pdp-optical-grid {
            gap: 0.4rem !important;
          }
          .pdp-optical-item {
            padding: 0.4rem !important;
          }
          .pdp-optical-label {
            font-size: 0.65rem !important;
          }
          .pdp-optical-val {
            font-size: 0.9rem !important;
          }
          .pdp-suggested-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 0.75rem !important;
          }
          .pdp-add-cart-btn {
            width: 100% !important;
          }
        }
      `}</style>
      {/* Breadcrumbs */}
      <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '0.85rem 0', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-tertiary)', flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Inicio</Link>
          <ChevronRight size={14} />
          <Link href="/catalogo" style={{ color: 'inherit', textDecoration: 'none' }}>Catálogo</Link>
          <ChevronRight size={14} />
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{product.reference}</span>
        </div>
      </div>

      <div className="container pdp-container" style={{ paddingTop: '2.5rem' }}>
        <div className="pdp-main-grid">
          
          {/* Left: Product Images with Interactive Magnifier Zoom */}
          <div>
            <ProductImageZoom
              mainImage={product.largeImageUrl || product.thumbnailUrl}
              altText={product.reference}
              thumbnails={[product.largeImageUrl, product.thumbnailUrl, ...(product.extraImages || [])]}
            />
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

            <h1 className="pdp-title" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem', lineHeight: 1.2 }}>
              {product.reference}
            </h1>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
              {product.description}
            </p>

            <div className="pdp-specs-grid">
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
                <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {product.material && product.material !== '0' ? product.material : 'Metal'}
                </span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: '0.2rem' }}>Colección / Género</span>
                <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{product.gender}</span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: '0.2rem' }}>Flexibilidad</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: product.flex ? '#059669' : 'var(--text-primary)' }}>
                  {product.flex ? '🔄 Con Flex' : '🔒 Sin Flex'}
                </span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: '0.2rem' }}>Venta</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  👓 Por Pieza
                </span>
              </div>
            </div>

            {/* 3D Optical Dimensions Card */}
            {(product.eyeSize > 0 || product.bridgeSize || product.templeLength || product.frameSize) && (
              <div
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem 1.25rem',
                  marginBottom: '2rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy)' }}>
                    👓 Dimensiones Ópticas (ISO 8624 Boxing System)
                  </span>
                  {product.frameSize && (
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, backgroundColor: 'var(--navy)', color: '#FFF', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                      {product.frameSize}
                    </span>
                  )}
                </div>
                <div className="pdp-optical-grid">
                  <div className="pdp-optical-item">
                    <span className="pdp-optical-label" style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>👁️ Calibre (Ojo)</span>
                    <strong className="pdp-optical-val" style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>{product.eyeSize ? `${product.eyeSize} mm` : 'Estándar'}</strong>
                  </div>
                  <div className="pdp-optical-item">
                    <span className="pdp-optical-label" style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>👃 Puente Nasal</span>
                    <strong className="pdp-optical-val" style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>{product.bridgeSize ? `${product.bridgeSize} mm` : 'Estándar'}</strong>
                  </div>
                  <div className="pdp-optical-item">
                    <span className="pdp-optical-label" style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>📏 Varilla / Patilla</span>
                    <strong className="pdp-optical-val" style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>{product.templeLength ? `${product.templeLength} mm` : 'Estándar'}</strong>
                  </div>
                </div>
              </div>
            )}

            <div style={{ borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)', padding: '1.5rem 0', marginBottom: '2rem' }}>
              {isLoggedIn ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <span
                      style={{
                        display: 'block',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        color: 'var(--text-tertiary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.02em',
                      }}
                    >
                      Precio Unitario
                    </span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                      <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        ${product.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => addToCart(product, 1)}
                    className="btn-primary pdp-add-cart-btn" 
                    style={{ padding: '0.8rem 2rem', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
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
        <div style={{ backgroundColor: 'var(--bg-secondary)', marginTop: '4rem', padding: '3.5rem 0' }}>
          <div className="container">
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1.75rem', color: 'var(--text-primary)', textAlign: 'center' }}>
              {t('pdp.suggested' as any)}
            </h3>
            
            <div className="pdp-suggested-grid">
              {suggestedProducts.map((sp) => (
                <Link key={sp.id} href={`/catalogo/${sp.id}`} style={{ textDecoration: 'none' }}>
                  <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem 0.75rem', textAlign: 'center', height: '100%', transition: 'transform 0.2s', backgroundColor: '#FFF', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ width: '100%', height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                      <img src={sp.thumbnailUrl} alt={sp.reference} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: '0.3rem' }}>{sp.brand}</span>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.35rem 0', wordBreak: 'break-word' }}>{sp.reference}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Talla {sp.eyeSize}</span>
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
