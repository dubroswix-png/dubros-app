import React from 'react';
import Link from 'next/link';
import { MOCK_BLOG_POSTS } from '@/data/mock';
import { Calendar, User, ArrowLeft } from 'lucide-react';

export default async function BlogPostDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const post = MOCK_BLOG_POSTS.find((p) => p.slug === resolvedParams.slug) || MOCK_BLOG_POSTS[0];

  return (
    <article className="container" style={{ maxWidth: '800px', padding: '3rem 1.5rem 5rem 1.5rem' }}>
      <Link
        href="/blog"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: 'var(--blue)',
          fontSize: '0.9rem',
          fontWeight: 600,
          marginBottom: '2rem',
        }}
      >
        <ArrowLeft size={16} /> Volver al Blog
      </Link>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {post.tags.map((tag) => (
          <span
            key={tag}
            style={{
              backgroundColor: 'var(--blue-light)',
              color: 'var(--blue)',
              fontSize: '0.8rem',
              fontWeight: 700,
              padding: '0.25rem 0.75rem',
              borderRadius: 'var(--radius-full)',
            }}
          >
            #{tag}
          </span>
        ))}
      </div>

      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1.25rem' }}>
        {post.title}
      </h1>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          fontSize: '0.9rem',
          color: 'var(--text-secondary)',
          paddingBottom: '1.5rem',
          borderBottom: '1px solid var(--border-light)',
          marginBottom: '2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <User size={16} /> {post.author}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Calendar size={16} /> {post.publishedAt}
        </div>
      </div>

      <div
        style={{
          width: '100%',
          height: '380px',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          marginBottom: '2.5rem',
        }}
      >
        <img src={post.featuredImageUrl} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      <div
        style={{
          fontSize: '1.1rem',
          lineHeight: '1.8',
          color: 'var(--text-primary)',
        }}
      >
        <p style={{ marginBottom: '1.5rem' }}>{post.shortDescription}</p>
        <p style={{ marginBottom: '1.5rem' }}>
          En el competitivo sector óptico latinoamericano, seleccionar los socios de distribución y las colecciones adecuadas resulta fundamental para mantener márgenes saludables y clientes satisfechos. Durante los últimos años, la demanda de aros ópticos ultraligeros como el titanio y el TR90 ha crecido un 35% en mercados clave como Colombia, Panamá y México.
        </p>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, margin: '2rem 0 1rem 0' }}>
          Factores clave para la selección de inventario
        </h2>
        <p style={{ marginBottom: '1.5rem' }}>
          1. <strong>Calidad del Flex:</strong> Las bisagras con resorte garantizan una vida útil más prolongada del marco.<br/>
          2. <strong>Diversidad de Tallas:</strong> Mantener una variedad de tallas oculares (desde 50 hasta 58 mm) asegura cubrir diferentes perfiles anatómicos.<br/>
          3. <strong>Respaldo de Garantía:</strong> Trabajar con distribuidores consolidados como Dubros evita pérdidas por defectos de origen.
        </p>
      </div>
    </article>
  );
}
