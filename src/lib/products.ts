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
  gender?: string;
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

import productMetaMap from '@/data/product_meta_map.json';

const metaMap = productMetaMap as Record<string, { b: string; c: string; q: number; p: number; g?: string; m?: string }>;

// Convert Supabase row → Product interface (compatible with existing components)
// ---------------------------------------------------------------------------

function getBaseWholesalePrice(brand: string, category: string): number {
  const b = (brand || '').toUpperCase();
  const c = (category || '').toUpperCase();

  if (c.includes('ACCESORIO') || c.includes('ESTUCHE') || c.includes('CORDON') || c.includes('NARIGUERA')) return 4.50;
  if (c.includes('LECTURA')) return 6.50;
  if (b.includes('SMARTKIDS') || b.includes('FLEXXILON')) return 12.50;
  if (b.includes('MANTOVANNI') || b.includes('ROMANA') || b.includes('VELVETT') || b.includes('KIAMIL') || b.includes('GIORDANNI')) return 18.50;
  if (b.includes('WEEKEND') || b.includes('IBERIA') || b.includes('VERONA') || b.includes('LCT') || b.includes('DMOST')) return 15.00;
  if (b.includes('GUESS') || b.includes('LACOSTE') || b.includes('MATSUDA')) return 22.00;
  if (c.includes('SOL')) return 16.50;
  return 14.00;
}

function resolveCleanBrand(dbBrand?: string | null, metaBrand?: string | null, ref?: string, desc?: string): string {
  const cleanRef = (ref || '').toUpperCase();
  const cleanDesc = (desc || '').toUpperCase();
  const cleanDb = (dbBrand || '').trim();

  // If meta has a specific brand (not generic Dubros/SM), use it!
  if (metaBrand && metaBrand !== 'Dubros' && metaBrand !== 'SM' && metaBrand !== 'SM Eyewear' && metaBrand !== 'S-M' && metaBrand !== 'GENERAL') {
    return metaBrand;
  }

  // Priority detection from Description and Reference
  const KNOWN_BRANDS = [
    'BELMOR', 'SMARTKIDS', 'SMART KIDS', 'FLEXXILON', 'KIAMIL', 'VELVETT', 
    'MANTOVANNI', 'ROMANA', 'WEEKEND', 'IBERIA', 'VERONA', 'LCT', 
    'BELLUNO', 'GREKO', 'GIORDANNI', 'DMOST', 'BEST VIEW', 
    'HI-LINE', 'LOTTO', 'FAZZET', 'NAKARATA', 'MASK', 'VISION KIDS', 
    'VISION', 'STEED', 'POLAR', 'FALCON', 'GUESS', 'LACOSTE', 'RAYBAN',
    'OAKLEY', 'CARRERA', 'VOGUE', 'EMPORIO', 'PRADA', 'TOMMY', 'POLAROID', 'POLO'
  ];

  for (const b of KNOWN_BRANDS) {
    if (cleanRef.startsWith(b.replace(/\s+/g, '')) || cleanDesc.includes(b)) {
      if (b === 'LCT') return 'LCT';
      if (b === 'BELMOR') return 'Belmor';
      if (b === 'SMARTKIDS' || b === 'SMART KIDS') return 'Smartkids';
      if (b === 'FLEXXILON') return 'Flexxilon';
      if (b === 'KIAMIL') return 'Kiamil';
      if (b === 'VELVETT') return 'Velvett';
      if (b === 'MANTOVANNI') return 'Mantovanni';
      if (b === 'ROMANA') return 'Romana';
      if (b === 'WEEKEND') return 'Weekend';
      if (b === 'IBERIA') return 'Iberia';
      if (b === 'VERONA') return 'Verona';
      if (b === 'BELLUNO') return 'Belluno';
      if (b === 'GREKO') return 'Greko';
      if (b === 'GIORDANNI') return 'Giordanni';
      if (b === 'DMOST') return 'Dmost';
      if (b === 'BEST VIEW') return 'Best View';
      if (b === 'HI-LINE') return 'Hi-Line';
      if (b === 'LOTTO') return 'Lotto';
      if (b === 'FAZZET') return 'Fazzet';
      if (b === 'NAKARATA') return 'Nakarata';
      if (b === 'MASK') return 'Mask';
      if (b === 'VISION KIDS' || b === 'VISION') return 'Vision';
      return b.charAt(0) + b.slice(1).toLowerCase();
    }
  }

  if (cleanDb && cleanDb !== 'Dubros' && cleanDb !== 'SM' && cleanDb !== 'S-M' && cleanDb !== 'GENERAL') {
    return cleanDb;
  }

  return metaBrand || cleanDb || 'Dubros';
}

function mapSupabaseToProduct(row: SupabaseProduct): Product {
  const fixUrl = (url: string | undefined | null, refFallback: string) => {
    if (url && url.includes('http') && !url.includes('placeholder')) {
      return url.replace(
        'https://baa9ng1ib5.execute-api.us-east-1.amazonaws.com/dev/dubros-image-repository',
        'https://dubros-image-repository.s3.amazonaws.com'
      );
    }
    const cleanRef = (refFallback || '').trim();
    if (cleanRef) {
      return `https://dubros-image-repository.s3.amazonaws.com/${encodeURIComponent(cleanRef)}.jpg`;
    }
    return '/images/product-placeholder.png';
  };

  const ref = row.reference || row.code || '';
  const code = row.code || row.reference || '';
  const refUpper = (ref || code || '').toUpperCase().trim();
  const meta = metaMap[refUpper];
  const desc = row.description || `Montura oftálmica de alta calidad, referencia ${ref}.`;

  const brand = resolveCleanBrand(row.brands?.name, meta?.b, ref, desc);
  const category = row.categories?.name || meta?.c || 'Aros Ópticos';
  const quantity = row.quantity || meta?.q || 0;
  const rawPrice = row.price ? Number(row.price) : 0;
  const finalPrice = rawPrice > 0 ? rawPrice : getBaseWholesalePrice(brand, category);

  return {
    id: row.id,
    reference: ref,
    code: code,
    description: desc,
    price: finalPrice,
    eyeSize: 0, // Not stored in Supabase currently
    brand: brand,
    material: row.material && row.material !== 'N/A' ? row.material : 'ACETATO / METAL',
    gender: (row.gender as any) || 'Unisex',
    saleType: row.sale_type || 'PIEZA',
    category: category,
    quantity: quantity,
    flex: true,
    thumbnailUrl: fixUrl(row.thumbnail_url, ref),
    largeImageUrl: fixUrl(row.large_image_url || row.thumbnail_url, ref),
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
  gender,
  collectionId,
  minPrice,
  maxPrice,
}: GetProductsParams = {}): Promise<GetProductsResult> {
  try {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const isBrandFilter = brandName && brandName !== 'all';
    const isCategoryFilter = categoryName && categoryName !== 'all';
    const isMaterialFilter = material && material !== 'all';
    const isGenderFilter = gender && gender !== 'all';

    const bUpper = isBrandFilter ? brandName.toUpperCase() : null;
    const cUpper = isCategoryFilter ? categoryName.toUpperCase() : null;
    const mUpper = isMaterialFilter ? material.toUpperCase() : null;
    const gUpper = isGenderFilter ? gender.toUpperCase() : null;
    const sUpper = search && search.trim() ? search.trim().toUpperCase() : null;

    const matchedRefs = Object.keys(metaMap).filter((ref) => {
      const item = metaMap[ref];
      if (bUpper && item.b.toUpperCase() !== bUpper) return false;
      if (cUpper && item.c.toUpperCase() !== cUpper) return false;
      if (mUpper && item.m && !item.m.toUpperCase().includes(mUpper)) return false;
      if (gUpper && item.g && item.g.toUpperCase() !== gUpper) return false;
      if (minPrice !== undefined && item.p < minPrice) return false;
      if (maxPrice !== undefined && item.p > maxPrice) return false;
      if (sUpper && !ref.includes(sUpper) && !item.b.toUpperCase().includes(sUpper)) return false;
      return true;
    });

    const totalCount = matchedRefs.length;
    const totalPages = Math.ceil(totalCount / pageSize) || 1;

    if (totalCount === 0) {
      return { products: [], totalCount: 0, page, pageSize, totalPages: 0 };
    }

    const pageRefs = matchedRefs.slice(from, to + 1);

    let query = supabase
      .from('products')
      .select('*, brands(id, name), categories(id, name)')
      .in('reference', pageRefs);

    if (collectionId) {
      query = query.eq('collection_id', collectionId);
    }

    const { data, error } = await query;
    let productsList: Product[] = [];

    if (!error && data && data.length > 0) {
      const mapById = new Map<string, Product>();
      data.forEach((row) => {
        const p = mapSupabaseToProduct(row);
        mapById.set(p.reference.toUpperCase(), p);
      });

      productsList = pageRefs.map((ref) => {
        const found = mapById.get(ref.toUpperCase());
        if (found) return found;
        const meta = metaMap[ref];
        const imgUrl = `https://dubros-image-repository.s3.amazonaws.com/${encodeURIComponent(ref)}.jpg`;
        return {
          id: ref,
          reference: ref,
          code: ref,
          description: `Montura oftálmica de alta calidad, referencia ${ref}.`,
          price: meta?.p || 0,
          eyeSize: 0,
          brand: meta?.b || (brandName || 'Dubros'),
          material: meta?.m || 'ACETATO / METAL',
          gender: (meta?.g as any) || 'Unisex',
          saleType: 'PIEZA',
          category: meta?.c || (categoryName || 'Aros Ópticos'),
          quantity: meta?.q || 0,
          flex: true,
          thumbnailUrl: imgUrl,
          largeImageUrl: imgUrl,
        };
      });
    } else {
      productsList = pageRefs.map((ref) => {
        const meta = metaMap[ref];
        const imgUrl = `https://dubros-image-repository.s3.amazonaws.com/${encodeURIComponent(ref)}.jpg`;
        return {
          id: ref,
          reference: ref,
          code: ref,
          description: `Montura oftálmica de alta calidad, referencia ${ref}.`,
          price: meta?.p || 0,
          eyeSize: 0,
          brand: meta?.b || (brandName || 'Dubros'),
          material: meta?.m || 'ACETATO / METAL',
          gender: (meta?.g as any) || 'Unisex',
          saleType: 'PIEZA',
          category: meta?.c || (categoryName || 'Aros Ópticos'),
          quantity: meta?.q || 0,
          flex: true,
          thumbnailUrl: imgUrl,
          largeImageUrl: imgUrl,
        };
      });
    }

    return { products: productsList, totalCount, page, pageSize, totalPages };
  } catch (e) {
    console.error('[getProducts] Unexpected error:', e);
    return { products: [], totalCount: 0, page: 1, pageSize, totalPages: 0 };
  }
}

// ---------------------------------------------------------------------------
// Fetch featured products for homepage (latest N products with images)
// ---------------------------------------------------------------------------

const FALLBACK_FEATURED_PRODUCTS: Product[] = [
  {
    id: 'MANTOVANNI211006',
    reference: 'MANTOVANNI211006',
    code: 'MANTOVANNI211006',
    description: 'Línea de diseño italiana en acetato pulido a mano con acabados de alta gama.',
    price: 38.00,
    eyeSize: 53,
    brand: 'Mantovanni',
    material: 'ACETATO',
    gender: 'Unisex',
    saleType: 'PIEZA',
    category: 'Aros Ópticos',
    quantity: 75,
    flex: true,
    thumbnailUrl: 'https://dubros-image-repository.s3.amazonaws.com/MANTOVANNI211006.jpg',
    largeImageUrl: 'https://dubros-image-repository.s3.amazonaws.com/MANTOVANNI211006.jpg',
  },
  {
    id: 'ROMANA220602',
    reference: 'ROMANA220602',
    code: 'ROMANA220602',
    description: 'Estilo clásico atemporal con detalles metálicos en varillas y ajuste anatómico.',
    price: 34.00,
    eyeSize: 51,
    brand: 'Romana',
    material: 'METAL / ACETATO',
    gender: 'Mujer',
    saleType: 'PIEZA',
    category: 'Aros Ópticos',
    quantity: 140,
    flex: true,
    thumbnailUrl: 'https://dubros-image-repository.s3.amazonaws.com/ROMANA220602.jpg',
    largeImageUrl: 'https://dubros-image-repository.s3.amazonaws.com/ROMANA220602.jpg',
  },
  {
    id: 'SMARTKIDS190302',
    reference: 'SMARTKIDS190302',
    code: 'SMARTKIDS190302',
    description: 'Montura infantil ergonómica e irrompible con cinta de ajuste y bisagra 360° flex.',
    price: 22.00,
    eyeSize: 45,
    brand: 'Smartkids',
    material: 'SILICONA / TR90',
    gender: 'Niños',
    saleType: 'PIEZA',
    category: 'Aros Ópticos',
    quantity: 200,
    flex: true,
    thumbnailUrl: 'https://dubros-image-repository.s3.amazonaws.com/SMARTKIDS190302.jpg',
    largeImageUrl: 'https://dubros-image-repository.s3.amazonaws.com/SMARTKIDS190302.jpg',
  },
  {
    id: 'VERONA221013BLACKGRE',
    reference: 'VERONA221013BLACKGRE',
    code: 'VERONA221013BLACKGRE',
    description: 'Elegante diseño italiano en acetato bicapa de alta resistencia y brillo duradero.',
    price: 36.00,
    eyeSize: 54,
    brand: 'Verona',
    material: 'ACETATO ITALIANO',
    gender: 'Unisex',
    saleType: 'PIEZA',
    category: 'Aros Ópticos',
    quantity: 90,
    flex: true,
    thumbnailUrl: 'https://dubros-image-repository.s3.amazonaws.com/VERONA221013BLACKGRE.jpg',
    largeImageUrl: 'https://dubros-image-repository.s3.amazonaws.com/VERONA221013BLACKGRE.jpg',
  },
  {
    id: 'WEEKEND191108BLUE',
    reference: 'WEEKEND191108BLUE',
    code: 'WEEKEND191108BLUE',
    description: 'Diseño moderno y casual urbano con estructura ligera para máxima comodidad diaria.',
    price: 26.50,
    eyeSize: 52,
    brand: 'Weekend',
    material: 'METAL / ACETATO',
    gender: 'Hombre',
    saleType: 'PIEZA',
    category: 'Aros Ópticos',
    quantity: 115,
    flex: true,
    thumbnailUrl: 'https://dubros-image-repository.s3.amazonaws.com/WEEKEND191108BLUE.jpg',
    largeImageUrl: 'https://dubros-image-repository.s3.amazonaws.com/WEEKEND191108BLUE.jpg',
  },
  {
    id: 'IBERIA230906MGUN',
    reference: 'IBERIA230906MGUN',
    code: 'IBERIA230906MGUN',
    description: 'Montura metálica contemporánea con plaquetas de silicona y acabado gun metal.',
    price: 31.00,
    eyeSize: 55,
    brand: 'Iberia',
    material: 'METAL',
    gender: 'Hombre',
    saleType: 'PIEZA',
    category: 'Aros Ópticos',
    quantity: 80,
    flex: false,
    thumbnailUrl: 'https://dubros-image-repository.s3.amazonaws.com/IBERIA230906MGUN.jpg',
    largeImageUrl: 'https://dubros-image-repository.s3.amazonaws.com/IBERIA230906MGUN.jpg',
  },
  {
    id: 'LCT161002C16-1',
    reference: 'LCT161002C16-1',
    code: 'LCT161002C16-1',
    description: 'Montura deportiva de alta durabilidad en TR90 con puente anatómico reforzado.',
    price: 29.90,
    eyeSize: 53,
    brand: 'LCT',
    material: 'TR90',
    gender: 'Unisex',
    saleType: 'PIEZA',
    category: 'Aros Ópticos',
    quantity: 95,
    flex: true,
    thumbnailUrl: 'https://dubros-image-repository.s3.amazonaws.com/LCT161002C16-1.jpg',
    largeImageUrl: 'https://dubros-image-repository.s3.amazonaws.com/LCT161002C16-1.jpg',
  },
  {
    id: 'SMARTKIDS190309',
    reference: 'SMARTKIDS190309',
    code: 'SMARTKIDS190309',
    description: 'Colección infantil flexible de máxima seguridad y colores vivos para niños.',
    price: 22.00,
    eyeSize: 46,
    brand: 'Smartkids',
    material: 'SILICONA / TR90',
    gender: 'Niños',
    saleType: 'PIEZA',
    category: 'Aros Ópticos',
    quantity: 160,
    flex: true,
    thumbnailUrl: 'https://dubros-image-repository.s3.amazonaws.com/SMARTKIDS190309.jpg',
    largeImageUrl: 'https://dubros-image-repository.s3.amazonaws.com/SMARTKIDS190309.jpg',
  },
];

export async function getFeaturedProducts(limit: number = 8): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, brands(id, name), categories(id, name)')
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

const dynamicBrandsMap = new Map<string, SupabaseBrand>();

(bubbleBrandsData as any[]).forEach((b) => {
  if (b.name && b.active !== false) {
    const clean = b.name.trim();
    dynamicBrandsMap.set(clean.toUpperCase(), {
      id: b.id || clean.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name: clean,
      active: true,
    });
  }
});

Object.values(metaMap).forEach((m) => {
  if (m.b && m.b !== 'Dubros') {
    const clean = m.b.trim();
    if (!dynamicBrandsMap.has(clean.toUpperCase())) {
      dynamicBrandsMap.set(clean.toUpperCase(), {
        id: clean.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        name: clean,
        active: true,
      });
    }
  }
});

const FALLBACK_BRANDS: SupabaseBrand[] = Array.from(dynamicBrandsMap.values()).sort((a, b) =>
  a.name.localeCompare(b.name)
);

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
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    let data: any = null;

    if (isUuid) {
      const { data: byId } = await supabase
        .from('products')
        .select('*, brands(id, name), categories(id, name)')
        .eq('id', id)
        .maybeSingle();
      data = byId;
    }

    if (!data) {
      // Try matching by reference or code in Supabase
      const { data: byRef } = await supabase
        .from('products')
        .select('*, brands(id, name), categories(id, name)')
        .or(`reference.eq.${id},code.eq.${id}`)
        .limit(1)
        .maybeSingle();
      data = byRef;
    }

    if (!data) {
      // Look in verified fallback products
      const fallback = FALLBACK_FEATURED_PRODUCTS.find(
        (p) => p.id === id || p.reference.toLowerCase() === id.toLowerCase() || p.code.toLowerCase() === id.toLowerCase()
      );
      if (fallback) return fallback;
      return null;
    }

    return mapSupabaseToProduct(data);
  } catch (e) {
    console.error('[getProductById] Error:', e);
    const fallback = FALLBACK_FEATURED_PRODUCTS.find(
      (p) => p.id === id || p.reference.toLowerCase() === id.toLowerCase() || p.code.toLowerCase() === id.toLowerCase()
    );
    if (fallback) return fallback;
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
    imageUrl: 'https://dubros-image-repository.s3.amazonaws.com/TH61012C4.jpg',
    productCount: 185,
  },
  {
    id: 'col-verona',
    name: 'Verona Acetato Italiano',
    description: 'Diseños contemporáneos en acetato pulido a mano con acabados de alta gama.',
    imageUrl: 'https://dubros-image-repository.s3.amazonaws.com/1312D.jpg',
    productCount: 142,
  },
  {
    id: 'col-kids',
    name: 'Giordanni Flex Kids',
    description: 'Flexibilidad 360° y durabilidad extrema en silicona médica para los más pequeños.',
    imageUrl: 'https://dubros-image-repository.s3.amazonaws.com/M3562C8.jpg',
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


