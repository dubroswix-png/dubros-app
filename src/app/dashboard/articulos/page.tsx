'use client';

import React, { useState } from 'react';
import { Tag, Upload, Plus, FileSpreadsheet, CheckCircle2, RefreshCw, AlertCircle, Cloud, Search, Save, Download, Edit3, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface SyncResult {
  totalFromERP: number;
  totalProcessed: number;
  brandsCreated: number;
  categoriesCreated: number;
  fetchTimeMs: number;
  totalTimeMs: number;
  errors?: string[];
}

export default function AdminArticlesPage() {
  const [activeTab, setActiveTab] = useState<'create' | 'bulk' | 'update-bulk' | 'sync'>('create');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Single Product Create state
  const [formData, setFormData] = useState({
    reference: '',
    code: '',
    description: '',
    price: '',
    eyeSize: '',
    brand: 'LCT',
    material: 'Titanio',
    gender: 'Unisex',
    saleType: 'PIEZA',
    category: 'Aros Ópticos',
    quantity: '100',
    imageUrl: '/images/product-placeholder.png',
  });
  const [savingProduct, setSavingProduct] = useState(false);
  const [formResult, setFormResult] = useState<{ success: boolean; message: string } | null>(null);

  // ERP Sync state
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncProgress, setSyncProgress] = useState<{
    currentPage: number;
    totalPages: number;
    totalFromERP: number;
    totalProcessed: number;
  } | null>(null);

  // CSV Bulk Import state
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvRows, setCsvRows] = useState<Record<string, string>[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    count?: number;
    message?: string;
    brandsCreated?: number;
    categoriesCreated?: number;
    error?: string;
  } | null>(null);

  const parseCSV = (text: string): Record<string, string>[] => {
    const lines = text
      .split(/\r\n|\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length < 2) return [];

    const splitCSVLine = (str: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < str.length; i++) {
        const char = str[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim().replace(/^"|"$/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim().replace(/^"|"$/g, ''));
      return result;
    };

    const headers = splitCSVLine(lines[0]);
    const rows: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = splitCSVLine(lines[i]);
      if (values.length === 0 || (values.length === 1 && !values[0])) continue;
      const row: Record<string, string> = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx] || '';
      });
      rows.push(row);
    }

    return rows;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFile(file);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const rows = parseCSV(text);
        setCsvRows(rows);
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleBulkImport = async () => {
    if (csvRows.length === 0) {
      setImportResult({ success: false, error: 'Por favor selecciona un archivo CSV válido con filas de datos.' });
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/admin/bulk-import-csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({ rows: csvRows }),
      });

      const data = await res.json();
      if (!res.ok) {
        setImportResult({ success: false, error: data.error || 'Error en la importación masiva.' });
      } else {
        setImportResult({
          success: true,
          count: data.count,
          message: data.message,
          brandsCreated: data.brandsCreated,
          categoriesCreated: data.categoriesCreated,
        });
      }
    } catch (err) {
      setImportResult({ success: false, error: 'Error de red conectando con el servidor.' });
    } finally {
      setImporting(false);
    }
  };

  // CSV Bulk Update state
  const [updateCsvFile, setUpdateCsvFile] = useState<File | null>(null);
  const [updateCsvRows, setUpdateCsvRows] = useState<Record<string, string>[]>([]);
  const [updatingBulk, setUpdatingBulk] = useState(false);
  const [updateBulkResult, setUpdateBulkResult] = useState<{
    success: boolean;
    updatedCount?: number;
    notFoundCount?: number;
    notFoundReferences?: string[];
    message?: string;
    error?: string;
  } | null>(null);

  const handleUpdateFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUpdateCsvFile(file);
    setUpdateBulkResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const rows = parseCSV(text);
        setUpdateCsvRows(rows);
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleBulkUpdate = async () => {
    if (updateCsvRows.length === 0) {
      setUpdateBulkResult({ success: false, error: 'Por favor selecciona un archivo CSV válido con filas para actualizar.' });
      return;
    }

    setUpdatingBulk(true);
    setUpdateBulkResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/admin/bulk-update-csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({ rows: updateCsvRows }),
      });

      const data = await res.json();
      if (!res.ok) {
        setUpdateBulkResult({ success: false, error: data.error || 'Error en la actualización masiva.' });
      } else {
        setUpdateBulkResult({
          success: true,
          updatedCount: data.updatedCount,
          notFoundCount: data.notFoundCount,
          notFoundReferences: data.notFoundReferences,
          message: data.message,
        });
      }
    } catch (err) {
      setUpdateBulkResult({ success: false, error: 'Error de red conectando con el servidor.' });
    } finally {
      setUpdatingBulk(false);
    }
  };

  const downloadUpdateTemplate = () => {
    const csvContent = 'Referencia,Precio,Cantidad,Descripcion\n1312D,5.50,15,LENTES DE SOL METAL S-M\n1312GD,6.20,20,AROS OPTICOS PASTA\nDAVISTA251011C3,3.00,10,AROS OPTICOS METAL DAVISTA\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'plantilla_actualizacion_productos.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSyncERP = async () => {
    setSyncing(true);
    setSyncResult(null);
    setSyncError(null);
    setSyncProgress(null);

    const startTime = Date.now();

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setSyncError('No hay sesión activa. Inicia sesión como administrador.');
        setSyncing(false);
        return;
      }

      let currentPage = 1;
      let totalPages = 1;
      let totalProcessed = 0;
      let totalFromERP = 0;
      let totalBrands = 0;
      let totalCategories = 0;
      const allErrors: string[] = [];

      while (currentPage <= totalPages) {
        setSyncProgress({
          currentPage,
          totalPages,
          totalFromERP,
          totalProcessed,
        });

        const response = await fetch('/api/admin/sync-erp', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ page: currentPage }),
        });

        const responseText = await response.text();
        let data: any = {};
        try {
          data = JSON.parse(responseText);
        } catch {
          throw new Error(`El servidor devolvió una respuesta no válida (HTTP ${response.status}). Verifica los logs del servidor.`);
        }

        if (!response.ok) {
          throw new Error(data.error || `Error sincronizando la página ${currentPage} (HTTP ${response.status})`);
        }

        totalPages = data.totalPages || 1;
        totalFromERP = data.totalFromERP || 0;
        totalProcessed += data.processedThisPage || 0;
        totalBrands += data.brandsCreated || 0;
        totalCategories += data.categoriesCreated || 0;
        if (data.errors) allErrors.push(...data.errors);

        currentPage++;
      }

      const totalTimeMs = Date.now() - startTime;

      setSyncResult({
        totalFromERP,
        totalProcessed,
        brandsCreated: totalBrands,
        categoriesCreated: totalCategories,
        fetchTimeMs: totalTimeMs,
        totalTimeMs,
        errors: allErrors.length > 0 ? allErrors : undefined,
      });
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : 'Error de conexión durante la sincronización');
    } finally {
      setSyncing(false);
      setSyncProgress(null);
    }
  };

  const [searchingProduct, setSearchingProduct] = useState(false);

  const handleSearchExistingProduct = async () => {
    if (!formData.reference.trim()) {
      setFormResult({ success: false, message: 'Ingresa una referencia para buscar.' });
      return;
    }

    setSearchingProduct(true);
    setFormResult(null);

    try {
      const ref = formData.reference.trim().toUpperCase();
      const { data, error } = await supabase
        .from('products')
        .select('*, brands(name), categories(name)')
        .or(`reference.ilike.${ref},code.ilike.${ref}`)
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        setFormResult({
          success: false,
          message: `No se encontró ningún artículo existente con la referencia "${ref}". Puedes crearlo completando el formulario.`,
        });
      } else {
        setFormData({
          reference: data.reference || ref,
          code: data.code || ref,
          description: data.description || '',
          price: String(data.price || ''),
          eyeSize: data.eye_size ? String(data.eye_size) : '',
          brand: data.brands?.name || 'LCT',
          material: data.material || 'Acetato',
          gender: data.gender || 'Unisex',
          saleType: data.sale_type || 'PIEZA',
          category: data.categories?.name || 'Aros Ópticos',
          quantity: String(data.quantity ?? '100'),
          imageUrl: data.thumbnail_url || '/images/product-placeholder.png',
        });
        setFormResult({
          success: true,
          message: `Artículo "${data.reference}" cargado. Modifica los campos que desees y haz clic en "Guardar / Actualizar Artículo".`,
        });
      }
    } catch (err: any) {
      setFormResult({ success: false, message: err?.message || 'Error al buscar artículo.' });
    } finally {
      setSearchingProduct(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.reference || !formData.price || !formData.description) {
      setFormResult({ success: false, message: 'Por favor completa los campos obligatorios: Referencia, Descripción y Precio.' });
      return;
    }

    setSavingProduct(true);
    setFormResult(null);

    try {
      // 1. Upsert Brand (using slug for unique conflict)
      let brandId: string | null = null;
      if (formData.brand) {
        const brandSlug = formData.brand.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const { data: brandData } = await supabase
          .from('brands')
          .upsert({ name: formData.brand.toUpperCase(), slug: brandSlug, active: true }, { onConflict: 'slug' })
          .select('id')
          .single();
        brandId = brandData?.id || null;
      }

      // 2. Upsert Category (using slug for unique conflict)
      let categoryId: string | null = null;
      if (formData.category) {
        const catSlug = formData.category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const { data: catData } = await supabase
          .from('categories')
          .upsert({ name: formData.category, slug: catSlug }, { onConflict: 'slug' })
          .select('id')
          .single();
        categoryId = catData?.id || null;
      }

      // 3. Upsert Product (create if new, update if exists)
      const { error } = await supabase.from('products').upsert(
        {
          reference: formData.reference.trim(),
          code: (formData.code || formData.reference).trim(),
          description: formData.description.trim(),
          price: parseFloat(formData.price) || 0,
          eye_size: parseInt(formData.eyeSize, 10) || null,
          material: formData.material,
          gender: formData.gender,
          sale_type: formData.saleType,
          quantity: parseInt(formData.quantity, 10) || 0,
          thumbnail_url: formData.imageUrl,
          large_image_url: formData.imageUrl,
          brand_id: brandId,
          category_id: categoryId,
        },
        { onConflict: 'reference' }
      );

      if (error) {
        setFormResult({ success: false, message: `Error guardando/actualizando producto: ${error.message}` });
      } else {
        setFormResult({ success: true, message: `¡Artículo "${formData.reference}" guardado/actualizado exitosamente en el catálogo!` });
      }
    } catch (err: any) {
      setFormResult({ success: false, message: err?.message || 'Error inesperado al guardar producto.' });
    } finally {
      setSavingProduct(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Tag size={28} color="var(--blue)" /> Gestión de Artículos y Productos
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Creación y actualización individual de monturas, importación masiva por CSV y sincronización con el ERP.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('create')}
          className={activeTab === 'create' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}
        >
          <Plus size={16} /> Crear / Editar Artículo
        </button>
        <button
          onClick={() => setActiveTab('bulk')}
          className={activeTab === 'bulk' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}
        >
          <FileSpreadsheet size={16} /> Carga Masiva (Crear Productos)
        </button>
        <button
          onClick={() => setActiveTab('update-bulk')}
          className={activeTab === 'update-bulk' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}
        >
          <Edit3 size={16} /> Carga Masiva (Actualizar Productos)
        </button>
        <button
          onClick={() => setActiveTab('sync')}
          className={activeTab === 'sync' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}
        >
          <Cloud size={16} /> Sincronizar con ERP
        </button>
      </div>

      {activeTab === 'create' ? (
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>Crear o Modificar Artículo</h2>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Ingresa una referencia existente y pulsa &quot;Cargar Datos&quot; para editarlo, o escribe una nueva para crearlo.
            </span>
          </div>
          
          {formResult && (
            <div
              style={{
                marginBottom: '1.5rem',
                padding: '1rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: formResult.success ? '#DCFCE7' : '#FEE2E2',
                color: formResult.success ? '#15803D' : '#9B1C1C',
                fontWeight: 600,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              {formResult.success ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              <span>{formResult.message}</span>
            </div>
          )}

          <form onSubmit={handleSaveProduct}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 280px', gap: '2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem', display: 'block' }}>Referencia *</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Koroit012345E o DAVISTA251011C3"
                      value={formData.reference}
                      onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                      style={{ flex: 1, padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--input-border)', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }}
                    />
                    <button
                      type="button"
                      onClick={handleSearchExistingProduct}
                      disabled={searchingProduct || !formData.reference.trim()}
                      className="btn-secondary"
                      style={{ padding: '0.6rem 0.9rem', fontSize: '0.8rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                      title="Buscar y cargar datos de este artículo si ya existe en la base de datos"
                    >
                      {searchingProduct ? <RefreshCw size={14} className="spin" /> : <Search size={14} />}
                      Cargar Datos
                    </button>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem', display: 'block' }}>Código *</label>
                  <input
                    type="text"
                    placeholder="Código – Ej: 14001"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--input-border)', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem', display: 'block' }}>Descripción *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Aros ópticos..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--input-border)', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem', display: 'block' }}>Precio ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="Precio por pieza"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--input-border)', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem', display: 'block' }}>Talla Ocular</label>
                  <input
                    type="number"
                    placeholder="Ej: 52"
                    value={formData.eyeSize}
                    onChange={(e) => setFormData({ ...formData, eyeSize: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--input-border)', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem', display: 'block' }}>Marca *</label>
                  <input
                    type="text"
                    placeholder="Marca - Ej: LCT, VERONA"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--input-border)', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem', display: 'block' }}>Material *</label>
                  <select
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--input-border)', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }}
                  >
                    <option value="Titanio">Titanio</option>
                    <option value="Acetato">Acetato</option>
                    <option value="Metal">Metal</option>
                    <option value="TR90">TR90</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem', display: 'block' }}>Género *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--input-border)', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }}
                  >
                    <option value="Hombre">Hombre</option>
                    <option value="Mujer">Mujer</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem', display: 'block' }}>Tipo de Venta</label>
                  <input
                    type="text"
                    value={formData.saleType}
                    onChange={(e) => setFormData({ ...formData, saleType: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--input-border)', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem', display: 'block' }}>Categoría *</label>
                  <input
                    type="text"
                    placeholder="Ej: Aros Ópticos, Lentes de Sol"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--input-border)', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem', display: 'block' }}>URL de Imagen</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--input-border)', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: '0.8rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem', display: 'block' }}>Cantidad en Stock</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--input-border)', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={savingProduct}
                  className="btn-primary"
                  style={{ marginTop: 'auto', padding: '0.8rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  {savingProduct ? (
                    <>
                      <RefreshCw size={18} className="spin" /> Guardando...
                    </>
                  ) : (
                    <>
                      <Save size={18} /> Guardar / Actualizar Artículo
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : activeTab === 'bulk' ? (
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1rem' }}>Carga Masiva de Artículos</h2>
          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.88rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--blue)' }}>Requerimientos del Archivo CSV:</h3>
            <ul style={{ listStylePosition: 'inside', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
              <li>El archivo debe estar en formato <strong>.CSV</strong> (Delimitado por comas y UTF-8).</li>
              <li>La primera fila debe ser exactamente el nombre de la columna.</li>
              <li><strong>12 Columnas requeridas:</strong> <code>Codigo, Marca, Categoria, Descripcion, Genero, Material, Precio, Referencia, Tipo de Venta, Talla Ocular, Cantidad, Flex</code>.</li>
            </ul>
          </div>
          <label
            style={{
              border: '2px dashed var(--border-medium)',
              borderRadius: 'var(--radius-lg)',
              padding: '3rem 2rem',
              textAlign: 'center',
              marginBottom: '1.5rem',
              cursor: 'pointer',
              display: 'block',
              backgroundColor: csvFile ? '#F0F9FF' : 'transparent',
              transition: 'all 0.2s ease',
            }}
          >
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <FileSpreadsheet size={48} color="var(--blue)" style={{ marginBottom: '1rem', marginInline: 'auto' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--blue)' }}>
              {csvFile ? `📄 ${csvFile.name} (${csvRows.length} filas listas para procesar)` : 'Haz click para seleccionar archivo CSV'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
              {csvFile ? 'Haz clic aquí si deseas cambiar el archivo seleccionado' : 'Soporta archivos .csv con codificación UTF-8 (hasta 10,000 productos)'}
            </p>
          </label>

          <button
            onClick={handleBulkImport}
            disabled={importing || csvRows.length === 0}
            className="btn-primary"
            style={{
              padding: '0.9rem 2rem',
              width: '100%',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              opacity: (importing || csvRows.length === 0) ? 0.6 : 1,
            }}
          >
            {importing ? (
              <>
                <RefreshCw size={18} className="spin" /> Procesando {csvRows.length} productos...
              </>
            ) : (
              <>
                <Upload size={18} /> Importar y Actualizar {csvRows.length > 0 ? `(${csvRows.length} filas)` : 'catálogo'}
              </>
            )}
          </button>

          {importResult && (
            <div
              style={{
                marginTop: '1.5rem',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: importResult.success ? '#DCFCE7' : '#FEE2E2',
                color: importResult.success ? '#15803D' : '#9B1C1C',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            >
              {importResult.success ? <CheckCircle2 size={22} style={{ flexShrink: 0 }} /> : <AlertCircle size={22} style={{ flexShrink: 0 }} />}
              <div>
                <p style={{ margin: '0 0 0.3rem 0', fontWeight: 700 }}>
                  {importResult.success ? importResult.message : importResult.error}
                </p>
                {importResult.success && (
                  <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 500 }}>
                    Marcas nuevas creadas: <strong>{importResult.brandsCreated || 0}</strong> | Categorías nuevas creadas: <strong>{importResult.categoriesCreated || 0}</strong>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      ) : activeTab === 'update-bulk' ? (
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit3 size={24} color="var(--blue)" /> Carga Masiva para Actualizar Productos
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '0.25rem 0 0 0' }}>
                Actualiza datos de productos existentes (Precios, Stock, Descripción, etc.) haciendo match con la Referencia.
              </p>
            </div>
            <button
              onClick={downloadUpdateTemplate}
              className="btn-secondary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <FileSpreadsheet size={16} /> Descargar Plantilla CSV
            </button>
          </div>

          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.88rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--blue)' }}>Instrucciones de Actualización Masiva:</h3>
            <ul style={{ listStylePosition: 'inside', lineHeight: '1.7', color: 'var(--text-secondary)' }}>
              <li>La columna <strong>Referencia</strong> (o Codigo) es <strong>obligatoria</strong> para identificar cada producto en el catálogo.</li>
              <li><strong>Solo incluye las columnas que deseas cambiar</strong> (ej. <code>Referencia, Precio, Cantidad</code>). Las columnas que no incluyas permanecerán intactas.</li>
              <li><strong>Tus imágenes, enlaces y fechas se preservan intactas:</strong> no se borrará ninguna foto ni dato que no esté en el CSV.</li>
              <li>Columnas opcionales que puedes actualizar: <code>Precio, Cantidad (Stock), Descripcion, Marca, Categoria, Material, Genero, Tipo de Venta, Talla Ocular</code>.</li>
            </ul>
          </div>

          <label
            style={{
              border: '2px dashed var(--border-medium)',
              borderRadius: 'var(--radius-lg)',
              padding: '3rem 2rem',
              textAlign: 'center',
              marginBottom: '1.5rem',
              cursor: 'pointer',
              display: 'block',
              backgroundColor: updateCsvFile ? '#F0FDF4' : 'transparent',
              transition: 'all 0.2s ease',
            }}
          >
            <input
              type="file"
              accept=".csv"
              onChange={handleUpdateFileChange}
              style={{ display: 'none' }}
            />
            <Edit3 size={48} color={updateCsvFile ? '#16A34A' : 'var(--blue)'} style={{ marginBottom: '1rem', marginInline: 'auto' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: updateCsvFile ? '#16A34A' : 'var(--blue)' }}>
              {updateCsvFile ? `📄 ${updateCsvFile.name} (${updateCsvRows.length} productos listos para actualizar)` : 'Haz clic para seleccionar el archivo CSV de actualización'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
              {updateCsvFile ? 'Haz clic aquí si deseas seleccionar un archivo diferente' : 'Soporta archivos .csv con codificación UTF-8'}
            </p>
          </label>

          <button
            onClick={handleBulkUpdate}
            disabled={updatingBulk || updateCsvRows.length === 0}
            className="btn-primary"
            style={{
              padding: '0.9rem 2rem',
              width: '100%',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              backgroundColor: '#16A34A',
              borderColor: '#16A34A',
              opacity: (updatingBulk || updateCsvRows.length === 0) ? 0.6 : 1,
            }}
          >
            {updatingBulk ? (
              <>
                <RefreshCw size={18} className="spin" /> Actualizando {updateCsvRows.length} productos...
              </>
            ) : (
              <>
                <Save size={18} /> Aplicar Actualización Masiva {updateCsvRows.length > 0 ? `(${updateCsvRows.length} productos)` : ''}
              </>
            )}
          </button>

          {updateBulkResult && (
            <div
              style={{
                marginTop: '1.5rem',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: updateBulkResult.success ? '#DCFCE7' : '#FEE2E2',
                color: updateBulkResult.success ? '#15803D' : '#9B1C1C',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            >
              {updateBulkResult.success ? <CheckCircle2 size={22} style={{ flexShrink: 0 }} /> : <AlertCircle size={22} style={{ flexShrink: 0 }} />}
              <div style={{ width: '100%' }}>
                <p style={{ margin: '0 0 0.3rem 0', fontWeight: 700 }}>
                  {updateBulkResult.success ? updateBulkResult.message : updateBulkResult.error}
                </p>
                {updateBulkResult.success && (
                  <>
                    <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.84rem', fontWeight: 500 }}>
                      Productos actualizados con éxito: <strong>{updateBulkResult.updatedCount}</strong>
                      {updateBulkResult.notFoundCount ? (
                        <> | Referencias no encontradas en catálogo: <strong>{updateBulkResult.notFoundCount}</strong></>
                      ) : null}
                    </p>
                    {updateBulkResult.notFoundReferences && updateBulkResult.notFoundReferences.length > 0 && (
                      <div style={{ marginTop: '0.5rem', padding: '0.6rem', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', maxHeight: '120px', overflowY: 'auto' }}>
                        <span style={{ fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>Referencias no halladas:</span>
                        <code>{updateBulkResult.notFoundReferences.join(', ')}</code>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Cloud size={24} color="var(--blue)" /> Sincronización con ERP (Switch-Soft)
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Descarga todo el catálogo de productos desde tu ERP y actualiza automáticamente la base de datos.
            Este proceso puede tardar entre 15 y 60 segundos dependiendo de la conexión.
          </p>

          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.88rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--blue)' }}>¿Qué hace esta sincronización?</h3>
            <ul style={{ listStylePosition: 'inside', lineHeight: '1.8', color: 'var(--text-secondary)' }}>
              <li>Se autentica en el ERP de Dubros (Zona Libre).</li>
              <li>Descarga las <strong>28 páginas</strong> del catálogo (~13,787 productos).</li>
              <li>Crea marcas y categorías automáticamente si no existen.</li>
              <li>Actualiza precios, stock y descripciones de productos existentes.</li>
              <li>Agrega productos nuevos que aún no estén en la base de datos.</li>
            </ul>
          </div>

          <button
            onClick={handleSyncERP}
            disabled={syncing}
            className="btn-primary"
            style={{
              padding: '0.9rem 2rem',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            <RefreshCw size={18} className={syncing ? 'spin' : ''} />
            {syncing ? 'Sincronizando Catálogo ERP...' : 'Sincronizar con ERP (Switch-Soft)'}
          </button>

          {syncing && (
            <div style={{ marginTop: '1.5rem', padding: '1.25rem', backgroundColor: '#EFF6FF', borderRadius: 'var(--radius-md)', border: '1px solid #BFDBFE' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: 700, color: '#1E40AF', fontSize: '0.95rem' }}>
                  🔄 Sincronizando página {syncProgress?.currentPage || 1} de {syncProgress?.totalPages || '...'}
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1E40AF' }}>
                  {syncProgress ? `${syncProgress.totalProcessed.toLocaleString()} de ${syncProgress.totalFromERP.toLocaleString()} productos` : 'Conectando con el ERP...'}
                </span>
              </div>

              <div style={{ width: '100%', height: '10px', backgroundColor: '#DBEAFE', borderRadius: '5px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    backgroundColor: '#2563EB',
                    width: `${syncProgress?.totalPages ? Math.min(100, Math.round((syncProgress.currentPage / syncProgress.totalPages) * 100)) : 5}%`,
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>
          )}

          {syncError && (
            <div style={{
              marginTop: '1.5rem',
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#FEE2E2',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}>
              <AlertCircle size={20} /> {syncError}
            </div>
          )}

          {syncResult && (
            <div style={{ marginTop: '1.5rem' }}>
              <div style={{
                padding: '1rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#DCFCE7',
                color: '#15803D',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: 600,
                marginBottom: '1rem',
              }}>
                <CheckCircle2 size={20} /> ¡Sincronización completada exitosamente!
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--blue)' }}>{syncResult.totalFromERP.toLocaleString()}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Productos del ERP</div>
                </div>
                <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#15803D' }}>{syncResult.totalProcessed.toLocaleString()}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Procesados en Supabase</div>
                </div>
                <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#7C3AED' }}>{syncResult.brandsCreated}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Marcas Sincronizadas</div>
                </div>
                <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#EA580C' }}>{syncResult.categoriesCreated}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Categorías Sincronizadas</div>
                </div>
                <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{(syncResult.totalTimeMs / 1000).toFixed(1)}s</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Tiempo Total</div>
                </div>
              </div>

              {syncResult.errors && syncResult.errors.length > 0 && (
                <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: 'var(--radius-md)', backgroundColor: '#FEF3C7', color: '#92400E', fontSize: '0.85rem' }}>
                  <strong>Advertencias:</strong>
                  <ul style={{ marginTop: '0.5rem', listStylePosition: 'inside' }}>
                    {syncResult.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <style>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
