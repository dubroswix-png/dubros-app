'use client';

import React, { useState, useEffect } from 'react';
import { getBlogPosts } from '@/lib/blog';
import type { BlogPost } from '@/data/mock';
import { BlogCard } from '@/components/blog/BlogCard';
import bubbleTags from '@/data/bubble_tags.json';
import { Tag } from 'lucide-react';

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string>('all');

  useEffect(() => {
    async function load() {
      try {
        const data = await getBlogPosts();
        setPosts(data);
      } catch (err) {
        console.error('Error loading blog posts:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredPosts = selectedTag === 'all'
    ? posts
    : posts.filter(post =>
        post.title.toLowerCase().includes(selectedTag.toLowerCase()) ||
        post.shortDescription.toLowerCase().includes(selectedTag.toLowerCase()) ||
        post.content.toLowerCase().includes(selectedTag.toLowerCase()) ||
        (post.tags && post.tags.some(t => t.toLowerCase().includes(selectedTag.toLowerCase())))
      );

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 5rem 1.5rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 2.5rem auto' }}>
        <span className="badge badge-blue" style={{ marginBottom: '0.5rem' }}>Editorial B2B</span>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.75rem', fontFamily: 'var(--font-heading)' }}>
          Novedades y Tendencias Ópticas
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.6' }}>
          Información clave, análisis de marcas y estrategias comerciales para ópticas e importadores de la región.
        </p>
      </div>

      {/* TAGS FILTER BAR */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginBottom: '3rem',
          maxWidth: '900px',
          margin: '0 auto 3rem auto',
        }}
      >
        <button
          onClick={() => setSelectedTag('all')}
          style={{
            padding: '0.4rem 0.9rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-light)',
            backgroundColor: selectedTag === 'all' ? 'var(--blue)' : 'var(--bg-secondary)',
            color: selectedTag === 'all' ? '#FFFFFF' : 'var(--text-secondary)',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          Todos ({posts.length})
        </button>
        {(bubbleTags as string[]).slice(0, 15).map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(selectedTag === tag ? 'all' : tag)}
            style={{
              padding: '0.4rem 0.9rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-light)',
              backgroundColor: selectedTag === tag ? 'var(--blue)' : 'var(--bg-secondary)',
              color: selectedTag === tag ? '#FFFFFF' : 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontWeight: 500,
              cursor: 'pointer',
              textTransform: 'capitalize',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              transition: 'all 0.2s',
            }}
          >
            #{tag}
          </button>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '2rem',
        }}
      >
        {filteredPosts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
