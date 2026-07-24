'use client';

import React from 'react';
import Link from 'next/link';
import { BlogPost } from '@/data/mock';
import { Calendar, User, ArrowRight } from 'lucide-react';

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div
        style={{
          width: '100%',
          height: '200px',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          marginBottom: '1.25rem',
          backgroundColor: '#F3F4F6',
        }}
      >
        <img
          src={post.featuredImageUrl}
          alt={post.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              fontSize: '0.8rem',
              color: 'var(--text-tertiary)',
              marginBottom: '0.75rem',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Calendar size={14} /> {post.publishedAt}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <User size={14} /> {post.author}
            </span>
          </div>

          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.75rem', lineHeight: '1.4' }}>
            <Link
              href={`/blog/${post.slug}`}
              style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseOver={(e) => (e.currentTarget.style.color = 'var(--blue)')}
              onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            >
              {post.title}
            </Link>
          </h2>

          <p
            style={{
              fontSize: '0.9rem',
              color: 'var(--text-secondary)',
              lineHeight: '1.6',
              marginBottom: '1.25rem',
            }}
          >
            {post.shortDescription}
          </p>
        </div>

        <Link
          href={`/blog/${post.slug}`}
          style={{
            fontSize: '0.9rem',
            fontWeight: 700,
            color: 'var(--blue)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            textDecoration: 'none',
          }}
        >
          Leer más <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  );
}
