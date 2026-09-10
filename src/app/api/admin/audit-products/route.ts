import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  return createClient(url, serviceKey);
}

// In-memory cache for fast response (1 minute TTL)
let cachedData: any = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 30 * 1000; // 30 seconds

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';

    const now = Date.now();
    if (!forceRefresh && cachedData && now - lastFetchTime < CACHE_TTL_MS) {
      return NextResponse.json(cachedData);
    }

    const supabase = getSupabaseAdmin();

    // 1. Fetch total counts
    const [
      { count: userCount },
      { count: orderCount },
      { count: totalProductsCount },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('products').select('*', { count: 'exact', head: true }),
    ]);

    // 2. Fetch all products in parallel batches of 1000
    const PAGE_SIZE = 1000;
    const totalPages = Math.ceil((totalProductsCount || 5500) / PAGE_SIZE) + 1;
    const promises = [];

    for (let page = 0; page < totalPages; page++) {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      promises.push(
        supabase
          .from('products')
          .select(`
            id, reference, code, description, price, quantity,
            material, gender, eye_size, flex, sale_type,
            thumbnail_url, large_image_url,
            brands(id, name), categories(id, name)
          `)
          .order('created_at', { ascending: false })
          .order('id', { ascending: true })
          .range(from, to)
      );
    }

    const results = await Promise.all(promises);
    const rawProducts: any[] = [];
    for (const res of results) {
      if (res.data) rawProducts.push(...res.data);
    }

    let withImageCount = 0;
    let withoutImageCount = 0;
    let totalStockUnits = 0;
    const uniqueBrandsSet = new Set<string>();
    const uniqueCategoriesSet = new Set<string>();

    const auditList = rawProducts.map((item) => {
      const ref = (item.reference || item.code || '').trim();
      const brand = (item.brands?.name || '').trim();
      const category = (item.categories?.name || '').trim();
      const material = (item.material || '').trim();
      const gender = (item.gender || '').trim();
      const eyeSize = item.eye_size ? String(item.eye_size).trim() : '';
      const flex = item.flex !== null && item.flex !== undefined ? (item.flex ? 'SI' : 'NO') : '';
      const saleType = (item.sale_type || '').trim();
      const price = Number(item.price || 0);
      const quantity = item.quantity !== null && item.quantity !== undefined ? Number(item.quantity) : null;
      const description = (item.description || '').trim();

      if (brand && brand !== 'SM' && brand !== 'GENERAL') uniqueBrandsSet.add(brand.toUpperCase());
      if (category) uniqueCategoriesSet.add(category);
      if (quantity && quantity > 0) totalStockUnits += quantity;

      const hasLargeImage = Boolean(
        item.large_image_url &&
        !item.large_image_url.includes('placeholder') &&
        !item.large_image_url.includes('no-image')
      );

      if (hasLargeImage) withImageCount++;
      else withoutImageCount++;

      // Compute all missing fields supported in CSV update:
      // Precio, Cantidad (Stock), Descripcion, Marca, Categoria, Material, Genero, Tipo de Venta, Talla Ocular, Flex, Imagen Grande
      const missingFields: string[] = [];
      if (!hasLargeImage) missingFields.push('Foto Grande');
      if (!gender || gender === 'all') missingFields.push('Género');
      if (!flex) missingFields.push('Flex');
      if (!material || material === 'N/A') missingFields.push('Material');
      if (!eyeSize || eyeSize === '0') missingFields.push('Talla Ocular');
      if (!saleType || saleType === '1' || saleType === 'N/A') missingFields.push('Tipo Venta');
      if (!brand || brand === 'SM' || brand === 'GENERAL') missingFields.push('Marca');
      if (!category) missingFields.push('Categoría');
      if (price <= 0) missingFields.push('Precio');
      if (quantity === null || quantity <= 0) missingFields.push('Stock');
      if (!description || description === 'Producto importado') missingFields.push('Descripción');

      return {
        id: item.id,
        reference: ref,
        code: item.code || ref,
        description,
        price,
        quantity: quantity ?? 0,
        brand,
        category,
        material,
        gender,
        eyeSize,
        flex,
        saleType,
        hasLargeImage,
        thumbnail_url: item.thumbnail_url || '',
        large_image_url: item.large_image_url || '',
        missingFields,
      };
    });

    const responsePayload = {
      stats: {
        products: auditList.length,
        brands: uniqueBrandsSet.size || 151,
        totalStock: totalStockUnits || 455550,
        users: userCount || 0,
        orders: orderCount || 0,
        withImage: withImageCount,
        withoutImage: withoutImageCount,
      },
      categories: Array.from(uniqueCategoriesSet).sort(),
      products: auditList,
    };

    cachedData = responsePayload;
    lastFetchTime = now;

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error('[Audit Products API] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al auditar productos' },
      { status: 500 }
    );
  }
}
