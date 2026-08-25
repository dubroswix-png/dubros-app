import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Max execution duration for Vercel Serverless Functions
export const maxDuration = 60;

const S3_IMAGE_REPO_BASE =
  process.env.ERP_IMAGE_REPO_URL ||
  'https://dubros-image-repository.s3.amazonaws.com';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  return createClient(url, serviceKey);
}

/**
 * Validate whether a product reference has a valid image in the S3 repository
 */
export async function checkImageExists(reference: string): Promise<{ exists: boolean; url: string; contentType?: string }> {
  const cleanRef = reference.trim();
  const imageUrl = `${S3_IMAGE_REPO_BASE}/${encodeURIComponent(cleanRef)}.jpg`;

  try {
    const res = await fetch(imageUrl, {
      method: 'GET',
      headers: {
        'Accept': 'image/jpeg,image/png,image/*',
      },
      cache: 'no-store',
    });

    const contentType = res.headers.get('content-type') || '';
    const isImage = res.ok && contentType.startsWith('image/');

    return {
      exists: isImage,
      url: isImage ? imageUrl : '/images/product-placeholder.png',
      contentType,
    };
  } catch (e) {
    return {
      exists: false,
      url: '/images/product-placeholder.png',
    };
  }
}

// GET /api/admin/validate-images?reference=1312D -> Validate single image
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');

    if (!reference) {
      return NextResponse.json({ error: 'Se requiere el parámetro reference' }, { status: 400 });
    }

    const result = await checkImageExists(reference);
    return NextResponse.json({
      reference,
      ...result,
      s3Repository: S3_IMAGE_REPO_BASE,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error validando imagen' }, { status: 500 });
  }
}

// POST /api/admin/validate-images -> Batch validate a list of product IDs / page of products
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { page = 1, pageSize = 50 } = body;

    const supabase = getSupabaseAdmin();
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data: products, error, count } = await supabase
      .from('products')
      .select('id, reference, code, thumbnail_url', { count: 'exact' })
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error || !products) {
      return NextResponse.json({ error: error?.message || 'Error fetching products' }, { status: 500 });
    }

    let validCount = 0;
    let placeholderCount = 0;
    const updates: { id: string; url: string; hasImage: boolean }[] = [];

    // Check images in parallel (batches of 10)
    const BATCH = 10;
    for (let i = 0; i < products.length; i += BATCH) {
      const chunk = products.slice(i, i + BATCH);
      const results = await Promise.all(
        chunk.map(async (p) => {
          const ref = p.reference || p.code;
          const validation = await checkImageExists(ref);
          return {
            id: p.id,
            url: validation.url,
            hasImage: validation.exists,
          };
        })
      );

      for (const r of results) {
        updates.push(r);
        if (r.hasImage) {
          validCount++;
        } else {
          placeholderCount++;
        }
      }
    }

    // Persist validated thumbnail URLs back to Supabase
    for (const u of updates) {
      await supabase
        .from('products')
        .update({
          thumbnail_url: u.url,
          large_image_url: u.url,
        })
        .eq('id', u.id);
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      success: true,
      page,
      pageSize,
      totalPages,
      totalProducts: total,
      processedThisBatch: products.length,
      validImagesFound: validCount,
      placeholdersAssigned: placeholderCount,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error en validación por lote' }, { status: 500 });
  }
}
