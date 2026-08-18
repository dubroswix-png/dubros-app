'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MOCK_BLOG_POSTS } from '@/data/mock';
import { getFeaturedProducts, getBrands, getCollections, type SupabaseBrand, type SupabaseCollection } from '@/lib/products';
import { ArrowRight, ShieldCheck, Globe2, Truck, Award } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { ProductCard } from '@/components/catalog/ProductCard';
import { BlogCard } from '@/components/blog/BlogCard';
import { BrandItem } from '@/components/home/BrandItem';

export default function HomePage() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<any[]>([]);
  const [brands, setBrands] = useState<{ id: string; name: string; active?: boolean }[]>([]);
  const [collections, setCollections] = useState<SupabaseCollection[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [loadingCollections, setLoadingCollections] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [fetchedProducts, fetchedBrands, fetchedCollections] = await Promise.all([
          getFeaturedProducts(8),
          getBrands(),
          getCollections(),
        ]);
        setProducts(fetchedProducts);
        setBrands(fetchedBrands);
        setCollections(fetchedCollections);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoadingProducts(false);
        setLoadingBrands(false);
        setLoadingCollections(false);
      }
    }
    loadData();
  }, []);

  // Featured brands with real official logo images for the slider
  const marqueeBrands = [
    { id: 'b1', name: 'Weekend' },
    { id: 'b2', name: 'LCT' },
    { id: 'b3', name: 'Mask' },
    { id: 'b4', name: 'Giordanni' },
    { id: 'b5', name: 'Dubros' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5rem', paddingBottom: '5rem' }}>
      
      {/* 1. HERO SECTION */}
      <section
        style={{
          position: 'relative',
          minHeight: '580px',
          display: 'flex',
          alignItems: 'center',
          background: 'linear-gradient(rgba(11, 26, 47, 0.82), rgba(11, 26, 47, 0.88)), url("/images/hero-banner.jpg") center/cover no-repeat',
          color: '#FFFFFF',
          padding: '4rem 0',
        }}
      >
        <div className="container">
          <div style={{ maxWidth: '780px' }}>
            <span
              className="badge"
              style={{
                backgroundColor: 'rgba(26, 86, 219, 0.25)',
                color: '#60A5FA',
                border: '1px solid rgba(96, 165, 250, 0.3)',
                marginBottom: '1.25rem',
                fontSize: '0.85rem',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                fontWeight: 700,
                backdropFilter: 'blur(4px)',
              }}
            >
              {t('hero.badge' as any)}
            </span>
            
            <h1
              className="hero-title"
              style={{
                fontSize: '3.4rem',
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                marginBottom: '1.5rem',
                color: '#FFFFFF',
              }}
            >
              {t('hero.title' as any)}
            </h1>
            
            <p
              className="hero-subtitle"
              style={{
                fontSize: '1.2rem',
                lineHeight: 1.6,
                color: '#E2E8F0',
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

      {/* 2. BRANDS MOVING BANNER (MARQUEE) */}
      <section style={{ width: '100%', overflow: 'hidden' }}>
        <div className="container" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            {t('home.brands.title' as any)}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Distribución autorizada de las marcas más reconocidas en Latinoamérica
          </p>
        </div>

        {/* Continuous Smooth Scrolling Marquee */}
        <div className="marquee-container" style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
          <div className="marquee-track">
            {/* First Set */}
            {marqueeBrands.map((brand, idx) => (
              <BrandItem key={`b1-${brand.id || idx}`} name={brand.name} />
            ))}
            {/* Duplicated Set for Seamless Infinite Loop */}
            {marqueeBrands.map((brand, idx) => (
              <BrandItem key={`b2-${brand.id || idx}`} name={brand.name} />
            ))}
          </div>
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
              {t('home.featured.title' as any) || 'Productos Destacados'}
            </h2>
          </div>
          <Link href="/catalogo" style={{ color: 'var(--blue)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
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
          {loadingProducts ? (
            Array(8).fill(0).map((_, i) => (
              <div 
                key={i} 
                style={{ 
                  height: '380px', 
                  backgroundColor: 'var(--bg-secondary)', 
                  borderRadius: 'var(--radius-lg)',
                  animation: 'pulse 1.5s infinite ease-in-out'
                }} 
              />
            ))
          ) : (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
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
          {loadingCollections ? (
            Array(3).fill(0).map((_, i) => (
              <div
                key={i}
                style={{
                  height: '350px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-xl)',
                  animation: 'pulse 1.5s infinite ease-in-out',
                }}
              />
            ))
          ) : (
            collections.map((collection) => (
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
                <div style={{ height: '200px', width: '100%', overflow: 'hidden', backgroundColor: '#F3F4F6' }}>
                  <img
                    src={collection.imageUrl}
                    alt={collection.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                    onError={(e) => { (e.target as HTMLImageElement).src = '/images/product-placeholder.png'; }}
                  />
                </div>
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>{collection.name}</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: '1.5' }}>
                      {collection.description}
                    </p>
                  </div>
                  <Link href={`/catalogo?collection=${collection.id}`} className="btn-primary" style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem', width: 'fit-content' }}>
                    {t('home.collections.btn' as any)}
                  </Link>
                </div>
              </div>
            ))
          )}
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
