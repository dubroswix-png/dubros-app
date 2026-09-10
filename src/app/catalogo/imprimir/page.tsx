'use client';

import React, { useEffect, useState } from 'react';
import { Product } from '@/data/mock';
import { Printer, Eye, EyeOff, X, ArrowLeft, Loader2, Download } from 'lucide-react';

interface CatalogExportData {
  products: Product[];
  includePrice: boolean;
  filterSummary: string;
  exportDate: string;
}

export default function PrintableCatalogPage() {
  const [data, setData] = useState<CatalogExportData | null>(null);
  const [includePrice, setIncludePrice] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('dubros_catalog_export');
      if (raw) {
        const parsed: CatalogExportData = JSON.parse(raw);
        setData(parsed);
        setIncludePrice(parsed.includePrice);
      }
    } catch (e) {
      console.error('Error loading export data from session:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: '1rem' }}>
        <Loader2 size={36} className="animate-spin" color="#1A56DB" />
        <p style={{ color: '#475569', fontWeight: 600 }}>Generando catálogo en alta resolución...</p>
      </div>
    );
  }

  if (!data || !data.products || data.products.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1.5rem', maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.75rem', color: '#0F172A' }}>
          No hay datos para imprimir
        </h2>
        <p style={{ color: '#64748B', marginBottom: '2rem' }}>
          Por favor regresa al catálogo, aplica tus filtros y haz clic en &quot;Exportar Catálogo&quot;.
        </p>
        <button
          onClick={() => window.close()}
          style={{
            backgroundColor: '#1A56DB',
            color: '#FFFFFF',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Cerrar ventana
        </button>
      </div>
    );
  }

  const { products, filterSummary, exportDate } = data;

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      {/* PRINT STYLES */}
      <style jsx global>{`
        @media print {
          body {
            background-color: #FFFFFF !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .print-container {
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .catalog-print-card {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            box-shadow: none !important;
            border: 1px solid #CBD5E1 !important;
          }
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
        }
      `}</style>

      {/* TOP CONTROL BAR (Hidden on Print) */}
      <header
        className="no-print"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          padding: '0.85rem 1.5rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '0.05em', color: '#60A5FA' }}>
            DUBROS
          </span>
          <span style={{ fontSize: '0.85rem', color: '#94A3B8', borderLeft: '1px solid #334155', paddingLeft: '0.85rem' }}>
            Vista previa de impresión ({products.length} referencias)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Toggle Price */}
          <button
            onClick={() => setIncludePrice(!includePrice)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: includePrice ? '#1E293B' : '#334155',
              color: includePrice ? '#34D399' : '#CBD5E1',
              border: '1px solid #475569',
              padding: '0.45rem 0.85rem',
              borderRadius: '6px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {includePrice ? <Eye size={15} /> : <EyeOff size={15} />}
            {includePrice ? 'Precios: Visibles' : 'Precios: Ocultos'}
          </button>

          {/* Print Button */}
          <button
            onClick={() => window.print()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              padding: '0.5rem 1.25rem',
              borderRadius: '6px',
              fontSize: '0.88rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.4)',
            }}
          >
            <Printer size={16} /> Imprimir / Guardar como PDF
          </button>

          {/* Close Window */}
          <button
            onClick={() => window.close()}
            title="Cerrar vista previa"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'transparent',
              border: '1px solid #475569',
              color: '#94A3B8',
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>
      </header>

      {/* PRINTABLE CATALOG SHEET */}
      <main className="print-container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* OFFICIAL LOOKBOOK HEADER */}
        <div
          style={{
            borderBottom: '2px solid #1E3A8A',
            paddingBottom: '1.25rem',
            marginBottom: '1.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em' }}>
                DUBROS INTERNATIONAL S.A.
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0, fontWeight: 600 }}>
              Zona Libre de Colón, Manzana 18, Colón, República de Panamá
            </p>
            <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0.15rem 0 0 0' }}>
              Tel / WhatsApp: +507 6292-6554 • Email: ventas@dubros.com • Web: dubros.com
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E3A8A' }}>
              CATÁLOGO MAYORISTA
            </div>
            <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '0.2rem' }}>
              <strong>Fecha:</strong> {exportDate}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#475569' }}>
              <strong>Selección:</strong> {filterSummary} ({products.length} modelos)
            </div>
          </div>
        </div>

        {/* PRODUCTS GRID (3 columns on print, 4 on screen) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {products.map((p, idx) => (
            <div
              key={p.reference + idx}
              className="catalog-print-card"
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              {/* Product Image */}
              <div
                style={{
                  width: '100%',
                  height: '150px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.75rem',
                  border: '1px solid #F1F5F9',
                }}
              >
                <img
                  src={p.largeImageUrl || p.thumbnailUrl}
                  alt={p.reference}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  onError={(e) => { (e.target as HTMLImageElement).src = '/images/product-placeholder.png'; }}
                />
              </div>

              {/* Reference & Brand */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>
                    {p.reference}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1E40AF', textTransform: 'uppercase' }}>
                    {p.brand || 'DUBROS'}
                  </span>
                </div>

                {/* Specs */}
                <div style={{ fontSize: '0.75rem', color: '#64748B', lineHeight: '1.4', marginBottom: '0.5rem' }}>
                  <div><strong>Material:</strong> {p.material || 'N/A'}</div>
                  <div><strong>Género:</strong> {p.gender || 'Unisex'} {p.eyeSize ? `• Cal: ${p.eyeSize}` : ''} • Flex: {p.flex ? 'Sí' : 'No'}</div>
                </div>
              </div>

              {/* Badges: Stock & Price */}
              <div
                style={{
                  borderTop: '1px solid #F1F5F9',
                  paddingTop: '0.5rem',
                  marginTop: '0.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: (p.quantity || 0) > 0 ? '#065F46' : '#991B1B',
                    backgroundColor: (p.quantity || 0) > 0 ? '#D1FAE5' : '#FEE2E2',
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px',
                  }}
                >
                  Stock: {p.quantity || 0} uds
                </span>

                {includePrice && (
                  <span
                    style={{
                      fontSize: '0.92rem',
                      fontWeight: 800,
                      color: '#1E3A8A',
                    }}
                  >
                    ${Number(p.price || 0).toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* OFFICIAL FOOTER */}
        <footer
          style={{
            marginTop: '3rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid #CBD5E1',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.75rem',
            color: '#64748B',
          }}
        >
          <span>DUBROS INTERNATIONAL S.A. • Colón Free Zone • Catálogo de Uso Comercial</span>
          <span>Página generada el {exportDate}</span>
        </footer>
      </main>
    </div>
  );
}
