// =============================================================================
// API Route: Sync ERP Catalog → Supabase
// =============================================================================
// Protected admin endpoint that downloads the full product catalog from the
// Switch-Soft ERP and upserts it into the Supabase `products` table.
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { erpFetchAllArticles, mapArticleToProduct } from '@/lib/erp';
import type { SupabaseProductFromERP } from '@/lib/erp-types';

// Use service role key for admin operations (bypasses RLS)
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  }

  return createClient(url, serviceKey);
}

// Simple admin check — validates the requesting user is an admin
async function isAdmin(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return false;

  const token = authHeader.replace('Bearer ', '');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return false;

  // Check user role in profiles table
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
    // 1. Verify admin access
    const admin = await isAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores pueden sincronizar.' },
        { status: 403 }
      );
    }

    const supabase = getSupabaseAdmin();
    const startTime = Date.now();

    // 2. Fetch all articles from ERP
    const erpArticles = await erpFetchAllArticles();
    const fetchTime = Date.now() - startTime;

    // 3. Map ERP articles to Supabase format
    const mappedProducts = erpArticles.map(mapArticleToProduct);

    // 4. Ensure brands exist (collect unique brands)
    const uniqueBrands = [...new Set(mappedProducts.map(p => p.brand).filter(Boolean))];
    for (const brandName of uniqueBrands) {
      await supabase
        .from('brands')
        .upsert(
          { name: brandName, slug: brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-'), active: true },
          { onConflict: 'name' }
        );
    }

    // 5. Ensure categories exist (collect unique categories)
    const uniqueCategories = [...new Set(mappedProducts.map(p => p.category).filter(Boolean))];
    for (const catName of uniqueCategories) {
      await supabase
        .from('categories')
        .upsert(
          { name: catName, slug: catName.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
          { onConflict: 'name' }
        );
    }

    // 6. Fetch brand & category ID maps from Supabase
    const { data: brands } = await supabase.from('brands').select('id, name');
    const { data: categories } = await supabase.from('categories').select('id, name');

    const brandMap = new Map<string, string>();
    brands?.forEach(b => brandMap.set(b.name, b.id));

    const categoryMap = new Map<string, string>();
    categories?.forEach(c => categoryMap.set(c.name, c.id));

    // 7. Prepare products for upsert (match existing schema)
    const productsToUpsert = mappedProducts.map(p => ({
      reference: p.sku,
      code: p.sku,
      description: p.name,
      price: p.price,
      material: p.material,
      quantity: p.stock,
      sale_type: p.unit,
      thumbnail_url: p.image_url,
      large_image_url: p.image_url,
      brand_id: brandMap.get(p.brand) || null,
      category_id: categoryMap.get(p.category) || null,
      erp_article_id: p.erp_id || null,
    }));

    // 8. Upsert in batches of 500 to avoid payload limits
    const BATCH_SIZE = 500;
    let totalInserted = 0;
    let totalUpdated = 0;
    const errors: string[] = [];

    for (let i = 0; i < productsToUpsert.length; i += BATCH_SIZE) {
      const batch = productsToUpsert.slice(i, i + BATCH_SIZE);

      const { data, error } = await supabase
        .from('products')
        .upsert(batch, { onConflict: 'reference' })
        .select('id');

      if (error) {
        errors.push(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${error.message}`);
      } else {
        totalInserted += data?.length || 0;
      }
    }

    const totalTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      summary: {
        totalFromERP: erpArticles.length,
        totalProcessed: totalInserted,
        brandsCreated: uniqueBrands.length,
        categoriesCreated: uniqueCategories.length,
        fetchTimeMs: fetchTime,
        totalTimeMs: totalTime,
        errors: errors.length > 0 ? errors : undefined,
      },
    });
  } catch (error) {
    console.error('[Sync ERP] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error desconocido al sincronizar' },
      { status: 500 }
    );
  }
}
