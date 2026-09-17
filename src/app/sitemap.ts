import type { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';
import { getBlogPosts } from '@/lib/blog';

const BASE_URL = 'https://dubros.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/catalogo`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/contacto`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  // Dynamic products
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const { data: products } = await supabase
      .from('products')
      .select('id, updated_at')
      .eq('active', true);

    if (products && products.length > 0) {
      productRoutes = products.map((p) => ({
        url: `${BASE_URL}/catalogo/${p.id}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
    }
  } catch (err) {
    console.error('Error generating product sitemap:', err);
  }

  // Dynamic blog posts
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const posts = await getBlogPosts();
    if (posts && posts.length > 0) {
      blogRoutes = posts.map((post) => ({
        url: `${BASE_URL}/blog/${post.slug}`,
        lastModified: post.publishedAt ? new Date(post.publishedAt) : new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      }));
    }
  } catch (err) {
    console.error('Error generating blog sitemap:', err);
  }

  return [...staticRoutes, ...productRoutes, ...blogRoutes];
}
