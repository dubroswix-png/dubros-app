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
  eye_size?: number | null;
  bridge_size?: number | null;
  temple_length?: number | null;
  frame_size?: string | null;
  flex?: boolean | null;
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
  eyeSize?: number | string;
  bridgeSize?: number | string;
  templeLength?: number | string;
  saleType?: string;
  flex?: boolean | string;
  collectionId?: string;
  minPrice?: number;
  maxPrice?: number;
  minStock?: number;
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

// ---------------------------------------------------------------------------
// Normalization Utilities (Case & Accent Insensitive)
// ---------------------------------------------------------------------------

export function normalizeText(str: string): string {
  return (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function normalizeGender(val: string | undefined | null): 'Hombre' | 'Mujer' | 'Unisex' | 'Niños' | null {
  if (!val || val === 'all') return null;
  const clean = normalizeText(val);

  // 1. Check Mujer / Femenino first (prevents 'femenino' matching 'nin' or 'men')
  if (
    clean.includes('muj') ||
    clean.includes('fem') ||
    clean.includes('dam') ||
    clean.includes('lady') ||
    clean.includes('women') ||
    clean.includes('girl')
  ) {
    return 'Mujer';
  }

  // 2. Check Kids / Niños
  if (
    clean.includes('nin') ||
    clean.includes('kid') ||
    clean.includes('infant') ||
    clean.includes('chico') ||
    clean.includes('bebe') ||
    clean.includes('child')
  ) {
    return 'Niños';
  }

  // 3. Check Hombre / Masculino
  if (
    clean.includes('hom') ||
    clean.includes('masc') ||
    clean.includes('caball') ||
    clean.includes('varon') ||
    /\bmen\b/.test(clean) ||
    clean === 'men' ||
    clean === 'man' ||
    clean === 'boy'
  ) {
    return 'Hombre';
  }

  // 4. Check Unisex
  if (clean.includes('uni')) {
    return 'Unisex';
  }

  return null;
}

export function normalizeFlex(val: boolean | string | undefined | null): boolean | null {
  if (val === undefined || val === null || val === 'all' || val === '') return null;
  if (typeof val === 'boolean') return val;
  const clean = normalizeText(String(val));
  if (['flex', 'si', 'true', '1', 'con flex', 'con_flex', 'yes'].includes(clean)) return true;
  if (['noflex', 'no flex', 'no_flex', 'sin flex', 'sin_flex', 'no', 'false', '0'].includes(clean)) return false;
  if (clean.includes('sin') || clean.includes('no')) return false;
  if (clean.includes('con') || clean.includes('flex') || clean.includes('si')) return true;
  return null;
}

export function normalizeSaleType(val: string | undefined | null): 'DOCENA' | 'PIEZA' | null {
  if (!val || val === 'all') return null;
  const clean = normalizeText(String(val));
  if (clean.includes('doc') || clean === '1') return 'DOCENA';
  if (clean.includes('piez') || clean.includes('pza') || clean.includes('pz') || clean.includes('unid')) return 'PIEZA';
  return null;
}

export function isDocena(val: string | undefined | null): boolean {
  return normalizeSaleType(val) === 'DOCENA';
}

export function getProductUnitPrice(price: number, saleType?: string | null): number {
  return isDocena(saleType) ? price * 12 : price;
}

export function normalizeCategoryName(rawName: string | undefined | null): string {
  if (!rawName) return '';
  const clean = normalizeText(String(rawName)).trim();

  // Excluded / noise categories requested by user
  if (
    clean === '2' ||
    clean.includes('palo') ||
    clean.includes('trapera') ||
    clean.includes('escoba') ||
    clean.includes('general') ||
    clean.includes('guia') ||
    clean.includes('clip') ||
    clean.includes('espejo') ||
    clean.includes('limpieza')
  ) {
    return '';
  }

  // Canonical mappings and case/plural normalization
  if (clean.includes('tornill')) return 'Tornillos';
  if (clean.includes('exhibid')) return 'Exhibidores';
  if (clean.includes('nariguer')) return 'Narigueras';
  if (clean.includes('lente') && clean.includes('sol')) return 'Lentes de Sol';
  if (clean === 'sol') return 'Lentes de Sol';
  if (clean.includes('aros') || clean.includes('optico')) return 'Aros Ópticos';
  if (clean.includes('estuche')) return 'Estuches';
  if (clean.includes('cordon')) return 'Cordones';
  if (clean.includes('lectura')) return 'Lectura';
  if (clean.includes('cartera')) return 'Carteras';
  if (clean.includes('accesorio')) return 'Accesorios';
  if (clean.includes('proteccion') || clean.includes('seguridad')) return 'Protección';
  if (clean.includes('pano') || clean.includes('paño')) return 'Paños';
  if (clean.includes('brazalete')) return 'Brazaletes';

  return String(rawName).charAt(0).toUpperCase() + String(rawName).slice(1).toLowerCase();
}

export function normalizeBrandName(rawName: string | undefined | null): string {
  if (!rawName) return '';
  let clean = String(rawName).replace(/\s+/g, ' ').trim().toUpperCase();

  // Filter out test brands or generic noise
  if (clean.includes('TEST') || clean === 'GENERAL') {
    return '';
  }

  // Canonical mappings and merge duplicates requested by user
  if (clean === 'SM' || clean === 'S-M' || clean === 'S - M' || clean === 'SINMARCA') return 'SIN MARCA';
  if (clean === 'BESTVIEW' || clean === 'BEST VIEW') return 'BEST VIEW';
  if (clean === 'TRAVERZO' || clean === 'TRAVERSO') return 'TRAVERSO';
  if (clean === 'BALDINI' || clean === 'BALDINNI') return 'BALDINNI';
  if (clean === 'BACHELET' || clean === 'BACHELLET') return 'BACHELLET';
  if (clean.includes('AGATHA') && clean.includes('RUIZ')) return 'AGATHA RUIZ DE LA PRADA';
  if (clean === 'CALVIN CLEIN' || clean === 'CALVIN KLEIN') return 'CALVIN KLEIN';
  if (clean === 'SMART KIDS' || clean === 'SMARTKIDS') return 'SMARTKIDS';
  if (clean === 'MONT BLANC' || clean === 'MONTBLANC') return 'MONTBLANC';
  if (clean === 'SCHOOL DAY' || clean === 'SCHOOLDAY') return 'SCHOOL DAY';

  return clean;
}

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
  const cleanDb = normalizeBrandName(dbBrand);
  const cleanMeta = normalizeBrandName(metaBrand);

  // If DB brand is valid and not generic Dubros, use it
  if (cleanDb && cleanDb !== 'DUBROS') {
    return cleanDb;
  }

  // If meta has a specific brand, use it
  if (cleanMeta && cleanMeta !== 'DUBROS') {
    return cleanMeta;
  }

  // Priority detection from Description and Reference
  const KNOWN_BRANDS = [
    'AGATHA RUIZ DE LA PRADA', 'BALDINNI', 'BACHELLET', 'BEST VIEW', 'SIN MARCA', 'TRAVERSO',
    'CALVIN KLEIN', 'SMARTKIDS', 'MONTBLANC', 'SCHOOL DAY',
    'BELMOR', 'FLEXXILON', 'KIAMIL', 'VELVETT', 
    'MANTOVANNI', 'ROMANA', 'WEEKEND', 'IBERIA', 'VERONA', 'LCT', 
    'BELLUNO', 'GREKO', 'GIORDANNI', 'DMOST', 
    'HI-LINE', 'LOTTO', 'FAZZET', 'NAKARATA', 'MASK', 'VISION KIDS', 
    'VISION', 'STEED', 'POLAR', 'FALCON', 'GUESS', 'LACOSTE', 'RAYBAN',
    'OAKLEY', 'CARRERA', 'VOGUE', 'EMPORIO', 'PRADA', 'TOMMY', 'POLAROID', 'POLO'
  ];

  for (const b of KNOWN_BRANDS) {
    if (cleanRef.startsWith(b.replace(/\s+/g, '')) || cleanDesc.includes(b)) {
      return b;
    }
  }

  return cleanDb || cleanMeta || 'DUBROS';
}

function resolveCleanGender(ref?: string, desc?: string, dbGender?: string | null, metaGender?: string | null): string {
  const cleanRef = (ref || '').toUpperCase().trim();
  const cleanDesc = (desc || '').toUpperCase().trim();
  const cleanDb = (dbGender || '').trim();

  // Kids / Niños patterns (e.g. S307PC47, S313PC34, SK5107, Smartkids, Visionkids, Flexxilon, etc.)
  if (
    /^S\d{3}PC/i.test(cleanRef) ||
    /^SK\d/i.test(cleanRef) ||
    cleanRef.includes('KID') ||
    cleanRef.includes('NIÑ') ||
    cleanRef.includes('NIN') ||
    cleanRef.includes('CHILD') ||
    cleanRef.includes('FLEXXILON') ||
    cleanRef.includes('SMARTKIDS') ||
    cleanRef.includes('VISIONKIDS') ||
    cleanDesc.includes('KID') ||
    cleanDesc.includes('NIÑO') ||
    cleanDesc.includes('NIÑA') ||
    cleanDesc.includes('NINO') ||
    cleanDesc.includes('NINA') ||
    cleanDesc.includes('INFANTIL')
  ) {
    return 'Niños';
  }

  if (cleanDb) {
    const normDb = normalizeGender(cleanDb);
    if (normDb && normDb !== 'Unisex') return normDb;
  }

  if (metaGender) {
    const normMeta = normalizeGender(metaGender);
    if (normMeta && normMeta !== 'Unisex') return normMeta;
  }

  return cleanDb || metaGender || 'Unisex';
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
  const rawCat = row.categories?.name || meta?.c || 'Aros Ópticos';
  const category = normalizeCategoryName(rawCat) || 'Aros Ópticos';
  const quantity = row.quantity || meta?.q || 0;
  const rawPrice = row.price ? Number(row.price) : 0;
  const finalPrice = rawPrice > 0 ? rawPrice : getBaseWholesalePrice(brand, category);
  const gender = resolveCleanGender(ref, desc, row.gender, meta?.g);

  return {
    id: row.id,
    reference: ref,
    code: code,
    description: desc,
    price: finalPrice,
    eyeSize: row.eye_size || 0,
    bridgeSize: row.bridge_size || undefined,
    templeLength: row.temple_length || undefined,
    frameSize: row.frame_size || (row.eye_size && row.bridge_size && row.temple_length ? `${row.eye_size}-${row.bridge_size}-${row.temple_length}` : undefined),
    brand: brand,
    material: row.material && row.material !== 'N/A' ? row.material : 'ACETATO / METAL',
    gender: gender as any,
    saleType: normalizeSaleType(row.sale_type) || 'PIEZA',
    category: category,
    quantity: quantity,
    flex: normalizeFlex(row.flex) ?? true,
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
  eyeSize,
  bridgeSize,
  templeLength,
  saleType,
  flex,
  collectionId,
  minPrice,
  maxPrice,
  minStock,
}: GetProductsParams = {}): Promise<GetProductsResult> {
  try {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const isBrand = Boolean(brandName && brandName !== 'all');
    const isCategory = Boolean(categoryName && categoryName !== 'all');

    const brandSelect = isBrand ? 'brands!inner(id, name)' : 'brands(id, name)';
    const catSelect = isCategory ? 'categories!inner(id, name)' : 'categories(id, name)';

    let query = supabase
      .from('products')
      .select(`*, ${brandSelect}, ${catSelect}`, { count: 'exact' });

    if (collectionId) {
      query = query.eq('collection_id', collectionId);
    }

    if (material && material !== 'all') {
      const matClean = normalizeText(material);
      if (matClean.includes('plastic')) {
        query = query.or('material.ilike.%Plástico%,material.ilike.%Plastico%');
      } else if (matClean.includes('acrilic')) {
        query = query.or('material.ilike.%Acrílico%,material.ilike.%Acrilico%');
      } else if (matClean.includes('sintet')) {
        query = query.or('material.ilike.%Sintético%,material.ilike.%Sintetico%');
      } else if (matClean.includes('poliest')) {
        query = query.or('material.ilike.%Poliéster%,material.ilike.%Poliester%');
      } else {
        query = query.ilike('material', `%${material}%`);
      }
    }

    if (isBrand) {
      const normBrand = normalizeBrandName(brandName) || brandName;
      query = query.ilike('brands.name', `%${normBrand}%`);
    }

    if (isCategory) {
      const normCat = normalizeCategoryName(categoryName);
      if (normCat === 'Tornillos') {
        query = query.ilike('categories.name', '%Tornill%');
      } else if (normCat === 'Exhibidores') {
        query = query.ilike('categories.name', '%Exhibid%');
      } else if (normCat === 'Narigueras') {
        query = query.ilike('categories.name', '%Nariguer%');
      } else if (normCat === 'Lentes de Sol') {
        query = query.ilike('categories.name', '%Sol%');
      } else if (normCat === 'Paños') {
        query = query.or('categories.name.ilike.%PANO%,categories.name.ilike.%Paño%');
      } else if (normCat === 'Protección') {
        query = query.or('categories.name.ilike.%PROTECCION%,categories.name.ilike.%Protección%,categories.name.ilike.%Seguridad%');
      } else if (normCat === 'Estuches') {
        query = query.ilike('categories.name', '%ESTUCHE%');
      } else if (normCat === 'Cordones') {
        query = query.ilike('categories.name', '%CORDON%');
      } else if (normCat === 'Carteras') {
        query = query.ilike('categories.name', '%CARTERA%');
      } else if (normCat === 'Lectura') {
        query = query.ilike('categories.name', '%LECTURA%');
      } else if (normCat === 'Accesorios') {
        query = query.ilike('categories.name', '%ACCESORIO%');
      } else if (normCat === 'Aros Ópticos') {
        query = query.ilike('categories.name', '%AROS%');
      } else if (normCat === 'Brazaletes') {
        query = query.ilike('categories.name', '%BRAZALETE%');
      } else {
        query = query.ilike('categories.name', `%${categoryName}%`);
      }
    }

    if (gender && gender !== 'all') {
      const normGen = normalizeGender(gender);
      if (normGen === 'Niños') {
        query = query.or(
          'gender.ilike.%Niño%,gender.ilike.%Nino%,gender.ilike.%Kids%,description.ilike.%KIDS%,description.ilike.%NIÑO%,description.ilike.%NINO%,reference.ilike.S%PC%,reference.ilike.SK%'
        );
      } else if (normGen === 'Hombre') {
        query = query.or('gender.ilike.%Hombre%,gender.ilike.%Masculin%,gender.ilike.%Caballer%');
      } else if (normGen === 'Mujer') {
        query = query.or('gender.ilike.%Mujer%,gender.ilike.%Femenin%,gender.ilike.%Dama%');
      } else if (normGen === 'Unisex') {
        query = query.ilike('gender', '%Unisex%');
      } else {
        query = query.ilike('gender', `%${gender}%`);
      }
    }

    if (eyeSize && eyeSize !== 'all') {
      const sizeNum = parseInt(String(eyeSize), 10);
      if (!isNaN(sizeNum)) {
        query = query.eq('eye_size', sizeNum);
      }
    }

    if (bridgeSize && bridgeSize !== 'all') {
      const bNum = parseInt(String(bridgeSize), 10);
      if (!isNaN(bNum)) {
        query = query.eq('bridge_size', bNum);
      }
    }

    if (templeLength && templeLength !== 'all') {
      const tNum = parseInt(String(templeLength), 10);
      if (!isNaN(tNum)) {
        query = query.eq('temple_length', tNum);
      }
    }

    if (saleType && saleType !== 'all') {
      const normSale = normalizeSaleType(saleType);
      if (normSale === 'DOCENA') {
        query = query.or('sale_type.ilike.%DOCENA%,sale_type.eq.1');
      } else if (normSale === 'PIEZA') {
        query = query.or('sale_type.ilike.%PIEZA%,sale_type.ilike.%PZA%,sale_type.ilike.%PZ%');
      } else {
        query = query.ilike('sale_type', `%${saleType}%`);
      }
    }

    if (flex !== undefined && flex !== 'all' && flex !== '') {
      const normFlex = normalizeFlex(flex);
      if (normFlex !== null) {
        query = query.eq('flex', normFlex);
      }
    }

    if (minPrice !== undefined) {
      query = query.gte('price', minPrice);
    }
    if (maxPrice !== undefined) {
      query = query.lte('price', maxPrice);
    }

    if (minStock !== undefined && minStock > 0) {
      query = query.gte('quantity', minStock);
    }

    if (search && search.trim()) {
      const s = search.trim();
      const sClean = normalizeText(s);
      const variations = Array.from(new Set([s, sClean])).filter(Boolean);
      const orClauses = variations.flatMap((v) => [
        `reference.ilike.%${v}%`,
        `code.ilike.%${v}%`,
        `description.ilike.%${v}%`,
      ]);
      if (sClean.includes('nin') || sClean.includes('kid')) {
        orClauses.push('gender.ilike.%Niño%', 'gender.ilike.%Kids%');
      }

      // Check if search matches optical boxing notation e.g. "55-18-143" or "55 18 143"
      const opticalMatch = s.match(/(\d{2})[-–\s](\d{2})[-–\s](\d{2,3})/);
      if (opticalMatch) {
        const eye = opticalMatch[1];
        const bridge = opticalMatch[2];
        const temple = opticalMatch[3];
        orClauses.push(
          `frame_size.ilike.%${eye}-${bridge}-${temple}%`,
          `frame_size.ilike.%${eye} ${bridge} ${temple}%`
        );
      }

      query = query.or(orClauses.join(','));
    }

    // Chronological order from today backwards: newest activity/update first, then created_at, then reference
    query = query
      .order('updated_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false, nullsFirst: false })
      .order('reference', { ascending: true })
      .range(from, to);

    const { data, count, error } = await query;

    if (!error && data) {
      const totalCount = count !== null && count !== undefined ? count : data.length;
      const totalPages = Math.ceil(totalCount / pageSize) || 1;
      const products = data.map(mapSupabaseToProduct);

      return { products, totalCount, page, pageSize, totalPages };
    }

    if (error) {
      console.warn('[getProducts] Supabase direct query failed, falling back to metaMap:', error);
    }
  } catch (e) {
    console.error('[getProducts] Unexpected error querying Supabase:', e);
  }

  // Fallback to metaMap if offline or unexpected error
  try {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const bClean = brandName && brandName !== 'all' ? normalizeText(brandName) : null;
    const cClean = categoryName && categoryName !== 'all' ? normalizeText(categoryName) : null;
    const mClean = material && material !== 'all' ? normalizeText(material) : null;
    const filterGen = gender && gender !== 'all' ? normalizeGender(gender) : null;
    const filterSale = saleType && saleType !== 'all' ? normalizeSaleType(saleType) : null;
    const filterFlex = flex !== undefined && flex !== 'all' ? normalizeFlex(flex) : null;
    const sClean = search && search.trim() ? normalizeText(search) : null;

    // LIFO order for fallback as well (Object.keys in reverse order)
    const allRefs = Object.keys(metaMap).reverse();

    const matchedRefs = allRefs.filter((ref) => {
      const item = metaMap[ref];
      if (bClean && !normalizeText(item.b).includes(bClean)) return false;
      if (cClean && !normalizeText(item.c).includes(cClean)) return false;
      if (mClean && item.m && !normalizeText(item.m).includes(mClean)) return false;
      if (filterGen) {
        const itemGender = normalizeGender(item.g || resolveCleanGender(ref, '', '', ''));
        if (itemGender !== filterGen) return false;
      }
      if (filterSale && filterSale !== 'PIEZA') return false;
      if (filterFlex !== null && filterFlex !== true) return false;
      if (minPrice !== undefined && item.p < minPrice) return false;
      if (maxPrice !== undefined && item.p > maxPrice) return false;
      if (minStock !== undefined && (item.q || 0) < minStock) return false;
      if (sClean && !normalizeText(ref).includes(sClean) && !normalizeText(item.b).includes(sClean)) return false;
      return true;
    });

    const totalCount = matchedRefs.length;
    const totalPages = Math.ceil(totalCount / pageSize) || 1;
    const pageRefs = matchedRefs.slice(from, to + 1);

    const productsList = pageRefs.map((ref) => {
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

    return { products: productsList, totalCount, page, pageSize, totalPages };
  } catch (err) {
    console.error('[getProducts] Fallback failed:', err);
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
    const clean = normalizeBrandName(b.name);
    if (clean) {
      dynamicBrandsMap.set(clean, {
        id: b.id || clean.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        name: clean,
        active: true,
      });
    }
  }
});

Object.values(metaMap).forEach((m) => {
  if (m.b && m.b !== 'Dubros') {
    const clean = normalizeBrandName(m.b);
    if (clean && !dynamicBrandsMap.has(clean)) {
      dynamicBrandsMap.set(clean, {
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
      .neq('active', false)
      .order('name', { ascending: true });

    if (error || !data || data.length === 0) {
      return FALLBACK_BRANDS;
    }

    const cleanBrands: SupabaseBrand[] = [];
    const seen = new Set<string>();
    for (const b of data) {
      if (b.active === false) continue;
      const upper = normalizeBrandName(b.name);
      if (!upper) continue;
      if (!seen.has(upper)) {
        seen.add(upper);
        cleanBrands.push({
          id: b.id,
          name: upper,
          active: true,
        });
      }
    }

    return cleanBrands.sort((a, b) => a.name.localeCompare(b.name));
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

    const source = (error || !data || data.length === 0) ? FALLBACK_CATEGORIES : data;

    // Deduplicate and filter out unwanted categories (palo, 2, trapera, escoba, general, guias)
    const seen = new Map<string, SupabaseCategory>();
    for (const cat of source) {
      const canonical = normalizeCategoryName(cat.name);
      if (!canonical) continue;
      if (!seen.has(canonical)) {
        seen.set(canonical, {
          id: cat.id,
          name: canonical,
          slug: cat.slug || canonical.toLowerCase().replace(/\s+/g, '-'),
        });
      }
    }

    return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name, 'es'));
  } catch (e) {
    console.error('[getCategories] Unexpected error:', e);
    return FALLBACK_CATEGORIES;
  }
}

// ---------------------------------------------------------------------------
// Fetch unique materials from products
// ---------------------------------------------------------------------------

const CORE_MATERIALS = [
  'Acetato',
  'Metal',
  'Pasta',
  'TR90',
  'Plástico',
  'Acrílico',
  'Silicona',
  'Titanio',
  'Nylon',
  'Ultem',
  'Sintético',
  'Policarbonato',
  'Poliéster',
  'PVC',
  'Acetato / Metal',
  'Aluminio',
];

export async function getMaterials(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('material')
      .not('material', 'is', null)
      .not('material', 'eq', 'N/A')
      .not('material', 'eq', '0')
      .not('material', 'eq', 'S-M')
      .not('material', 'eq', 'SM')
      .not('material', 'eq', 'GENERAL')
      .not('material', 'eq', '')
      .limit(3000);

    if (error || !data || data.length === 0) {
      return CORE_MATERIALS;
    }

    const formatMaterial = (m: string) => {
      const clean = m.trim();
      const upper = clean.toUpperCase();
      if (upper === 'TR90') return 'TR90';
      if (upper === 'PVC') return 'PVC';
      if (upper === 'ACETATO / METAL') return 'Acetato / Metal';
      if (upper === 'PLASTICO') return 'Plástico';
      if (upper === 'ACRILICO') return 'Acrílico';
      if (upper === 'SINTETICO') return 'Sintético';
      if (upper === 'POLIESTER') return 'Poliéster';
      if (upper === 'TITANIUM') return 'Titanio';
      return clean.charAt(0).toUpperCase() + clean.slice(1);
    };

    const seen = new Set<string>();
    const result: string[] = [];

    // Core materials first
    for (const m of CORE_MATERIALS) {
      const k = normalizeText(m);
      if (!seen.has(k)) {
        seen.add(k);
        result.push(m);
      }
    }

    // Additional materials from DB
    for (const row of data) {
      if (!row.material) continue;
      const formatted = formatMaterial(row.material);
      const k = normalizeText(formatted);
      if (!seen.has(k) && k.length > 1) {
        seen.add(k);
        result.push(formatted);
      }
    }

    return result;
  } catch (e) {
    console.error('[getMaterials] Unexpected error:', e);
    return CORE_MATERIALS;
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

export async function getAvailableEyeSizes(): Promise<number[]> {
  const standardEyeSizes = [38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62];
  try {
    const { data, error } = await supabase
      .from('products')
      .select('eye_size')
      .not('eye_size', 'is', null)
      .gt('eye_size', 0)
      .limit(5000);

    if (!error && data && data.length > 0) {
      const distinct = Array.from(new Set(data.map((d: any) => Number(d.eye_size)).filter((n) => !isNaN(n) && n > 0 && n <= 62)))
        .sort((a, b) => a - b);
      return Array.from(new Set([...distinct, ...standardEyeSizes])).sort((a, b) => a - b);
    }
  } catch (e) {
    console.error('[getAvailableEyeSizes] Error:', e);
  }
  // Standard optical eye sizes fallback (calibres ópticos estándar hasta 62 mm)
  return standardEyeSizes;
}

export async function getAvailableBridgeSizes(): Promise<number[]> {
  const standardBridgeSizes = [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26];
  try {
    const { data, error } = await supabase
      .from('products')
      .select('bridge_size')
      .not('bridge_size', 'is', null)
      .gt('bridge_size', 0)
      .limit(5000);

    if (!error && data && data.length > 0) {
      const distinct = Array.from(new Set(data.map((d: any) => Number(d.bridge_size)).filter((n) => !isNaN(n) && n > 0 && n <= 26)))
        .sort((a, b) => a - b);
      return Array.from(new Set([...distinct, ...standardBridgeSizes])).sort((a, b) => a - b);
    }
  } catch (e) {
    console.error('[getAvailableBridgeSizes] Error:', e);
  }
  // Standard optical bridge sizes fallback (ancho de puente nasal estándar hasta 26 mm)
  return standardBridgeSizes;
}

export async function getAvailableTempleLengths(): Promise<number[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('temple_length')
      .not('temple_length', 'is', null)
      .gt('temple_length', 0)
      .limit(5000);

    if (!error && data && data.length > 0) {
      const distinct = Array.from(new Set(data.map((d: any) => Number(d.temple_length)).filter((n) => !isNaN(n) && n > 0)))
        .sort((a, b) => a - b);
      if (distinct.length > 0) return distinct;
    }
  } catch (e) {
    console.error('[getAvailableTempleLengths] Error:', e);
  }
  // Standard optical temple lengths fallback (longitud de varilla/patilla estándar en mm)
  return [125, 130, 135, 138, 140, 142, 143, 145, 148, 150];
}
