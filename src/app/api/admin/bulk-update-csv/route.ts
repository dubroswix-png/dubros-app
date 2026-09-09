// =============================================================================
// API Route: Bulk Update CSV Articles
// =============================================================================
// Updates existing products in Supabase using an uploaded CSV file.
// Matches by Reference (or Code/SKU) and only modifies the fields provided
// in the CSV, safely preserving existing images, categories, and attributes.
// Accessible to Admins and Managers (Gerentes).
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

async function isAuthorized(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return false;

  const token = authHeader.replace('Bearer ', '');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return false;

  if (user.email && AUTHORIZED_EMAILS.includes(user.email.toLowerCase().trim())) {
    return true;
  }

  const adminSupabase = getSupabaseAdmin();
  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return profile?.role === 'admin' || profile?.role === 'gerente' || profile?.role === 'manager';
}

function normalizeKey(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s_\-]+/g, '');
}

function getRowValue(row: Record<string, any>, possibleKeys: string[]): string | undefined {
  const rowKeys = Object.keys(row);
  for (const key of possibleKeys) {
    if (row[key] !== undefined && row[key] !== null) {
      const val = String(row[key]).trim();
      if (val !== '') return val;
    }
    const normSearch = normalizeKey(key);
    const foundKey = rowKeys.find((k) => normalizeKey(k) === normSearch);
    if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null) {
      const val = String(row[foundKey]).trim();
      if (val !== '') return val;
    }
  }
  return undefined;
}

export async function POST(request: NextRequest) {
  try {
    const authorized = await isAuthorized(request);
    if (!authorized) {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores y gerentes pueden actualizar productos masivamente.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { rows } = body;

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { error: 'No se recibieron filas para actualizar.' },
        { status: 400 }
      );
    }

    if (rows.length > 10000) {
      return NextResponse.json(
        { error: 'El archivo excede el límite de 10,000 filas por actualización masiva.' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // 1. Build row changes map keyed by normalized reference
    interface ProductChanges {
      price?: number;
      quantity?: number;
      description?: string;
      code?: string;
      material?: string;
      gender?: string;
      sale_type?: string;
      eye_size?: number;
      flex?: boolean;
      brandName?: string;
      categoryName?: string;
      imageUrl?: string;
    }

    const changesByRef = new Map<string, ProductChanges>();
    const originalRefByUpper = new Map<string, string>();
    const uniqueBrandNames = new Set<string>();
    const uniqueCategoryNames = new Set<string>();

    // Unpack rows if they arrived with semicolon/tab delimited keys
    const sanitizedRows = rows.map((rawRow: any) => {
      const keys = Object.keys(rawRow);
      if (keys.length === 1 && (keys[0].includes(';') || keys[0].includes('\t'))) {
        const delim = keys[0].includes(';') ? ';' : '\t';
        const headerParts = keys[0].split(delim).map((k: string) => k.trim().replace(/^["']|["']$/g, ''));
        const valParts = String(rawRow[keys[0]]).split(delim).map((v: string) => v.trim().replace(/^["']|["']$/g, ''));
        const unpacked: Record<string, string> = {};
        headerParts.forEach((h: string, idx: number) => {
          if (h) unpacked[h] = valParts[idx] !== undefined ? valParts[idx] : '';
        });
        return unpacked;
      }
      return rawRow;
    });

    sanitizedRows.forEach((row: any) => {
      const ref = getRowValue(row, ['Referencia', 'referencia', 'Reference', 'ref', 'Codigo', 'codigo', 'Code', 'SKU', 'sku']);
      if (!ref) return;

      const upperRef = ref.toUpperCase();
      originalRefByUpper.set(upperRef, ref);

      const changes: ProductChanges = {};

      const priceVal = getRowValue(row, ['Precio', 'precio', 'Price', 'price', 'PVP', 'pvp']);
      if (priceVal !== undefined) {
        const p = parseFloat(priceVal.replace(/[^0-9.]/g, ''));
        if (!isNaN(p)) changes.price = p;
      }

      const qtyVal = getRowValue(row, ['Cantidad', 'cantidad', 'Stock', 'stock', 'Qty', 'Quantity', 'quantity']);
      if (qtyVal !== undefined) {
        const q = parseInt(qtyVal.replace(/[^0-9]/g, ''), 10);
        if (!isNaN(q)) changes.quantity = q;
      }

      const descVal = getRowValue(row, ['Descripcion', 'descripcion', 'Descripción', 'descripción', 'Description', 'description', 'nombre', 'name', 'Nombre']);
      if (descVal !== undefined) changes.description = descVal;

      const codeVal = getRowValue(row, ['Codigo', 'codigo', 'Código', 'código', 'Code', 'code', 'SKU', 'sku']);
      if (codeVal !== undefined) changes.code = codeVal;

      const matVal = getRowValue(row, ['Material', 'material', 'Subrubro', 'subrubro']);
      if (matVal !== undefined) changes.material = matVal;

      const genVal = getRowValue(row, ['Genero', 'genero', 'Género', 'género', 'Gender', 'gender']);
      if (genVal !== undefined) {
        const cleanG = genVal.trim().toUpperCase();
        if (cleanG === 'MASCULINO' || cleanG === 'HOMBRE' || cleanG === 'MAN' || cleanG === 'MEN') {
          changes.gender = 'Hombre';
        } else if (cleanG === 'FEMENINO' || cleanG === 'MUJER' || cleanG === 'WOMAN' || cleanG === 'WOMEN') {
          changes.gender = 'Mujer';
        } else if (cleanG === 'UNISEX') {
          changes.gender = 'Unisex';
        } else if (cleanG.includes('NIÑ') || cleanG.includes('KID') || cleanG.includes('INFANTIL')) {
          changes.gender = 'Niños';
        } else {
          changes.gender = genVal;
        }
      }

      const saleVal = getRowValue(row, [
        'Tipo Venta',
        'Tipo de Venta',
        'tipoventa',
        'tipo_venta',
        'tipodeventa',
        'SaleType',
        'sale_type',
        'Unidad',
        'unidad'
      ]);
      if (saleVal !== undefined) changes.sale_type = saleVal.toUpperCase();

      const eyeVal = getRowValue(row, [
        'Talla Ocular',
        'talla ocular',
        'talla_ocular',
        'tallaocular',
        'Talla',
        'talla',
        'EyeSize',
        'eye_size',
        'Calibre',
        'calibre'
      ]);
      if (eyeVal !== undefined) {
        const e = parseInt(eyeVal.replace(/[^0-9]/g, ''), 10);
        if (!isNaN(e)) changes.eye_size = e;
      }

      const flexVal = getRowValue(row, ['Flex', 'flex', 'Flex o no Flex', 'flex_o_no_flex', 'EsFlex', 'is_flex']);
      if (flexVal !== undefined) {
        const normalizedFlex = flexVal.toLowerCase().trim();
        if (['true', 'si', 'sí', '1', 'yes', 'flex', 's'].includes(normalizedFlex)) {
          changes.flex = true;
        } else if (['false', 'no', '0', 'noflex', 'no flex', 'n'].includes(normalizedFlex)) {
          changes.flex = false;
        }
      }

      const brandVal = getRowValue(row, ['Marca', 'brand', 'marca', 'Brand']);
      if (brandVal !== undefined) {
        changes.brandName = brandVal.toUpperCase();
        uniqueBrandNames.add(brandVal.toUpperCase());
      }

      const catVal = getRowValue(row, ['Categoria', 'category', 'categoria', 'categoría', 'Category', 'Rubro', 'rubro']);
      if (catVal !== undefined) {
        changes.categoryName = catVal;
        uniqueCategoryNames.add(catVal);
      }

      const imgVal = getRowValue(row, ['Imagen', 'imagen', 'ImageUrl', 'url_imagen', 'Thumbnail']);
      if (imgVal !== undefined && !imgVal.includes('placeholder')) {
        changes.imageUrl = imgVal;
      }

      changesByRef.set(upperRef, changes);
    });

    if (changesByRef.size === 0) {
      return NextResponse.json(
        { error: 'No se encontraron referencias válidas en el archivo CSV.' },
        { status: 400 }
      );
    }

    // 2. Resolve Brands & Categories if needed
    const { data: dbBrands } = await supabase.from('brands').select('id, name, slug');
    const { data: dbCategories } = await supabase.from('categories').select('id, name, slug');

    const brandMap = new Map<string, string>();
    dbBrands?.forEach((b) => {
      brandMap.set(b.name.toUpperCase(), b.id);
      if (b.slug) brandMap.set(b.slug.toLowerCase(), b.id);
    });

    const categoryMap = new Map<string, string>();
    dbCategories?.forEach((c) => {
      categoryMap.set(c.name.toUpperCase(), c.id);
      if (c.slug) categoryMap.set(c.slug.toLowerCase(), c.id);
    });

    for (const bName of Array.from(uniqueBrandNames)) {
      const slug = bName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      if (!brandMap.has(bName) && !brandMap.has(slug)) {
        const { data: newB } = await supabase
          .from('brands')
          .upsert({ name: bName, slug, active: true }, { onConflict: 'slug' })
          .select('id, name, slug')
          .single();
        if (newB) {
          brandMap.set(newB.name.toUpperCase(), newB.id);
          brandMap.set(newB.slug.toLowerCase(), newB.id);
        }
      }
    }

    for (const cName of Array.from(uniqueCategoryNames)) {
      const slug = cName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      if (!categoryMap.has(cName.toUpperCase()) && !categoryMap.has(slug)) {
        const { data: newC } = await supabase
          .from('categories')
          .upsert({ name: cName, slug }, { onConflict: 'slug' })
          .select('id, name, slug')
          .single();
        if (newC) {
          categoryMap.set(newC.name.toUpperCase(), newC.id);
          categoryMap.set(newC.slug.toLowerCase(), newC.id);
        }
      }
    }

    // 3. Process in batches of 500 references
    const allRefsToSearch = Array.from(changesByRef.keys());
    const BATCH_SIZE = 500;
    let totalUpdated = 0;
    const notFoundRefs: string[] = [];
    const errors: string[] = [];

    for (let i = 0; i < allRefsToSearch.length; i += BATCH_SIZE) {
      const batchRefs = allRefsToSearch.slice(i, i + BATCH_SIZE);

      // Fetch existing products matching these references
      const { data: existingProducts, error: fetchErr } = await supabase
        .from('products')
        .select('*')
        .in('reference', batchRefs);

      if (fetchErr) {
        errors.push(`Error consultando lote ${Math.floor(i / BATCH_SIZE) + 1}: ${fetchErr.message}`);
        continue;
      }

      const existingMap = new Map<string, any>();
      existingProducts?.forEach((p) => {
        existingMap.set(p.reference.toUpperCase(), p);
      });

      // Track missing references
      batchRefs.forEach((r) => {
        if (!existingMap.has(r)) {
          notFoundRefs.push(originalRefByUpper.get(r) || r);
        }
      });

      // Prepare merged records
      const productsToUpsert: any[] = [];

      existingProducts?.forEach((current) => {
        const upper = current.reference.toUpperCase();
        const change = changesByRef.get(upper);
        if (!change) return;

        const updated: any = {
          ...current,
          updated_at: new Date().toISOString(),
        };

        if (change.price !== undefined) updated.price = change.price;
        if (change.quantity !== undefined) updated.quantity = change.quantity;
        if (change.description !== undefined) updated.description = change.description;
        if (change.code !== undefined) updated.code = change.code;
        if (change.material !== undefined) updated.material = change.material;
        if (change.gender !== undefined) updated.gender = change.gender;
        if (change.sale_type !== undefined) updated.sale_type = change.sale_type;
        if (change.eye_size !== undefined) updated.eye_size = change.eye_size;
        if (change.flex !== undefined) updated.flex = change.flex;

        if (change.brandName) {
          const bSlug = change.brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const bId = brandMap.get(change.brandName) || brandMap.get(bSlug);
          if (bId) updated.brand_id = bId;
        }

        if (change.categoryName) {
          const cSlug = change.categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const cId = categoryMap.get(change.categoryName.toUpperCase()) || categoryMap.get(cSlug);
          if (cId) updated.category_id = cId;
        }

        if (change.imageUrl) {
          updated.thumbnail_url = change.imageUrl;
          updated.large_image_url = change.imageUrl;
        }

        productsToUpsert.push(updated);
      });

      if (productsToUpsert.length > 0) {
        const { error: upErr } = await supabase
          .from('products')
          .upsert(productsToUpsert, { onConflict: 'reference' });

        if (upErr) {
          errors.push(`Error actualizando lote ${Math.floor(i / BATCH_SIZE) + 1}: ${upErr.message}`);
        } else {
          totalUpdated += productsToUpsert.length;
        }
      }
    }

    return NextResponse.json({
      success: errors.length === 0,
      updatedCount: totalUpdated,
      notFoundCount: notFoundRefs.length,
      notFoundReferences: notFoundRefs.slice(0, 50),
      totalRows: rows.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `Actualización masiva completada: ${totalUpdated} productos actualizados con éxito.${notFoundRefs.length > 0 ? ` (${notFoundRefs.length} referencias no se encontraron en la base de datos).` : ''}`,
    });
  } catch (error) {
    console.error('[Bulk Update CSV] Unexpected error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno al actualizar productos masivamente.' },
      { status: 500 }
    );
  }
}
