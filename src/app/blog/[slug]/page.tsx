import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBlogPostBySlug } from '@/lib/blog';
import { Calendar, User, ArrowLeft } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: 'Artículo no encontrado | Blog Dubros Eyewear',
    };
  }

  const title = `${post.title} | Blog Dubros Eyewear`;
  const description = post.shortDescription || 'Artículo de tendencias y novedades en la industria óptica por Dubros Eyewear.';
  const imageUrl = post.featuredImageUrl || 'https://dubros.com/images/logo.png';

  return {
    title,
    description,
    keywords: post.tags || ['óptica', 'blog', 'Dubros Eyewear'],
    openGraph: {
      title,
      description,
      url: `https://dubros.com/blog/${post.slug}`,
      siteName: 'Dubros Eyewear',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      type: 'article',
      publishedTime: post.publishedAt,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function BlogPostDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const blogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    image: post.featuredImageUrl,
    datePublished: post.publishedAt,
    author: {
      '@type': 'Person',
      name: post.author || 'Dubros Eyewear',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Dubros Eyewear',
      logo: {
        '@type': 'ImageObject',
        url: 'https://dubros.com/images/logo.png',
      },
    },
    description: post.shortDescription,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
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
            color: 'var(--text-tertiary)',
            fontSize: '0.85rem',
            marginBottom: '2rem',
            paddingBottom: '1.5rem',
            borderBottom: '1px solid var(--border-light)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <User size={16} />
            <span>{post.author}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Calendar size={16} />
            <span>{post.publishedAt}</span>
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
    </>
  );
}
