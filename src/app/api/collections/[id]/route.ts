import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  return createClient(url, serviceKey);
}

// GET /api/collections/[id] -> Get collection details and its products
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();

    const { data: collection, error } = await supabase
      .from('collections')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !collection) {
      return NextResponse.json({ error: 'Colección no encontrada' }, { status: 404 });
    }

    const { data: products } = await supabase
      .from('products')
      .select('id, reference, code, description, price, thumbnail_url, brands(name), categories(name)')
      .eq('collection_id', id);

    return NextResponse.json({
      collection: {
        id: collection.id,
        name: collection.name,
        description: collection.description,
        imageUrl: collection.image_url,
        createdAt: collection.created_at,
        products: products || [],
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error fetching collection' }, { status: 500 });
  }
}

// PUT /api/collections/[id] -> Update collection
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, imageUrl } = body;

    const supabase = getSupabaseAdmin();

    const updates: Record<string, any> = {};
    if (name) updates.name = name.trim();
    if (description !== undefined) updates.description = description?.trim() || null;
    if (imageUrl) updates.image_url = imageUrl.trim();

    const { data: updated, error } = await supabase
      .from('collections')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error || !updated) {
      return NextResponse.json({ error: error?.message || 'Error actualizando colección' }, { status: 500 });
    }

    return NextResponse.json({ success: true, collection: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}

// DELETE /api/collections/[id] -> Delete collection
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();

    // 1. Unset collection_id on associated products
    await supabase
      .from('products')
      .update({ collection_id: null })
      .eq('collection_id', id);

    // 2. Delete collection
    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Colección eliminada exitosamente' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}
