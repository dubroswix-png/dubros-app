// =============================================================================
// API Route: Sync ERP Catalog → Supabase (Paginated / Chunked)
// =============================================================================
// Protected admin endpoint that downloads products page-by-page from the
// Switch-Soft ERP and upserts them into Supabase.
// Prevents Serverless Function timeouts on Vercel (10s limit).
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { erpListArticles, mapArticleToProduct } from '@/lib/erp';

// Max execution duration for Vercel Serverless Functions (in seconds)
export const maxDuration = 60;

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  return createClient(url, serviceKey);
}

const AUTHORIZED_EMAILS = [
  'dubroswix@gmail.com',
  'dfduqu01@gmail.com',
  'ventasfrancisco@dubros.com',
  'ventas@dubros.com',
  'yorgelis.t7@hotmail.com',
];
const isUserAuthorized = (email?: string | null) => Boolean(email && AUTHORIZED_EMAILS.includes(email.toLowerCase().trim()));

// Simple authorization check — validates the requesting user is an admin or manager
async function isAdmin(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return false;

  const token = authHeader.replace('Bearer ', '');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    '';

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return false;

  if (isUserAuthorized(user.email)) return true;

  try {
    const adminSupabase = getSupabaseAdmin();
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    return profile?.role === 'admin' || profile?.role === 'gerente' || profile?.role === 'manager';
  } catch {
    return isUserAuthorized(user.email);
  }
}

export async function POST(request: NextRequest) {
  try {
    // 0. Verify required environment variables on Vercel
    const requiredVars = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'ERP_BASE_URL', 'ERP_USER', 'ERP_PASS', 'ERP_AUTH_APP', 'ERP_TIPO_APP'];
    const missingVars = requiredVars.filter((v) => !process.env[v]);
    if (missingVars.length > 0) {
      return NextResponse.json(
        { error: `Variables de entorno faltantes en Vercel: ${missingVars.join(', ')}. Por favor agrégalas en Vercel Dashboard -> Settings -> Environment Variables.` },
        { status: 500 }
      );
    }

    // 1. Verify admin access
    const admin = await isAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores pueden sincronizar.' },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const page = Math.max(1, parseInt(body.page || '1', 10));

    const supabase = getSupabaseAdmin();
    const startTime = Date.now();

    // 2. Fetch single page from ERP
    const erpResponse = await erpListArticles(page);
    if (!erpResponse?.data?.articulos) {
      return NextResponse.json(
        { error: `No se pudieron obtener artículos de la página ${page} del ERP.` },
        { status: 502 }
      );
    }

    const erpArticles = erpResponse.data.articulos;
    const paginacion = erpResponse.data.paginacion || { total: erpArticles.length, porPagina: 500, paginaActual: page };
    const totalPages = Math.ceil(paginacion.total / (paginacion.porPagina || 500)) || 1;

    // 3. Map ERP articles to Supabase format
    const mappedProducts = erpArticles.map(mapArticleToProduct);

    const normalizeBrandForSync = (b?: string | null) => {
      if (!b) return 'SIN MARCA';
      const clean = b.toUpperCase().trim();
      if (clean === 'SIN MARCA' || clean === 'SM' || clean === 'S-M' || clean === 'SINMARCA' || clean === 'GENERAL' || clean === 'N/A' || clean === 'NONE') {
        return 'SIN MARCA';
      }
      return b.trim();
    };

    // 4. Ensure brands exist for this page (conflict target: slug)
    const uniqueBrands = [...new Set(mappedProducts.map(p => normalizeBrandForSync(p.brand)))];
    for (const brandName of uniqueBrands) {
      const slug = brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      await supabase
        .from('brands')
        .upsert(
          { name: brandName, slug, active: true },
          { onConflict: 'slug' }
        );
    }

    // 5. Ensure categories exist for this page (conflict target: slug)
    const uniqueCategories = [...new Set(mappedProducts.map(p => p.category).filter(Boolean))];
    for (const catName of uniqueCategories) {
      const slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      await supabase
        .from('categories')
        .upsert(
          { name: catName, slug },
          { onConflict: 'slug' }
        );
    }

    // 6. Fetch brand & category ID maps from Supabase
    const { data: brands } = await supabase.from('brands').select('id, name, slug');
    const { data: categories } = await supabase.from('categories').select('id, name, slug');

    const brandMap = new Map<string, string>();
    brands?.forEach(b => {
      brandMap.set(b.name.toUpperCase(), b.id);
      if (b.slug) brandMap.set(b.slug.toLowerCase(), b.id);
    });

    const categoryMap = new Map<string, string>();
    categories?.forEach(c => {
      categoryMap.set(c.name.toUpperCase(), c.id);
      if (c.slug) categoryMap.set(c.slug.toLowerCase(), c.id);
    });

    function detectGender(name: string = '', cat: string = '', mat: string = ''): string {
      const text = `${name} ${cat} ${mat}`.toUpperCase();
      if (text.includes('KIDS') || text.includes('NIÑO') || text.includes('NINO') || text.includes('NIÑA') || text.includes('NINA') || text.includes('INFANTIL') || text.includes('PEQUE') || text.includes('JUNIOR')) {
        return 'Niños';
      }
      if (text.includes('DAMA') || text.includes('MUJER') || text.includes('LADY') || text.includes('WOMEN') || text.includes('FEMENIN')) {
        return 'Mujer';
      }
      if (text.includes('CABALLERO') || text.includes('HOMBRE') || text.includes('MEN') || text.includes('MAN') || text.includes('MASCULIN')) {
        return 'Hombre';
      }
      return 'Unisex';
    }

    // 7. Check existing products to protect manually edited fields from being overwritten by Switch ERP
    const skus = mappedProducts.map(p => p.sku);
    const { data: existingProducts } = await supabase
      .from('products')
      .select('id, reference, thumbnail_url, large_image_url, brand_id, category_id, description, material, gender, flex, sale_type')
      .in('reference', skus);

    const existingMap = new Map<string, any>();
    existingProducts?.forEach(p => existingMap.set(p.reference.toUpperCase(), p));

    const productsToUpsert = mappedProducts.map(p => {
      const existing = existingMap.get(p.sku.toUpperCase());
      const brandClean = normalizeBrandForSync(p.brand);
      const bSlug = brandClean.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const cSlug = p.category ? p.category.toLowerCase().replace(/[^a-z0-9]+/g, '-') : '';

      const brandId = brandMap.get(brandClean.toUpperCase()) || brandMap.get(bSlug) || null;

      const categoryId = p.category
        ? (categoryMap.get(p.category.toUpperCase()) || categoryMap.get(cSlug) || null)
        : null;

      if (existing) {
        // EXISTING PRODUCT: Protect manually entered fields!
        // Only update price, quantity (stock), cost and updated_at from Switch ERP
        return {
          id: existing.id,
          reference: p.sku,
          code: p.sku,
          price: p.price,
          quantity: p.stock,
          cost: p.cost,
          description: existing.description || p.name,
          material: existing.material || p.material,
          gender: existing.gender || detectGender(p.name, p.category, p.material),
          sale_type: existing.sale_type || (p.unit?.toUpperCase().includes('DOC') ? 'DOCENA' : 'PIEZA'),
          flex: existing.flex ?? true,
          thumbnail_url: existing.thumbnail_url || p.image_url,
          large_image_url: existing.large_image_url || p.image_url,
          brand_id: existing.brand_id || brandId,
          category_id: existing.category_id || categoryId,
          updated_at: new Date().toISOString(),
        };
      }

      // NEW PRODUCT:
      return {
        reference: p.sku,
        code: p.sku,
        description: p.name,
        price: p.price,
        cost: p.cost,
        material: p.material,
        gender: detectGender(p.name, p.category, p.material),
        quantity: p.stock,
        sale_type: p.unit?.toUpperCase().includes('DOC') ? 'DOCENA' : 'PIEZA',
        thumbnail_url: p.image_url,
        large_image_url: p.image_url,
        brand_id: brandId,
        category_id: categoryId,
        flex: true,
      };
    });

    // 8. Upsert in batches of 500
    const BATCH_SIZE = 500;
    let totalInserted = 0;
    const errors: string[] = [];

    for (let i = 0; i < productsToUpsert.length; i += BATCH_SIZE) {
      const batch = productsToUpsert.slice(i, i + BATCH_SIZE);

      const { data, error } = await supabase
        .from('products')
        .upsert(batch, { onConflict: 'reference' })
        .select('id');

      if (error) {
        errors.push(`Página ${page} Lote ${Math.floor(i / BATCH_SIZE) + 1}: ${error.message}`);
      } else {
        totalInserted += data?.length || 0;
      }
    }

    const totalTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      page,
      totalPages,
      totalFromERP: paginacion.total,
      processedThisPage: totalInserted,
      isFinished: page >= totalPages,
      brandsCreated: uniqueBrands.length,
      categoriesCreated: uniqueCategories.length,
      timeMs: totalTime,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('[Sync ERP Paginated] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error desconocido al sincronizar la página.' },
      { status: 500 }
    );
  }
}
