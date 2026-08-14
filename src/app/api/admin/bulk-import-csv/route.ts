// =============================================================================
// API Route: Bulk Import CSV Articles
// =============================================================================
// Imports an array of product rows parsed from a CSV file into Supabase.
// Automatically creates brands and categories, then batch upserts products.
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Max execution duration for Vercel Serverless Functions (in seconds)
export const maxDuration = 60;

function getSupabaseAdmin() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    'https://nvjkwoahdtbnvrvqqfyb.supabase.co';
  const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const serviceKey =
    rawKey && rawKey !== 'YOUR_SERVICE_ROLE_KEY_HERE'
      ? rawKey
      : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52amt3b2FoZHRibnZydnFxZnliIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDgyMjIxMCwiZXhwIjoyMTAwMzk4MjEwfQ.WzMV59bsXtaMk-yMdMJdvoFbhrH0FvtEO0qQSsot4QQ';

  return createClient(url, serviceKey);
}

// Helper to find column value across case-insensitive/similar header names
function getRowValue(row: Record<string, any>, possibleKeys: string[]): string {
  const rowKeys = Object.keys(row);
  for (const key of possibleKeys) {
    // Exact match
    if (row[key] !== undefined && row[key] !== null) {
      return String(row[key]).trim();
    }
    // Case-insensitive match
    const foundKey = rowKeys.find(
      (k) => k.toLowerCase().replace(/\s+/g, '') === key.toLowerCase().replace(/\s+/g, '')
    );
    if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null) {
      return String(row[foundKey]).trim();
    }
  }
  return '';
}

// Verify admin authorization
async function isAdmin(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return false;

  const token = authHeader.replace('Bearer ', '');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return false;

  const adminSupabase = getSupabaseAdmin();
  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return profile?.role === 'admin';
}

export async function POST(request: NextRequest) {
  try {
    const admin = await isAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores pueden importar datos.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { rows } = body;

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { error: 'No se recibieron filas válidas para importar.' },
        { status: 400 }
      );
    }

    if (rows.length > 10000) {
      return NextResponse.json(
        { error: 'El archivo excede el límite máximo de 10,000 filas por importación.' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // 1. Extract unique Brands and Categories from rows
    const uniqueBrands = new Set<string>();
    const uniqueCategories = new Set<string>();

    rows.forEach((row) => {
      const brand = getRowValue(row, ['Marca', 'Brand', 'marca', 'brand']);
      const cat = getRowValue(row, ['Categoria', 'Category', 'categoria', 'category', 'Rubro']);

      if (brand) uniqueBrands.add(brand.toUpperCase());
      if (cat) uniqueCategories.add(cat);
    });

    // 2. Fetch existing Brands and Categories from Supabase
    const { data: existingBrands } = await supabase.from('brands').select('id, name');
    const { data: existingCategories } = await supabase.from('categories').select('id, name');

    const brandMap = new Map<string, string>();
    existingBrands?.forEach((b) => brandMap.set(b.name.toUpperCase(), b.id));

    const categoryMap = new Map<string, string>();
    existingCategories?.forEach((c) => categoryMap.set(c.name.toUpperCase(), c.id));

    // 3. Insert missing Brands
    const newBrands = Array.from(uniqueBrands)
      .filter((b) => !brandMap.has(b))
      .map((name) => ({ name }));

    let brandsCreated = 0;
    if (newBrands.length > 0) {
      const { data: insertedBrands, error: bErr } = await supabase
        .from('brands')
        .insert(newBrands)
        .select('id, name');

      if (!bErr && insertedBrands) {
        insertedBrands.forEach((b) => brandMap.set(b.name.toUpperCase(), b.id));
        brandsCreated = insertedBrands.length;
      }
    }

    // 4. Insert missing Categories
    const newCategories = Array.from(uniqueCategories)
      .filter((c) => !categoryMap.has(c.toUpperCase()))
      .map((name) => ({ name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') }));

    let categoriesCreated = 0;
    if (newCategories.length > 0) {
      const { data: insertedCats, error: cErr } = await supabase
        .from('categories')
        .insert(newCategories)
        .select('id, name');

      if (!cErr && insertedCats) {
        insertedCats.forEach((c) => categoryMap.set(c.name.toUpperCase(), c.id));
        categoriesCreated = insertedCats.length;
      }
    }

    // 5. Build products array for batch upsert
    const productsToUpsert: any[] = [];

    rows.forEach((row, idx) => {
      const codigo = getRowValue(row, ['Codigo', 'codigo', 'Code', 'SKU', 'sku']);
      const ref = getRowValue(row, ['Referencia', 'referencia', 'Reference', 'ref']) || codigo || `CSV-${idx + 1}`;
      const code = codigo || ref || `CSV-${idx + 1}`;
      const desc = getRowValue(row, ['Descripcion', 'descripcion', 'Description', 'name', 'Nombre']) || 'Producto importado';
      const priceStr = getRowValue(row, ['Precio', 'precio', 'Price']);
      const price = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;
      const material = getRowValue(row, ['Material', 'material', 'Subrubro']) || 'N/A';
      const qtyStr = getRowValue(row, ['Cantidad', 'cantidad', 'Stock', 'Quantity']);
      const quantity = parseInt(qtyStr.replace(/[^0-9]/g, ''), 10) || 0;
      const saleType = getRowValue(row, ['Tipo de Venta', 'tipoventa', 'SaleType', 'Unidad']) || 'PIEZA';
      const brandName = getRowValue(row, ['Marca', 'Brand', 'marca', 'brand']).toUpperCase();
      const catName = getRowValue(row, ['Categoria', 'Category', 'categoria', 'category', 'Rubro']).toUpperCase();

      productsToUpsert.push({
        reference: ref,
        code: code,
        description: desc,
        price: price,
        material: material,
        quantity: quantity,
        sale_type: saleType,
        thumbnail_url: '/images/product-placeholder.png',
        large_image_url: '/images/product-placeholder.png',
        brand_id: brandMap.get(brandName) || null,
        category_id: categoryMap.get(catName) || null,
      });
    });

    // 6. Batch upsert into products (chunks of 500)
    const BATCH_SIZE = 500;
    let successCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < productsToUpsert.length; i += BATCH_SIZE) {
      const chunk = productsToUpsert.slice(i, i + BATCH_SIZE);

      const { error: upsertErr } = await supabase
        .from('products')
        .upsert(chunk, { onConflict: 'reference' });

      if (upsertErr) {
        console.error(`[Bulk Import CSV] Upsert chunk error:`, upsertErr);
        errors.push(`Error en lote ${Math.floor(i / BATCH_SIZE) + 1}: ${upsertErr.message}`);
      } else {
        successCount += chunk.length;
      }
    }

    return NextResponse.json({
      success: errors.length === 0,
      count: successCount,
      totalRows: rows.length,
      brandsCreated,
      categoriesCreated,
      errors: errors.length > 0 ? errors : undefined,
      message: `Carga masiva finalizada. ${successCount} productos actualizados/creados exitosamente.`,
    });
  } catch (error) {
    console.error('[Bulk Import CSV] Unexpected error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Error interno procesando el archivo CSV.',
      },
      { status: 500 }
    );
  }
}
