'use client';

import React from 'react';
import { Image, Upload, AlertCircle, HardDrive } from 'lucide-react';

export default function AdminImagesPage() {
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>🖼️ Gestión de Imágenes & Amazon S3</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Almacenamiento de fotografías de productos y detección de referencias sin imagen.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.8rem', backgroundColor: 'var(--blue-light)', borderRadius: '50%', color: 'var(--blue)' }}>
              <HardDrive size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Almacenamiento Conectado</h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Amazon S3 Bucket / Supabase Storage</span>
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>12,890 Imágenes</div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.8rem', backgroundColor: '#FEE2E2', borderRadius: '50%', color: '#DC2626' }}>
              <AlertCircle size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Pendientes de Imagen</h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Productos en catálogo sin foto</span>
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#DC2626' }}>1,576 Productos</div>
        </div>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Carga Masiva de Fotografías S3</h3>
        <div style={{ border: '2px dashed var(--border-medium)', borderRadius: 'var(--radius-lg)', padding: '3rem', textAlign: 'center' }}>
          <Upload size={42} color="var(--blue)" style={{ marginBottom: '1rem' }} />
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Arrastra tus archivos de imagen aquí</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Los nombres de archivo deben coincidir con la Referencia o Código del producto (Ej: Koroit012345E.jpg)</p>
        </div>
      </div>
    </div>
  );
}
