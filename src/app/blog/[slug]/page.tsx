import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBlogPostBySlug } from '@/lib/blog';
import { Calendar, User, ArrowLeft } from 'lucide-react';

export default async function BlogPostDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const post = await getBlogPostBySlug(resolvedParams.slug);

  if (!post) {
    notFound();
  }

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
        className="blog-post-content"
        style={{
          fontSize: '1.1rem',
          lineHeight: '1.8',
          color: 'var(--text-primary)',
        }}
      >
        {post.content ? (
          <div
            dangerouslySetInnerHTML={{ __html: post.content }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          />
        ) : (
          <div>
            <p style={{ marginBottom: '1.5rem' }}>{post.shortDescription}</p>
          </div>
        )}
      </div>
    </article>
  );
}
