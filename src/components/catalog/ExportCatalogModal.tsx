'use client';

import React, { useState } from 'react';
import { X, FileSpreadsheet, FileText, Check, Loader2, DollarSign, Shield, Filter } from 'lucide-react';

interface ActiveFiltersSummary {
  brand?: string;
  category?: string;
  material?: string;
  gender?: string;
  stock?: string;
  search?: string;
}

interface ExportCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalCount: number;
  currentPageCount: number;
  activeFilters: ActiveFiltersSummary;
  onExport: (
    format: 'excel' | 'pdf',
    options: { includePrice: boolean; scope: 'all' | 'page' }
  ) => Promise<void>;
}

export function ExportCatalogModal({
  isOpen,
  onClose,
  totalCount,
  currentPageCount,
  activeFilters,
  onExport,
}: ExportCatalogModalProps) {
  const [format, setFormat] = useState<'excel' | 'pdf'>('excel');
  const [includePrice, setIncludePrice] = useState(true);
  const [scope, setScope] = useState<'all' | 'page'>('all');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onExport(format, { includePrice, scope });
      onClose();
    } catch (e) {
      console.error('[ExportCatalogModal] Error exporting catalog:', e);
    } finally {
      setLoading(false);
    }
  };

  const getFilterChips = () => {
    const chips: string[] = [];
    if (activeFilters.search) chips.push(`Búsqueda: "${activeFilters.search}"`);
    if (activeFilters.brand && activeFilters.brand !== 'all') chips.push(`Marca: ${activeFilters.brand}`);
    if (activeFilters.category && activeFilters.category !== 'all') chips.push(`Categoría: ${activeFilters.category}`);
    if (activeFilters.material && activeFilters.material !== 'all') chips.push(`Material: ${activeFilters.material}`);
    if (activeFilters.gender && activeFilters.gender !== 'all') chips.push(`Género: ${activeFilters.gender}`);
    if (activeFilters.stock && activeFilters.stock !== 'all') chips.push(`Stock: ≥ ${activeFilters.stock.replace('+', '')} pcs`);
    return chips;
  };

  const chips = getFilterChips();

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '560px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid #E2E8F0',
        }}
      >
        {/* HEADER */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #E2E8F0',
            backgroundColor: '#F8FAFC',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563EB',
              }}
            >
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Generador de Catálogo Mayorista
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Shield size={12} color="#2563EB" /> Exclusivo para Administrador y Gerente
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '0.25rem',
              borderRadius: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTENT BODY */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Active filters preview */}
          <div
            style={{
              backgroundColor: '#F1F5F9',
              borderRadius: '10px',
              padding: '0.85rem 1rem',
              border: '1px solid #E2E8F0',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Filter size={13} /> Filtros activos aplicados:
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1E40AF', backgroundColor: '#DBEAFE', padding: '0.1rem 0.45rem', borderRadius: '4px' }}>
                {scope === 'all' ? totalCount : currentPageCount} artículos
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {chips.length > 0 ? (
                chips.map((c, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: '0.72rem',
                      backgroundColor: '#FFFFFF',
                      color: '#475569',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      fontWeight: 600,
                      border: '1px solid #CBD5E1',
                    }}
                  >
                    {c}
                  </span>
                ))
              ) : (
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Todos los productos (sin filtros activos)</span>
              )}
            </div>
          </div>

          {/* 1. FORMAT SELECTOR */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.5rem' }}>
              1. Formato de Exportación
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setFormat('excel')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  border: `2px solid ${format === 'excel' ? '#2563EB' : '#E2E8F0'}`,
                  backgroundColor: format === 'excel' ? '#EFF6FF' : '#FFFFFF',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ color: format === 'excel' ? '#2563EB' : '#64748B' }}>
                  <FileSpreadsheet size={24} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.88rem', color: format === 'excel' ? '#1E40AF' : '#0F172A' }}>
                    Excel (.xlsx)
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                    Tabular, referencias y stock
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat('pdf')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  border: `2px solid ${format === 'pdf' ? '#2563EB' : '#E2E8F0'}`,
                  backgroundColor: format === 'pdf' ? '#EFF6FF' : '#FFFFFF',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ color: format === 'pdf' ? '#2563EB' : '#64748B' }}>
                  <FileText size={24} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.88rem', color: format === 'pdf' ? '#1E40AF' : '#0F172A' }}>
                    PDF / Lookbook
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                    Visual con fotos y logo
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* 2. PRICE OPTION */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.5rem' }}>
              2. Modalidad de Precios
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: `1px solid ${includePrice ? '#BFDBFE' : '#E2E8F0'}`,
                  backgroundColor: includePrice ? '#EFF6FF' : '#FFFFFF',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#0F172A',
                }}
              >
                <input
                  type="radio"
                  name="price_option"
                  checked={includePrice}
                  onChange={() => setIncludePrice(true)}
                  style={{ accentColor: '#2563EB' }}
                />
                <div>
                  <strong>Con Precios Mayoristas</strong>
                  <div style={{ fontSize: '0.73rem', color: '#64748B' }}>
                    Ideal para enviar cotizaciones formales a dueños de ópticas
                  </div>
                </div>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: `1px solid ${!includePrice ? '#BFDBFE' : '#E2E8F0'}`,
                  backgroundColor: !includePrice ? '#EFF6FF' : '#FFFFFF',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#0F172A',
                }}
              >
                <input
                  type="radio"
                  name="price_option"
                  checked={!includePrice}
                  onChange={() => setIncludePrice(false)}
                  style={{ accentColor: '#2563EB' }}
                />
                <div>
                  <strong>Sin Precios</strong>
                  <div style={{ fontSize: '0.73rem', color: '#64748B' }}>
                    Ideal para que la óptica muestre los modelos a sus clientes sin revelar costos
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* 3. SCOPE SELECTOR */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.5rem' }}>
              3. Cantidad de Artículos
            </label>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="scope_option"
                  checked={scope === 'all'}
                  onChange={() => setScope('all')}
                  style={{ accentColor: '#2563EB' }}
                />
                <span>Todos los filtrados (<strong>{totalCount.toLocaleString()}</strong> refs)</span>
              </label>

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="scope_option"
                  checked={scope === 'page'}
                  onChange={() => setScope('page')}
                  style={{ accentColor: '#2563EB' }}
                />
                <span>Página actual (<strong>{currentPageCount}</strong> refs)</span>
              </label>
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid #E2E8F0',
            backgroundColor: '#F8FAFC',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{
              padding: '0.65rem 1.25rem',
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.88rem',
              color: '#475569',
              cursor: 'pointer',
            }}
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            style={{
              padding: '0.65rem 1.5rem',
              backgroundColor: '#2563EB',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '0.92rem',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
            }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Check size={16} />
                {format === 'excel' ? 'Descargar Excel' : 'Abrir Lookbook PDF'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
