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
  gender?: string | null;
  quantity: number;
  sale_type: string;
  thumbnail_url: string;
  large_image_url: string;
  brand_id: string | null;
  category_id: string | null;
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
  collectionId?: string;
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
    gender: (row.gender as any) || 'Unisex',
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
  collectionId,
  minPrice,
  maxPrice,
}: GetProductsParams = {}): Promise<GetProductsResult> {
  try {
    // Build base query
    let query = supabase
      .from('products')
      .select('*, brands(id, name), categories(id, name)', { count: 'exact' });

    // Apply collection filter
    if (collectionId) {
      query = query.eq('collection_id', collectionId);
    }

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

const FALLBACK_FEATURED_PRODUCTS: Product[] = [
  {
    id: 'feat-1',
    reference: '1312D',
    code: '1312D',
    description: 'Montura oftálmica de acetato pulido a mano de alta resistencia.',
    price: 32.50,
    eyeSize: 52,
    brand: 'Verona',
    material: 'ACETATO',
    gender: 'Unisex',
    saleType: 'PIEZA',
    category: 'Oftálmico',
    quantity: 120,
    flex: true,
    thumbnailUrl: 'https://baa9ng1ib5.execute-api.us-east-1.amazonaws.com/dev/dubros-image-repository/1312D.jpg',
    largeImageUrl: 'https://baa9ng1ib5.execute-api.us-east-1.amazonaws.com/dev/dubros-image-repository/1312D.jpg',
  },
  {
    id: 'feat-2',
    reference: 'M3562C8',
    code: 'M3562C8',
    description: 'Montura flexible con memoria de forma y bisagras reforzadas.',
    price: 28.00,
    eyeSize: 48,
    brand: 'Giordanni',
    material: 'TR90 FLEX',
    gender: 'Niños',
    saleType: 'PIEZA',
    category: 'Oftálmico',
    quantity: 85,
    flex: true,
    thumbnailUrl: 'https://baa9ng1ib5.execute-api.us-east-1.amazonaws.com/dev/dubros-image-repository/M3562C8.jpg',
    largeImageUrl: 'https://baa9ng1ib5.execute-api.us-east-1.amazonaws.com/dev/dubros-image-repository/M3562C8.jpg',
  },
  {
    id: 'feat-3',
    reference: 'TH61008C5',
    code: 'TH61008C5',
    description: 'Montura ultraligera de titanio puro, confort y elegancia ejecutiva.',
    price: 45.00,
    eyeSize: 54,
    brand: 'Koroit',
    material: 'TITANIO',
    gender: 'Hombre',
    saleType: 'PIEZA',
    category: 'Oftálmico',
    quantity: 60,
    flex: false,
    thumbnailUrl: 'https://baa9ng1ib5.execute-api.us-east-1.amazonaws.com/dev/dubros-image-repository/TH61008C5.jpg',
    largeImageUrl: 'https://baa9ng1ib5.execute-api.us-east-1.amazonaws.com/dev/dubros-image-repository/TH61008C5.jpg',
  },
  {
    id: 'feat-4',
    reference: 'TH61012C4',
    code: 'TH61012C4',
    description: 'Diseño moderno y casual para uso diario con acabado mate.',
    price: 24.50,
    eyeSize: 50,
    brand: 'Weekend',
    material: 'ACETATO / METAL',
    gender: 'Mujer',
    saleType: 'PIEZA',
    category: 'Oftálmico',
    quantity: 110,
    flex: true,
    thumbnailUrl: 'https://baa9ng1ib5.execute-api.us-east-1.amazonaws.com/dev/dubros-image-repository/TH61012C4.jpg',
    largeImageUrl: 'https://baa9ng1ib5.execute-api.us-east-1.amazonaws.com/dev/dubros-image-repository/TH61012C4.jpg',
  },
  {
    id: 'feat-5',
    reference: '8558C6',
    code: '8558C6',
    description: 'Montura deportiva de alta durabilidad con puente anatómico.',
    price: 29.90,
    eyeSize: 55,
    brand: 'LCT',
    material: 'TR90',
    gender: 'Hombre',
    saleType: 'PIEZA',
    category: 'Oftálmico',
    quantity: 95,
    flex: true,
    thumbnailUrl: 'https://baa9ng1ib5.execute-api.us-east-1.amazonaws.com/dev/dubros-image-repository/8558C6.jpg',
    largeImageUrl: 'https://baa9ng1ib5.execute-api.us-east-1.amazonaws.com/dev/dubros-image-repository/8558C6.jpg',
  },
  {
    id: 'feat-6',
    reference: 'MANTOVANNI211006',
    code: 'MANTOVANNI211006',
    description: 'Línea de diseño italiana con acabados pulidos y gran ligereza.',
    price: 38.00,
    eyeSize: 53,
    brand: 'Mantovanni',
    material: 'ACETATO',
    gender: 'Unisex',
    saleType: 'PIEZA',
    category: 'Oftálmico',
    quantity: 75,
    flex: false,
    thumbnailUrl: 'https://baa9ng1ib5.execute-api.us-east-1.amazonaws.com/dev/dubros-image-repository/MANTOVANNI211006.jpg',
    largeImageUrl: 'https://baa9ng1ib5.execute-api.us-east-1.amazonaws.com/dev/dubros-image-repository/MANTOVANNI211006.jpg',
  },
  {
    id: 'feat-7',
    reference: 'ROMANA220602',
    code: 'ROMANA220602',
    description: 'Estilo clásico atemporal con detalles metálicos en varillas.',
    price: 34.00,
    eyeSize: 51,
    brand: 'Romana',
    material: 'METAL / ACETATO',
    gender: 'Mujer',
    saleType: 'PIEZA',
    category: 'Oftálmico',
    quantity: 140,
    flex: true,
    thumbnailUrl: 'https://baa9ng1ib5.execute-api.us-east-1.amazonaws.com/dev/dubros-image-repository/ROMANA220602.jpg',
    largeImageUrl: 'https://baa9ng1ib5.execute-api.us-east-1.amazonaws.com/dev/dubros-image-repository/ROMANA220602.jpg',
  },
  {
    id: 'feat-8',
    reference: 'SMARTKIDS190302',
    code: 'SMARTKIDS190302',
    description: 'Montura infantil ergonómica e irrompible con cinta de ajuste.',
    price: 22.00,
    eyeSize: 45,
    brand: 'Smartkids',
    material: 'SILICONA / TR90',
    gender: 'Niños',
    saleType: 'PIEZA',
    category: 'Oftálmico',
    quantity: 200,
    flex: true,
    thumbnailUrl: 'https://baa9ng1ib5.execute-api.us-east-1.amazonaws.com/dev/dubros-image-repository/SMARTKIDS190302.jpg',
    largeImageUrl: 'https://baa9ng1ib5.execute-api.us-east-1.amazonaws.com/dev/dubros-image-repository/SMARTKIDS190302.jpg',
  }
];

export async function getFeaturedProducts(limit: number = 8): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, brands(id, name), categories(id, name)')
      .gt('price', 0)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data || data.length === 0) {
      return FALLBACK_FEATURED_PRODUCTS.slice(0, limit);
    }

    return data.map(mapSupabaseToProduct);
  } catch (e) {
    console.error('[getFeaturedProducts] Unexpected error:', e);
    return FALLBACK_FEATURED_PRODUCTS.slice(0, limit);
  }
}

// ---------------------------------------------------------------------------
// Fetch all brands from Supabase
// ---------------------------------------------------------------------------

import bubbleBrandsData from '@/data/bubble_brands.json';

const FALLBACK_BRANDS: SupabaseBrand[] = (bubbleBrandsData as any[])
  .filter((b) => b.active)
  .map((b) => ({
    id: b.id,
    name: b.name,
    active: b.active,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

import bubbleCategoriesData from '@/data/bubble_categories.json';

const FALLBACK_CATEGORIES: SupabaseCategory[] = (bubbleCategoriesData as any[]).map((c) => ({
  id: c.id,
  name: c.name,
  slug: c.slug,
}));

import bubbleMaterialsData from '@/data/bubble_materials.json';

const FALLBACK_MATERIALS: string[] = bubbleMaterialsData as string[];

export async function getBrands(): Promise<SupabaseBrand[]> {
  try {
    const { data, error } = await supabase
      .from('brands')
      .select('id, name, active')
      .order('name', { ascending: true });

    if (error || !data || data.length === 0) {
      return FALLBACK_BRANDS;
    }

    return data;
  } catch (e) {
    console.error('[getBrands] Unexpected error:', e);
    return FALLBACK_BRANDS;
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

    if (error || !data || data.length === 0) {
      return FALLBACK_CATEGORIES;
    }

    return data;
  } catch (e) {
    console.error('[getCategories] Unexpected error:', e);
    return FALLBACK_CATEGORIES;
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

    if (error || !data || data.length === 0) {
      return FALLBACK_MATERIALS;
    }

    const unique = [...new Set((data || []).map((d) => d.material).filter(Boolean))].sort();
    return unique.length > 0 ? unique : FALLBACK_MATERIALS;
  } catch (e) {
    console.error('[getMaterials] Unexpected error:', e);
    return FALLBACK_MATERIALS;
  }
}

// ---------------------------------------------------------------------------
// Fetch single product by ID or reference
// ---------------------------------------------------------------------------

export async function getProductById(id: string): Promise<Product | null> {
  try {
    let { data, error } = await supabase
      .from('products')
      .select('*, brands(id, name), categories(id, name)')
      .eq('id', id)
      .single();

    if (error || !data) {
      // Fallback: try matching reference
      const refQuery = await supabase
        .from('products')
        .select('*, brands(id, name), categories(id, name)')
        .eq('reference', id)
        .single();

      if (refQuery.error || !refQuery.data) return null;
      data = refQuery.data;
    }

    return mapSupabaseToProduct(data);
  } catch (e) {
    console.error('[getProductById] Error:', e);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Fetch design collections from Supabase
// ---------------------------------------------------------------------------

export interface SupabaseCollection {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  createdAt?: string;
  productCount?: number;
}

const FALLBACK_COLLECTIONS: SupabaseCollection[] = [
  {
    id: 'col-weekend',
    name: 'Weekend Eyewear Collection',
    description: 'Diseños contemporáneos y estilo urbano casual para uso diario con acabados de alta gama.',
    imageUrl: 'https://baa9ng1ib5.execute-api.us-east-1.amazonaws.com/dev/dubros-image-repository/TH61012C4.jpg',
    productCount: 185,
  },
  {
    id: 'col-verona',
    name: 'Verona Acetato Italiano',
    description: 'Diseños contemporáneos en acetato pulido a mano con acabados de alta gama.',
    imageUrl: 'https://baa9ng1ib5.execute-api.us-east-1.amazonaws.com/dev/dubros-image-repository/1312D.jpg',
    productCount: 142,
  },
  {
    id: 'col-kids',
    name: 'Giordanni Flex Kids',
    description: 'Flexibilidad 360° y durabilidad extrema en silicona médica para los más pequeños.',
    imageUrl: 'https://baa9ng1ib5.execute-api.us-east-1.amazonaws.com/dev/dubros-image-repository/M3562C8.jpg',
    productCount: 65,
  },
];

export async function getCollections(): Promise<SupabaseCollection[]> {
  try {
    const { data, error } = await supabase
      .from('collections')
      .select('*, products(count)')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return FALLBACK_COLLECTIONS;
    }

    return data.map((col: any) => ({
      id: col.id,
      name: col.name,
      description: col.description || '',
      imageUrl: col.image_url || '/images/collection-titanium.jpg',
      createdAt: col.created_at,
      productCount: col.products?.[0]?.count || 0,
    }));
  } catch (e) {
    console.error('[getCollections] Unexpected error:', e);
    return FALLBACK_COLLECTIONS;
  }
}

export async function getCollectionProducts(collectionId: string): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, brands(id, name), categories(id, name)')
      .eq('collection_id', collectionId)
      .limit(50);

    if (error || !data) return [];
    return data.map(mapSupabaseToProduct);
  } catch (e) {
    console.error('[getCollectionProducts] Error:', e);
    return [];
  }
}


