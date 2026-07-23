'use client';

import React from 'react';
import Link from 'next/link';
import { MOCK_BLOG_POSTS } from '@/data/mock';
import { Calendar, User, ArrowRight, Tag } from 'lucide-react';

export default function BlogListPage() {
  return (
    <div className="container" style={{ padding: '3rem 1.5rem 5rem 1.5rem' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3rem auto' }}>
        <span className="badge badge-blue" style={{ marginBottom: '0.5rem' }}>Blog & Novedades</span>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>
          Noticias y Tendencias de la Industria Óptica
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
          Mantente al día con consejos para tu óptica, innovaciones en materiales y análisis del mercado en Latinoamérica.
        </p>
      </div>

      {/* Grid of Posts */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '2rem',
        }}
      >
        {MOCK_BLOG_POSTS.map((post) => (
          <article
            key={post.id}
            className="card"
            style={{
              padding: 0,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ height: '220px', width: '100%', overflow: 'hidden' }}>
              <img
                src={post.featuredImageUrl}
                alt={post.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--blue)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        padding: '0.2rem 0.6rem',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.75rem', lineHeight: 1.3 }}>
                  {post.title}
                </h2>

                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                  {post.shortDescription}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                  <Calendar size={14} />
                  <span>{post.publishedAt}</span>
                </div>

                <Link
                  href={`/blog/${post.slug}`}
                  className="btn-primary"
                  style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
                >
                  Leer más <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
