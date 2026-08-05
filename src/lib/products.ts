// =============================================================================
// Products Library — Supabase Queries
// =============================================================================
// Shared functions for fetching real products, brands, and categories from
// Supabase. Used by the catalog page, homepage, and admin dashboard.
// =============================================================================

import { supabase } from '@/lib/supabase';
import type { Product } from '@/data/mock';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SupabaseProduct {
  id: string;
  reference: string;
  code: string;
  description: string;
  price: number;
  material: string;
  quantity: number;
  sale_type: string;
  thumbnail_url: string;
  large_image_url: string;
  brand_id: string | null;
  category_id: string | null;
  erp_article_id: number | null;
  created_at?: string;
  brands?: { id: string; name: string } | null;
  categories?: { id: string; name: string } | null;
}

export interface SupabaseBrand {
  id: string;
  name: string;
  active?: boolean;
}

export interface SupabaseCategory {
  id: string;
  name: string;
  slug?: string;
}

export interface GetProductsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  brandName?: string;
  categoryName?: string;
  material?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface GetProductsResult {
  products: Product[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ---------------------------------------------------------------------------
// Convert Supabase row → Product interface (compatible with existing components)
// ---------------------------------------------------------------------------

function mapSupabaseToProduct(row: SupabaseProduct): Product {
  return {
    id: row.id,
    reference: row.reference || row.code || '',
    code: row.code || row.reference || '',
    description: row.description || '',
    price: row.price || 0,
    eyeSize: 0, // Not stored in Supabase currently
    brand: row.brands?.name || '',
    material: row.material || 'N/A',
    gender: 'Unisex' as const, // Default — not stored in current schema
    saleType: row.sale_type || 'PIEZA',
    category: row.categories?.name || '',
    quantity: row.quantity || 0,
    flex: false,
    thumbnailUrl: row.thumbnail_url || '/images/product-placeholder.png',
    largeImageUrl: row.large_image_url || '/images/product-placeholder.png',
  };
}

// ---------------------------------------------------------------------------
// Fetch products with pagination and filters
// ---------------------------------------------------------------------------

export async function getProducts({
  page = 1,
  pageSize = 24,
  search,
  brandName,
  categoryName,
  material,
  minPrice,
  maxPrice,
}: GetProductsParams = {}): Promise<GetProductsResult> {
  try {
    // Build base query
    let query = supabase
      .from('products')
      .select('*, brands(id, name), categories(id, name)', { count: 'exact' });

    // Apply search filter
    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      query = query.or(`reference.ilike.${term},code.ilike.${term},description.ilike.${term}`);
    }

    // Apply material filter
    if (material && material !== 'all') {
      query = query.ilike('material', `%${material}%`);
    }

    // Apply price range filters
    if (minPrice !== undefined) {
      query = query.gte('price', minPrice);
    }
    if (maxPrice !== undefined) {
      query = query.lte('price', maxPrice);
    }

    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to).order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      console.error('[getProducts] Supabase error:', error);
      return { products: [], totalCount: 0, page, pageSize, totalPages: 0 };
    }

    let products = (data || []).map(mapSupabaseToProduct);

    // Client-side filters for joined fields (brand and category names)
    if (brandName && brandName !== 'all') {
      products = products.filter(
        (p) => p.brand.toUpperCase() === brandName.toUpperCase()
      );
    }
    if (categoryName && categoryName !== 'all') {
      products = products.filter(
        (p) => p.category.toUpperCase() === categoryName.toUpperCase()
      );
    }

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / pageSize) || 1;

    return { products, totalCount, page, pageSize, totalPages };
  } catch (e) {
    console.error('[getProducts] Unexpected error:', e);
    return { products: [], totalCount: 0, page, pageSize, totalPages: 0 };
  }
}

// ---------------------------------------------------------------------------
// Fetch featured products for homepage (latest N products with images)
// ---------------------------------------------------------------------------

export async function getFeaturedProducts(limit: number = 8): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, brands(id, name), categories(id, name)')
      .not('thumbnail_url', 'is', null)
      .not('thumbnail_url', 'eq', '/images/product-placeholder.png')
      .gt('price', 0)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[getFeaturedProducts] Error:', error);
      // Fallback: get any products
      const fallback = await supabase
        .from('products')
        .select('*, brands(id, name), categories(id, name)')
        .gt('price', 0)
        .order('created_at', { ascending: false })
        .limit(limit);

      return (fallback.data || []).map(mapSupabaseToProduct);
    }

    return (data || []).map(mapSupabaseToProduct);
  } catch (e) {
    console.error('[getFeaturedProducts] Unexpected error:', e);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Fetch all brands from Supabase
// ---------------------------------------------------------------------------

export async function getBrands(): Promise<SupabaseBrand[]> {
  try {
    const { data, error } = await supabase
      .from('brands')
      .select('id, name, active')
      .order('name', { ascending: true });

    if (error) {
      console.error('[getBrands] Error:', error);
      return [];
    }

    return data || [];
  } catch (e) {
    console.error('[getBrands] Unexpected error:', e);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Fetch all categories from Supabase
// ---------------------------------------------------------------------------

export async function getCategories(): Promise<SupabaseCategory[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug')
      .order('name', { ascending: true });

    if (error) {
      console.error('[getCategories] Error:', error);
      return [];
    }

    return data || [];
  } catch (e) {
    console.error('[getCategories] Unexpected error:', e);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Fetch unique materials from products
// ---------------------------------------------------------------------------

export async function getMaterials(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('material')
      .not('material', 'is', null)
      .not('material', 'eq', 'N/A');

    if (error) {
      console.error('[getMaterials] Error:', error);
      return [];
    }

    const unique = [...new Set((data || []).map((d) => d.material).filter(Boolean))].sort();
    return unique;
  } catch (e) {
    console.error('[getMaterials] Unexpected error:', e);
    return [];
  }
}
