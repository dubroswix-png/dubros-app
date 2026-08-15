'use client';

import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Search, CheckCircle2, AlertCircle, HardDrive, RefreshCw, Eye, Sparkles, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AdminImagesPage() {
  const [testRef, setTestRef] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    reference?: string;
    exists?: boolean;
    url?: string;
    contentType?: string;
    s3Repository?: string;
    error?: string;
  } | null>(null);

  // Scanner state
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<{
    currentPage: number;
    totalPages: number;
    totalProducts: number;
    validImagesFound: number;
    placeholdersAssigned: number;
  } | null>(null);
  const [scanCompleted, setScanCompleted] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    totalProducts: 0,
    withImages: 0,
    withPlaceholder: 0,
    loading: true,
  });

  async function loadStats() {
    try {
      const [
        { count: total },
        { count: placeholders },
      ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }).or('thumbnail_url.is.null,thumbnail_url.eq./images/product-placeholder.png'),
      ]);

      const totalCount = total || 0;
      const placeholderCount = placeholders || 0;
      setStats({
        totalProducts: totalCount,
        withImages: Math.max(0, totalCount - placeholderCount),
        withPlaceholder: placeholderCount,
        loading: false,
      });
    } catch (e) {
      setStats((prev) => ({ ...prev, loading: false }));
    }
  }

  useEffect(() => {
    loadStats();
  }, []);

  // Single Image Validation
  async function handleTestImage(e: React.FormEvent) {
    e.preventDefault();
    if (!testRef.trim()) return;

    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch(`/api/admin/validate-images?reference=${encodeURIComponent(testRef.trim())}`);
      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({ error: err.message || 'Error conectando con el validador' });
    } finally {
      setTesting(false);
    }
  }

  // Batch Image Validation
  async function handleRunScan() {
    if (!confirm('Este proceso escaneará las imágenes del catálogo contra el repositorio S3 y actualizará Supabase. ¿Deseas continuar?')) {
      return;
    }

    setScanning(true);
    setScanCompleted(false);
    let currentPage = 1;
    let totalPages = 1;
    let totalValid = 0;
    let totalPlaceholders = 0;
    let totalProd = 0;

    try {
      while (currentPage <= totalPages) {
        const res = await fetch('/api/admin/validate-images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ page: currentPage, pageSize: 50 }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || `Error en lote ${currentPage}`);
        }

        totalPages = data.totalPages || 1;
        totalProd = data.totalProducts || 0;
        totalValid += data.validImagesFound || 0;
        totalPlaceholders += data.placeholdersAssigned || 0;

        setScanProgress({
          currentPage,
          totalPages,
          totalProducts: totalProd,
          validImagesFound: totalValid,
          placeholdersAssigned: totalPlaceholders,
        });

        currentPage++;
      }

      setScanCompleted(true);
      loadStats();
    } catch (err: any) {
      alert(err.message || 'Error durante el escaneo');
    } finally {
      setScanning(false);
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <ImageIcon size={28} color="var(--blue)" /> Validación de Imágenes & Repositorio S3
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Verificación de fotografías en el repositorio S3 (<code>https://dubros-image-repository.s3.us-east-1.amazonaws.com</code>)
        </p>
      </div>

      {/* KPI METRICS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ padding: '0.6rem', backgroundColor: 'var(--blue-light)', borderRadius: '50%', color: 'var(--blue)' }}>
              <HardDrive size={20} />
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Productos</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>
            {stats.loading ? '...' : stats.totalProducts.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>En base de datos</span>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ padding: '0.6rem', backgroundColor: '#DCFCE7', borderRadius: '50%', color: '#15803D' }}>
              <CheckCircle2 size={20} />
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Con Imagen S3</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#15803D' }}>
            {stats.loading ? '...' : stats.withImages.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Disponibles en el repositorio</span>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ padding: '0.6rem', backgroundColor: '#FEF3C7', borderRadius: '50%', color: '#B45309' }}>
              <AlertCircle size={20} />
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Con Placeholder</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#B45309' }}>
            {stats.loading ? '...' : stats.withPlaceholder.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Sin imagen en S3</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
        {/* VALIDATOR FORM (SINGLE REFERENCE) */}
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Search size={20} color="var(--blue)" /> Validador Individual de Referencia
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Prueba si una referencia o SKU existe en el bucket de S3: <code>GET [url]/[reference].jpg</code>
          </p>

          <form onSubmit={handleTestImage} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <input
              type="text"
              required
              placeholder="Ej: 1312D, M3562C8, 4120"
              value={testRef}
              onChange={(e) => setTestRef(e.target.value)}
              style={{
                flex: 1,
                padding: '0.7rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
              }}
            />
            <button
              type="submit"
              disabled={testing}
              className="btn-primary"
              style={{ padding: '0.7rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}
            >
              {testing ? <RefreshCw size={16} className="spin" /> : <Search size={16} />}
              Validar
            </button>
          </form>

          {testResult && (
            <div
              style={{
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: testResult.exists ? '#DCFCE7' : '#FEF3C7',
                border: `1px solid ${testResult.exists ? '#86EFAC' : '#FCD34D'}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                {testResult.exists ? <CheckCircle2 size={20} color="#15803D" /> : <AlertCircle size={20} color="#B45309" />}
                <strong style={{ color: testResult.exists ? '#15803D' : '#92400E' }}>
                  {testResult.exists ? '¡Fotografía encontrada en S3!' : 'No se encontró fotografía en S3 (Se usará placeholder)'}
                </strong>
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.5' }}>
                <div><strong>Referencia:</strong> {testResult.reference}</div>
                <div><strong>Tipo de Contenido:</strong> {testResult.contentType || 'N/A'}</div>
                <div style={{ wordBreak: 'break-all' }}>
                  <strong>URL S3:</strong>{' '}
                  <a href={testResult.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--blue)' }}>
                    {testResult.url} <ExternalLink size={12} style={{ display: 'inline' }} />
                  </a>
                </div>
              </div>

              <div style={{ width: '100%', height: '160px', backgroundColor: '#FFF', borderRadius: 'var(--radius-md)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-light)' }}>
                <img
                  src={testResult.url}
                  alt={testResult.reference || 'Preview'}
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* BATCH SCANNER */}
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} color="var(--blue)" /> Escaneo Automático del Catálogo
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Valida en lote todos los productos de Supabase contra S3 para asegurar que solo se muestren fotos existentes y placeholders limpios.
          </p>

          <button
            onClick={handleRunScan}
            disabled={scanning}
            className="btn-primary"
            style={{
              padding: '0.85rem 1.75rem',
              width: '100%',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            <RefreshCw size={18} className={scanning ? 'spin' : ''} />
            {scanning ? 'Escaneando imágenes con S3...' : 'Iniciar Validación de Catálogo Completo'}
          </button>

          {scanning && scanProgress && (
            <div style={{ marginTop: '1.5rem', padding: '1.25rem', backgroundColor: '#EFF6FF', borderRadius: 'var(--radius-md)', border: '1px solid #BFDBFE' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, color: '#1E40AF', marginBottom: '0.5rem' }}>
                <span>Lote {scanProgress.currentPage} de {scanProgress.totalPages}</span>
                <span>{Math.round((scanProgress.currentPage / scanProgress.totalPages) * 100)}%</span>
              </div>

              <div style={{ width: '100%', height: '8px', backgroundColor: '#DBEAFE', borderRadius: '4px', overflow: 'hidden', marginBottom: '1rem' }}>
                <div
                  style={{
                    height: '100%',
                    backgroundColor: '#2563EB',
                    width: `${Math.round((scanProgress.currentPage / scanProgress.totalPages) * 100)}%`,
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>

              <div style={{ fontSize: '0.8rem', color: '#1E40AF', display: 'flex', justifyContent: 'space-between' }}>
                <span>Fotos S3: <strong>{scanProgress.validImagesFound}</strong></span>
                <span>Placeholders: <strong>{scanProgress.placeholdersAssigned}</strong></span>
              </div>
            </div>
          )}

          {scanCompleted && (
            <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#DCFCE7', color: '#15803D', borderRadius: 'var(--radius-md)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={20} /> ¡Validación completada! El catálogo en Supabase fue actualizado.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
