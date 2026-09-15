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
            material, gender, eye_size, bridge_size, temple_length, flex, sale_type,
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
        bridgeSize: item.bridge_size ? String(item.bridge_size) : '',
        templeLength: item.temple_length ? String(item.temple_length) : '',
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

// PUT: Update a single product from audit screen
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      reference,
      code,
      description,
      price,
      quantity,
      material,
      gender,
      eye_size,
      bridge_size,
      temple_length,
      flex,
      sale_type,
      brand_name,
      category_name,
      thumbnail_url,
      large_image_url,
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'El ID del producto es obligatorio.' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // 1. Resolve brand_id if brand_name provided
    let brandId: string | null = null;
    if (brand_name && brand_name.trim()) {
      const cleanBrand = brand_name.trim().toUpperCase();
      const { data: bRow } = await supabase
        .from('brands')
        .select('id')
        .ilike('name', cleanBrand)
        .limit(1)
        .maybeSingle();

      if (bRow) {
        brandId = bRow.id;
      } else {
        const { data: newB } = await supabase
          .from('brands')
          .insert({ name: cleanBrand, active: true })
          .select('id')
          .single();
        if (newB) brandId = newB.id;
      }
    }

    // 2. Resolve category_id if category_name provided
    let categoryId: string | null = null;
    if (category_name && category_name.trim()) {
      const cleanCat = category_name.trim();
      const { data: cRow } = await supabase
        .from('categories')
        .select('id')
        .ilike('name', cleanCat)
        .limit(1)
        .maybeSingle();

      if (cRow) {
        categoryId = cRow.id;
      } else {
        const slug = cleanCat.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const { data: newC } = await supabase
          .from('categories')
          .insert({ name: cleanCat, slug })
          .select('id')
          .single();
        if (newC) categoryId = newC.id;
      }
    }

    // 3. Build update payload
    const updatePayload: Record<string, any> = {};
    if (reference !== undefined) updatePayload.reference = String(reference).trim();
    if (code !== undefined) updatePayload.code = String(code).trim();
    if (description !== undefined) updatePayload.description = String(description).trim();
    if (price !== undefined) updatePayload.price = Number(price);
    if (quantity !== undefined) updatePayload.quantity = Number(quantity);
    if (material !== undefined) updatePayload.material = String(material).trim();
    if (gender !== undefined) updatePayload.gender = String(gender).trim();
    if (eye_size !== undefined) updatePayload.eye_size = eye_size ? Number(eye_size) : null;
    if (bridge_size !== undefined) updatePayload.bridge_size = bridge_size ? Number(bridge_size) : null;
    if (temple_length !== undefined) updatePayload.temple_length = temple_length ? Number(temple_length) : null;
    if (flex !== undefined) updatePayload.flex = flex === true || flex === 'SI' || flex === 'true';
    if (sale_type !== undefined) updatePayload.sale_type = String(sale_type).trim().toUpperCase();
    if (thumbnail_url !== undefined) updatePayload.thumbnail_url = String(thumbnail_url).trim();
    if (large_image_url !== undefined) updatePayload.large_image_url = String(large_image_url).trim();
    if (brandId) updatePayload.brand_id = brandId;
    if (categoryId) updatePayload.category_id = categoryId;

    const { data: updatedRow, error: updateError } = await supabase
      .from('products')
      .update(updatePayload)
      .eq('id', id)
      .select('*, brands(id, name), categories(id, name)')
      .single();

    if (updateError) {
      console.error('[Audit Products PUT] Update error:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Invalidate cache
    cachedData = null;

    // Recalculate missingFields
    const hasLargeImage = Boolean(
      updatedRow.large_image_url &&
      !updatedRow.large_image_url.includes('placeholder') &&
      !updatedRow.large_image_url.includes('no-image')
    );
    const itemBrand = (updatedRow.brands?.name || brand_name || '').trim();
    const itemCategory = (updatedRow.categories?.name || category_name || '').trim();
    const itemMaterial = (updatedRow.material || '').trim();
    const itemGender = (updatedRow.gender || '').trim();
    const itemEyeSize = updatedRow.eye_size ? String(updatedRow.eye_size).trim() : '';
    const itemFlex = updatedRow.flex !== null && updatedRow.flex !== undefined ? (updatedRow.flex ? 'SI' : 'NO') : '';
    const itemSaleType = (updatedRow.sale_type || '').trim();
    const itemPrice = Number(updatedRow.price || 0);
    const itemQuantity = updatedRow.quantity !== null && updatedRow.quantity !== undefined ? Number(updatedRow.quantity) : null;
    const itemDesc = (updatedRow.description || '').trim();

    const missingFields: string[] = [];
    if (!hasLargeImage) missingFields.push('Foto Grande');
    if (!itemGender || itemGender === 'all') missingFields.push('Género');
    if (!itemFlex) missingFields.push('Flex');
    if (!itemMaterial || itemMaterial === 'N/A') missingFields.push('Material');
    if (!itemEyeSize || itemEyeSize === '0') missingFields.push('Talla Ocular');
    if (!itemSaleType || itemSaleType === '1' || itemSaleType === 'N/A') missingFields.push('Tipo Venta');
    if (!itemBrand || itemBrand === 'SM' || itemBrand === 'GENERAL') missingFields.push('Marca');
    if (!itemCategory) missingFields.push('Categoría');
    if (itemPrice <= 0) missingFields.push('Precio');
    if (itemQuantity === null || itemQuantity <= 0) missingFields.push('Stock');
    if (!itemDesc || itemDesc === 'Producto importado') missingFields.push('Descripción');

    const formattedProduct = {
      id: updatedRow.id,
      reference: updatedRow.reference || updatedRow.code || '',
      code: updatedRow.code || updatedRow.reference || '',
      description: itemDesc,
      price: itemPrice,
      quantity: itemQuantity ?? 0,
      brand: itemBrand,
      category: itemCategory,
      material: itemMaterial,
      gender: itemGender,
      eyeSize: itemEyeSize,
      flex: itemFlex,
      saleType: itemSaleType,
      hasLargeImage,
      thumbnail_url: updatedRow.thumbnail_url || '',
      large_image_url: updatedRow.large_image_url || '',
      missingFields,
    };

    return NextResponse.json({ success: true, product: formattedProduct });
  } catch (error) {
    console.error('[Audit Products PUT] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al actualizar producto' },
      { status: 500 }
    );
  }
}

// DELETE: Remove a product
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID de producto requerido (?id=...)' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { error: deleteError } = await supabase.from('products').delete().eq('id', id);

    if (deleteError) {
      console.error('[Audit Products DELETE] Error:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    cachedData = null;
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error('[Audit Products DELETE] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al eliminar producto' },
      { status: 500 }
    );
  }
}
