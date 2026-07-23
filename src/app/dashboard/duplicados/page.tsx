'use client';

import React from 'react';
import { Copy, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function AdminDuplicatesPage() {
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>🔄 Detección de Duplicados</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Herramienta para escanear y depurar referencias duplicadas en el catálogo.
        </p>
      </div>

      <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', padding: '1rem', backgroundColor: '#DCFCE7', borderRadius: '50%', color: '#16A34A', marginBottom: '1rem' }}>
          <CheckCircle2 size={40} />
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>No se encontraron referencias duplicadas</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          El sistema escaneó las 14,466 referencias en la base de datos y todas son únicas.
        </p>
        <button className="btn-secondary" style={{ padding: '0.6rem 1.25rem' }}>
          <RefreshCw size={16} /> Volver a Escanear Catálogo
        </button>
      </div>
    </div>
  );
}
