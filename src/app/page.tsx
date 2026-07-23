'use client';

import React from 'react';
import Link from 'next/link';
import { MOCK_BRANDS, MOCK_COLLECTIONS, MOCK_BLOG_POSTS, MOCK_PRODUCTS } from '@/data/mock';
import { ArrowRight, ShieldCheck, Globe2, Truck, Award, Sparkles, Eye, Heart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export default function HomePage() {
  const { isLoggedIn } = useAuth();
  const { t } = useLanguage();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem', paddingBottom: '4rem' }}>
      
      {/* 1. HIGH-FIDELITY HERO SECTION WITH GENERATED VISUAL ASSET */}
      <section
        style={{
          position: 'relative',
          minHeight: '580px',
          display: 'flex',
          alignItems: 'center',
          color: '#FFFFFF',
          padding: '5rem 0 6rem 0',
          overflow: 'hidden',
          backgroundImage: 'linear-gradient(180deg, rgba(11, 26, 47, 0.75) 0%, rgba(11, 26, 47, 0.92) 100%), url("/images/hero-banner.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: '780px' }}>

            <h1
              style={{
                color: '#FFFFFF',
                fontSize: 'clamp(2.5rem, 5.5vw, 4.2rem)',
                fontWeight: 800,
                lineHeight: 1.1,
                marginBottom: '1.5rem',
                fontFamily: 'var(--font-heading)',
                letterSpacing: '-0.02em',
                textShadow: '0 4px 20px rgba(0,0,0,0.5)',
              }}
            >
              {t('hero.title' as any)}
            </h1>

            <p
              style={{
                fontSize: '1.25rem',
                lineHeight: 1.6,
                color: 'rgba(255, 255, 255, 0.9)',
                marginBottom: '2.5rem',
                maxWidth: '680px',
              }}
            >
              {t('hero.subtitle' as any)}
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link href="/catalogo" className="btn-primary" style={{ padding: '1rem 2.25rem', fontSize: '1.05rem', boxShadow: '0 8px 25px rgba(26, 86, 219, 0.4)' }}>
                {t('hero.btn.catalog' as any)} <ArrowRight size={20} />
              </Link>
              <Link
                href="/contacto"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  color: '#FFFFFF',
                  padding: '1rem 2.25rem',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 600,
                  fontSize: '1.05rem',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                {t('hero.btn.contact' as any)}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. BRANDS BAR */}
      <section className="container">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-tertiary)' }}>
            Nuestras Marcas Exclusivas
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '2.5rem',
            flexWrap: 'wrap',
            padding: '1.5rem',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-light)',
          }}
        >
          {MOCK_BRANDS.map((brand) => (
            <div
              key={brand.id}
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 800,
                fontSize: '1.4rem',
                letterSpacing: '0.05em',
                color: 'var(--text-secondary)',
                opacity: 0.85,
                transition: 'opacity 0.2s, color 0.2s',
                cursor: 'pointer',
              }}
            >
              {brand.name}
            </div>
          ))}
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS PREVIEW */}
      <section className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
          <div>
            <span className="badge badge-blue" style={{ marginBottom: '0.5rem' }}>Destacados</span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Modelos Más Solicitados</h2>
          </div>
          <Link href="/catalogo" className="btn-secondary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}>
            Ver todo el catálogo <ArrowRight size={16} />
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {MOCK_PRODUCTS.slice(0, 4).map((product) => (
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
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#EF4444',
                  }}
                  aria-label="Agregar a Favoritos"
                >
                  <Heart size={16} />
                </button>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--blue)' }}>{product.brand}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{product.material}</span>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{product.reference}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {product.description}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)' }}>
                  {isLoggedIn ? (
                    <>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Precio por {product.saleType}</span>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>${product.price.toFixed(2)}</div>
                      </div>
                      <Link href={`/catalogo`} className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                        <Eye size={16} /> Ver
                      </Link>
                    </>
                  ) : (
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)' }}>
                        🔒 Inicia sesión para ver precio
                      </span>
                      <Link href={`/catalogo`} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                        <Eye size={16} /> Ver
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. FEATURED COLLECTIONS WITH HIGH-FIDELITY IMAGE */}
      <section className="container">
        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 2.5rem auto' }}>
          <span className="badge badge-blue" style={{ marginBottom: '0.5rem' }}>Colecciones</span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Líneas de Diseño Exclusivas</h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
          }}
        >
          {MOCK_COLLECTIONS.map((col, idx) => (
            <div
              key={col.id}
              className="card"
              style={{
                padding: 0,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ height: '200px', width: '100%', overflow: 'hidden' }}>
                <img
                  src={idx === 0 ? '/images/collection-titanium.jpg' : col.imageUrl}
                  alt={col.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                />
              </div>
              <div style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>{col.name}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: '1.5' }}>
                  {col.description}
                </p>
                <Link href="/catalogo" className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                  Explorar Colección
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. COMMITMENT / WHY CHOOSE US */}
      <section style={{ backgroundColor: 'var(--bg-secondary)', padding: '5rem 0', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3.5rem auto' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '1rem' }}>Por qué las ópticas eligen Dubros</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Comprometidos con la excelencia en el suministro y la atención personalizada para tu óptica.</p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '2rem',
            }}
          >
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', backgroundColor: 'var(--blue-light)', color: 'var(--blue)', marginBottom: '1.25rem' }}>
                <ShieldCheck size={32} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Garantía Directa</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Respaldo completo de fábrica en cada pieza distribuida.
              </p>
            </div>

            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', backgroundColor: 'var(--blue-light)', color: 'var(--blue)', marginBottom: '1.25rem' }}>
                <Globe2 size={32} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Cobertura LATAM</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Envíos asegurados y eficientes a más de 12 países de la región.
              </p>
            </div>

            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', backgroundColor: 'var(--blue-light)', color: 'var(--blue)', marginBottom: '1.25rem' }}>
                <Truck size={32} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Despacho Rápido</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Procesamiento ágil desde Zona Libre de Colón para recibir a tiempo.
              </p>
            </div>

            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', backgroundColor: 'var(--blue-light)', color: 'var(--blue)', marginBottom: '1.25rem' }}>
                <Award size={32} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>25+ Años</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Trayectoria sólida y confianza demostrada en el sector óptico.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BLOG HIGHLIGHTS */}
      <section className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
          <div>
            <span className="badge badge-blue" style={{ marginBottom: '0.5rem' }}>Novedades</span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Artículos Recientes del Blog</h2>
          </div>
          <Link href="/blog" className="btn-secondary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}>
            Ir al Blog <ArrowRight size={16} />
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
          }}
        >
          {MOCK_BLOG_POSTS.map((post) => (
            <div key={post.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ height: '180px', width: '100%' }}>
                <img src={post.featuredImageUrl} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '1.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--blue)', fontWeight: 700 }}>{post.publishedAt}</span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0.5rem 0' }}>{post.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.5' }}>
                  {post.shortDescription}
                </p>
                <Link href={`/blog/${post.slug}`} style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--blue)' }}>
                  Leer artículo →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
