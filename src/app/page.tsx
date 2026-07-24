'use client';

import React from 'react';
import Link from 'next/link';
import { MOCK_BRANDS, MOCK_COLLECTIONS, MOCK_BLOG_POSTS, MOCK_PRODUCTS } from '@/data/mock';
import { ArrowRight, ShieldCheck, Globe2, Truck, Award } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { ProductCard } from '@/components/catalog/ProductCard';
import { BlogCard } from '@/components/blog/BlogCard';

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem', paddingBottom: '4rem' }}>
      {/* 1. HERO SECTION */}
      <section
        style={{
          position: 'relative',
          minHeight: '580px',
          display: 'flex',
          alignItems: 'center',
          color: '#FFFFFF',
          padding: '5rem 0 6rem 0',
          overflow: 'hidden',
          backgroundImage:
            'linear-gradient(180deg, rgba(11, 26, 47, 0.75) 0%, rgba(11, 26, 47, 0.92) 100%), url("/images/hero-banner.jpg")',
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
              <Link
                href="/catalogo"
                className="btn-primary"
                style={{ padding: '1rem 2.25rem', fontSize: '1.05rem', boxShadow: '0 8px 25px rgba(26, 86, 219, 0.4)' }}
              >
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
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            {t('home.blog.title' as any)}
          </h2>
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
            <span style={{ color: 'var(--blue)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Dubros
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--text-primary)' }}>
              {t('home.brands.title' as any)}
            </h2>
          </div>
          <Link href="/marcas" style={{ color: 'var(--blue)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            {t('home.brands.viewAll' as any)} <ArrowRight size={16} />
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {MOCK_PRODUCTS.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. FEATURED COLLECTIONS */}
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
          {MOCK_COLLECTIONS.map((collection, idx) => (
            <div
              key={collection.id}
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
                  src={idx === 0 ? '/images/collection-titanium.jpg' : collection.imageUrl}
                  alt={collection.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                />
              </div>
              <div style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>{collection.name}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: '1.5' }}>
                  {collection.description}
                </p>
                <Link href={`/colecciones/${collection.id}`} className="btn-primary" style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem', width: 'fit-content' }}>
                  {t('home.collections.btn' as any)}
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
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>
              {t('why.title' as any)}
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {t('why.subtitle' as any)}
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '2rem',
            }}
          >
            <div className="card" style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', backgroundColor: '#E0E7FF', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--blue)' }}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>{t('why.1.title' as any)}</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {t('why.1.desc' as any)}
                </p>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', backgroundColor: '#E0E7FF', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--blue)' }}>
                <Globe2 size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>{t('why.2.title' as any)}</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {t('why.2.desc' as any)}
                </p>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', backgroundColor: '#E0E7FF', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--blue)' }}>
                <Truck size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>{t('why.3.title' as any)}</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {t('why.3.desc' as any)}
                </p>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', backgroundColor: '#E0E7FF', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--blue)' }}>
                <Award size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>{t('why.4.title' as any)}</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {t('why.4.desc' as any)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BLOG HIGHLIGHTS */}
      <section className="container">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            {t('home.blog.title' as any)}
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
          }}
        >
          {MOCK_BLOG_POSTS.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </section>
    </div>
  );
}
