import React from 'react';
import { MOCK_BLOG_POSTS } from '@/data/mock';
import { BlogCard } from '@/components/blog/BlogCard';

export const metadata = {
  title: 'Blog Óptico B2B | Dubros',
  description: 'Tendencias, consejos de mercado y guías para el sector óptico en Latinoamérica.',
};

export default function BlogPage() {
  return (
    <div className="container" style={{ padding: '3rem 1.5rem 5rem 1.5rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3rem auto' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.75rem', fontFamily: 'var(--font-heading)' }}>
          Novedades y Tendencias Ópticas
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.6' }}>
          Información clave, análisis de marcas y estrategias comerciales para ópticas e importadores de la región.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '2rem',
        }}
      >
        {MOCK_BLOG_POSTS.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
