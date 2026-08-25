import { supabase } from '@/lib/supabase';
import type { BlogPost } from '@/data/mock';
import bubbleBlog from '@/data/bubble_blog.json';

export const FALLBACK_BLOG_POSTS: BlogPost[] = bubbleBlog as BlogPost[];

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('published_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return FALLBACK_BLOG_POSTS;
    }

    return data.map((b) => ({
      id: b.id,
      title: b.title,
      shortDescription: b.summary || '',
      content: b.content || '',
      featuredImageUrl: b.image_url || '/images/blog-placeholder.jpg',
      tags: ['Óptica', 'Tendencias', 'Dubros', 'B2B'],
      slug: b.slug,
      publishedAt: b.published_at || new Date().toISOString(),
      author: b.author || 'Equipo Editorial Dubros',
    }));
  } catch (e) {
    console.error('[getBlogPosts] Unexpected error:', e);
    return FALLBACK_BLOG_POSTS;
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      return FALLBACK_BLOG_POSTS.find((p) => p.slug === slug) || null;
    }

    return {
      id: data.id,
      title: data.title,
      shortDescription: data.summary || '',
      content: data.content || '',
      featuredImageUrl: data.image_url || '/images/blog-placeholder.jpg',
      tags: ['Óptica', 'Tendencias', 'Dubros', 'B2B'],
      slug: data.slug,
      publishedAt: data.published_at || new Date().toISOString(),
      author: data.author || 'Equipo Editorial Dubros',
    };
  } catch (e) {
    console.error('[getBlogPostBySlug] Unexpected error:', e);
    return FALLBACK_BLOG_POSTS.find((p) => p.slug === slug) || null;
  }
}
