import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  return createClient(url, serviceKey);
}

// GET /api/collections -> List all collections with product counts
export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data: collections, error } = await supabase
      .from('collections')
      .select('*, products(count)')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const formatted = (collections || []).map((col: any) => ({
      id: col.id,
      name: col.name,
      description: col.description || '',
      imageUrl: col.image_url || '/images/collection-titanium.jpg',
      createdAt: col.created_at,
      productCount: col.products?.[0]?.count || 0,
    }));

    return NextResponse.json({ collections: formatted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error fetching collections' }, { status: 500 });
  }
}

// POST /api/collections -> Create a new collection
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, imageUrl, productIds } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'El nombre de la colección es obligatorio.' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { data: collection, error } = await supabase
      .from('collections')
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        image_url: imageUrl?.trim() || '/images/collection-titanium.jpg',
      })
      .select()
      .single();

    if (error || !collection) {
      return NextResponse.json({ error: error?.message || 'Error creando la colección' }, { status: 500 });
    }

    // If productIds provided, assign them to this collection
    if (Array.isArray(productIds) && productIds.length > 0) {
      await supabase
        .from('products')
        .update({ collection_id: collection.id })
        .in('id', productIds);
    }

    return NextResponse.json({
      success: true,
      collection: {
        id: collection.id,
        name: collection.name,
        description: collection.description,
        imageUrl: collection.image_url,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno del servidor' }, { status: 500 });
  }
}
