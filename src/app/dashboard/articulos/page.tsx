'use client';

import React, { useState } from 'react';
import { Tag, Upload, Plus, FileSpreadsheet, CheckCircle2, RefreshCw, AlertCircle, Cloud } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'create' | 'bulk' | 'sync'>('create');
  const [uploadSuccess, setUploadSuccess] = useState(false);

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
      const res = await fetch('/api/admin/bulk-import-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `Error sincronizando la página ${currentPage}`);
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

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Tag size={28} color="var(--blue)" /> Gestión de Artículos y Productos
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Creación individual de monturas y carga masiva mediante archivo CSV.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('create')}
          className={activeTab === 'create' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}
        >
          <Plus size={16} /> Crear Producto Individual
        </button>
        <button
          onClick={() => setActiveTab('bulk')}
          className={activeTab === 'bulk' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}
        >
          <FileSpreadsheet size={16} /> Carga Masiva (CSV)
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
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.5rem' }}>Formulario de Producto</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 280px', gap: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem', display: 'block' }}>Referencia *</label>
                <input type="text" placeholder="Ej: Koroit012345E" style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--input-border)', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem', display: 'block' }}>Código *</label>
                <input type="text" placeholder="Código – Ej: 14001" style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--input-border)', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem', display: 'block' }}>Descripción *</label>
                <textarea rows={3} placeholder="Aros ópticos..." style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--input-border)', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem', display: 'block' }}>Precio ($) *</label>
                <input type="number" step="0.01" placeholder="Precio por pieza" style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--input-border)', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem', display: 'block' }}>Talla Ocular</label>
                <input type="number" placeholder="Ej: 52" style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--input-border)', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem', display: 'block' }}>Marca *</label>
                <select style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--input-border)', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }}>
                  <option>LCT</option>
                  <option>VERONA</option>
                  <option>GIORDANNI</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem', display: 'block' }}>Material *</label>
                <select style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--input-border)', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }}>
                  <option>Titanio</option>
                  <option>Acetato</option>
                  <option>Metal</option>
                  <option>TR90</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem', display: 'block' }}>Género *</label>
                <select style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--input-border)', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }}>
                  <option>Hombre</option>
                  <option>Mujer</option>
                  <option>Unisex</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem', display: 'block' }}>Tipo de Venta</label>
                <input type="text" defaultValue="PIEZA" style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--input-border)', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem', display: 'block' }}>Categoría *</label>
                <select style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--input-border)', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }}>
                  <option>Aros Ópticos</option>
                  <option>Lentes de Sol</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem', display: 'block' }}>Thumbnail (Máx 30kb)</label>
                <div style={{ border: '2px dashed var(--border-medium)', padding: '1.5rem 1rem', textAlign: 'center', borderRadius: 'var(--radius-md)' }}>
                  <Upload size={24} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Agrega imagen pequeña</span>
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem', display: 'block' }}>Imagen Grande</label>
                <input type="file" style={{ fontSize: '0.8rem' }} />
              </div>
              <button className="btn-primary" style={{ marginTop: 'auto', padding: '0.8rem', width: '100%' }}>
                Entrar / Guardar Producto
              </button>
            </div>
          </div>
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
